(function () {
    const SESSION_KEY = "sharedCareerSessionCode";
    const SHAREABLE_EXACT_KEYS = new Set([
        "careerPlayers",
        "careerResults",
        "unlockedCategories"
    ]);
    const SHAREABLE_PREFIXES = [
        "races_",
        "drivers_",
        "championshipStarted_",
        "driverAliases_"
    ];
    const POLL_INTERVAL_MS = 8000;

    let client = null;
    let applyingRemoteState = false;
    let pendingLocalChanges = false;
    let saveTimer = null;
    let pollTimer = null;
    let realtimeChannel = null;
    let lastKnownRemoteUpdatedAt = null;
    let ui = null;

    function emitSyncUpdated() {
        window.dispatchEvent(new CustomEvent("shared-sync-updated"));
    }

    function isConfigured() {
        return Boolean(
            window.supabase &&
            window.SUPABASE_CONFIG?.url &&
            window.SUPABASE_CONFIG?.anonKey
        );
    }

    function getSessionCode() {
        return localStorage.getItem(SESSION_KEY) || "";
    }

    function hasSession() {
        return Boolean(getSessionCode());
    }

    function isShareableKey(key) {
        return SHAREABLE_EXACT_KEYS.has(key) || SHAREABLE_PREFIXES.some((prefix) => key.startsWith(prefix));
    }

    function getShareableState() {
        const data = {};

        Object.keys(localStorage).forEach((key) => {
            if (isShareableKey(key)) {
                data[key] = localStorage.getItem(key);
            }
        });

        return {
            savedAt: new Date().toISOString(),
            data
        };
    }

    function applyShareableState(state) {
        if (!state?.data) return;

        applyingRemoteState = true;

        try {
            Object.keys(localStorage).forEach((key) => {
                if (isShareableKey(key)) {
                    localStorage.removeItem(key);
                }
            });

            Object.entries(state.data).forEach(([key, value]) => {
                if (typeof value === "string") {
                    localStorage.setItem(key, value);
                }
            });
        } finally {
            applyingRemoteState = false;
        }

        emitSyncUpdated();
    }

    function ensureClient() {
        if (!isConfigured()) return null;

        if (!client) {
            client = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
        }

        return client;
    }

    function stopRealtime() {
        if (!client || !realtimeChannel) return;
        client.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }

    async function fetchRemoteState(sessionCode) {
        const supabase = ensureClient();
        if (!supabase || !sessionCode) return null;

        const { data, error } = await supabase
            .from(window.SUPABASE_CONFIG.table || "career_sessions")
            .select("session_code, state, updated_at")
            .eq("session_code", sessionCode)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async function saveRemoteState(force = false) {
        const supabase = ensureClient();
        const sessionCode = getSessionCode();

        if (!supabase || !sessionCode || applyingRemoteState) return;
        if (!force && !pendingLocalChanges) return;

        const payload = {
            session_code: sessionCode,
            state: getShareableState(),
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from(window.SUPABASE_CONFIG.table || "career_sessions")
            .upsert(payload, { onConflict: "session_code" });

        if (error) throw error;

        pendingLocalChanges = false;
        lastKnownRemoteUpdatedAt = payload.updated_at;
    }

    function scheduleSave() {
        if (!hasSession() || applyingRemoteState || !isConfigured()) return;

        pendingLocalChanges = true;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveRemoteState().catch((error) => {
                console.error("Shared sync save failed:", error);
                if (ui) {
                    ui.setStatus("No se pudo guardar en Supabase. Revisa conexión o permisos.");
                }
            });
        }, 600);
    }

    async function pollRemoteState() {
        const sessionCode = getSessionCode();
        if (!sessionCode || !isConfigured() || applyingRemoteState) return;

        try {
            if (pendingLocalChanges) {
                await saveRemoteState(true);
            }

            const remote = await fetchRemoteState(sessionCode);
            if (!remote?.state?.data) return;

            if (remote.updated_at && remote.updated_at !== lastKnownRemoteUpdatedAt) {
                applyShareableState(remote.state);
                lastKnownRemoteUpdatedAt = remote.updated_at;
            }
        } catch (error) {
            console.error("Shared sync poll failed:", error);
        }
    }

    function startRealtime() {
        const supabase = ensureClient();
        const sessionCode = getSessionCode();
        if (!supabase || !sessionCode) return;

        stopRealtime();

        realtimeChannel = supabase
            .channel(`career-sync-${sessionCode}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: window.SUPABASE_CONFIG.table || "career_sessions",
                    filter: `session_code=eq.${sessionCode}`
                },
                async () => {
                    try {
                        await pollRemoteState();
                    } catch (error) {
                        console.error("Shared sync realtime poll failed:", error);
                    }
                }
            )
            .subscribe();
    }

    function patchLocalStorage() {
        if (window.__sharedSyncPatched) return;
        window.__sharedSyncPatched = true;

        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalRemoveItem = localStorage.removeItem.bind(localStorage);

        localStorage.setItem = function (key, value) {
            originalSetItem(key, value);
            if (isShareableKey(key)) scheduleSave();
        };

        localStorage.removeItem = function (key) {
            originalRemoveItem(key);
            if (isShareableKey(key)) scheduleSave();
        };
    }

    function injectSyncUi() {
        const headerDropdown = document.getElementById("headerDropdown");
        const existingModal = document.getElementById("sharedSyncModal");
        if (!headerDropdown || existingModal) return;

        const syncButton = document.createElement("button");
        syncButton.type = "button";
        syncButton.className = "dropdownAction";
        syncButton.id = "openSharedSyncBtn";
        syncButton.innerText = "Sincronización";
        headerDropdown.insertBefore(syncButton, headerDropdown.firstChild);

        const modal = document.createElement("div");
        modal.id = "sharedSyncModal";
        modal.className = "modal hidden";
        modal.innerHTML = `
  <div class="modalContent">
    <h2>Sincronización compartida</h2>
    <p id="sharedSyncStatus" class="syncStatus hidden"></p>
    <div class="syncField">
      <label for="sharedSessionCodeInput">Código de sesión</label>
      <input type="text" id="sharedSessionCodeInput" placeholder="Ej: carrera-amigos-01" autocomplete="off">
    </div>
    <p class="syncHint">Usen el mismo código los dos para compartir exactamente el mismo progreso.</p>
    <div class="syncActions">
      <button type="button" id="closeSharedSyncBtn" class="syncSecondaryBtn">Cerrar</button>
      <button type="button" id="disconnectSharedSyncBtn" class="syncSecondaryBtn">Desconectar</button>
      <button type="button" id="saveSharedSyncBtn">Conectar</button>
    </div>
  </div>
`;

        document.body.appendChild(modal);

        const modalElement = document.getElementById("sharedSyncModal");
        const statusElement = document.getElementById("sharedSyncStatus");
        const inputElement = document.getElementById("sharedSessionCodeInput");
        const closeButton = document.getElementById("closeSharedSyncBtn");
        const disconnectButton = document.getElementById("disconnectSharedSyncBtn");
        const saveButton = document.getElementById("saveSharedSyncBtn");

        function setStatus(message, visible = true) {
            statusElement.innerText = message;
            statusElement.classList.toggle("hidden", !visible);
        }

        function openModal(required = false) {
            inputElement.value = getSessionCode();
            modalElement.dataset.required = required ? "true" : "false";
            setStatus(required ? "Ingresá primero un código de sesión para trabajar con datos compartidos." : "", required);
            modalElement.classList.remove("hidden");
            requestAnimationFrame(() => inputElement.focus());
        }

        function closeModal() {
            if (modalElement.dataset.required === "true" && !hasSession()) return;
            modalElement.classList.add("hidden");
        }

        async function connectSessionCode() {
            const sessionCode = inputElement.value.trim();

            if (!sessionCode) {
                setStatus("Ingresa un código de sesión.");
                return false;
            }

            if (!isConfigured()) {
                setStatus("Completa supabase-config.js con tu URL y publishable key antes de conectar.");
                return false;
            }

            localStorage.setItem(SESSION_KEY, sessionCode);
            setStatus("Conectando y sincronizando...");

            try {
                const remote = await fetchRemoteState(sessionCode);

                if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
                    applyShareableState(remote.state);
                    lastKnownRemoteUpdatedAt = remote.updated_at || null;
                    setStatus("Se cargó el progreso compartido. La página se va a recargar.");
                    startRealtime();
                    setTimeout(() => window.location.reload(), 700);
                    return true;
                }

                pendingLocalChanges = true;
                await saveRemoteState(true);
                startRealtime();
                setStatus("Sesión compartida conectada correctamente.");
                modalElement.classList.add("hidden");
                return true;
            } catch (error) {
                console.error("Shared sync connect failed:", error);
                setStatus("No se pudo conectar con Supabase. Revisa la tabla, la URL, la key y las políticas.");
                return false;
            }
        }

        syncButton.addEventListener("click", () => {
            openModal(false);
        });

        closeButton.addEventListener("click", closeModal);

        disconnectButton.addEventListener("click", () => {
            stopRealtime();
            localStorage.removeItem(SESSION_KEY);
            setStatus("Sesión compartida desconectada.");
            openModal(true);
        });

        saveButton.addEventListener("click", connectSessionCode);

        modalElement.addEventListener("click", (event) => {
            if (event.target === modalElement) closeModal();
        });

        ui = {
            openModal,
            closeModal,
            setStatus
        };

        if (!hasSession() && isConfigured()) {
            openModal(true);
        }
    }

    async function initializeRemoteState() {
        const sessionCode = getSessionCode();
        if (!sessionCode || !isConfigured()) return;

        const remote = await fetchRemoteState(sessionCode);
        if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
            applyShareableState(remote.state);
            lastKnownRemoteUpdatedAt = remote.updated_at || null;
        }

        startRealtime();
    }

    function startPolling() {
        clearInterval(pollTimer);
        pollRemoteState().catch((error) => {
            console.error("Shared sync initial poll failed:", error);
        });
        pollTimer = setInterval(pollRemoteState, POLL_INTERVAL_MS);
    }

    function setupLifecycleSync() {
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                pollRemoteState().catch((error) => {
                    console.error("Shared sync visible poll failed:", error);
                });
            }

            if (document.visibilityState === "hidden") {
                saveRemoteState(true).catch((error) => {
                    console.error("Shared sync flush failed:", error);
                });
            }
        });

        window.addEventListener("beforeunload", () => {
            saveRemoteState(true).catch(() => {});
        });
    }

    patchLocalStorage();

    window.sharedSyncHasSession = hasSession;
    window.sharedSyncRequireSession = function () {
        if (!isConfigured()) return true;
        if (hasSession()) return true;
        if (ui) ui.openModal(true);
        return false;
    };
    window.sharedSyncForceSave = function () {
        return saveRemoteState(true);
    };

    window.sharedSyncReady = (async () => {
        try {
            await initializeRemoteState();
        } catch (error) {
            console.error("Shared sync init failed:", error);
        }
    })();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectSyncUi);
    } else {
        injectSyncUi();
    }

    startPolling();
    setupLifecycleSync();
})();
