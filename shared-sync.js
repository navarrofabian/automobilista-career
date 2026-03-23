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

    let client = null;
    let applyingRemoteState = false;
    let saveTimer = null;

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

    async function saveRemoteState() {
        const supabase = ensureClient();
        const sessionCode = getSessionCode();
        if (!supabase || !sessionCode || applyingRemoteState) return;

        const payload = {
            session_code: sessionCode,
            state: getShareableState(),
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from(window.SUPABASE_CONFIG.table || "career_sessions")
            .upsert(payload, { onConflict: "session_code" });

        if (error) throw error;
    }

    function scheduleSave() {
        if (!getSessionCode() || applyingRemoteState || !isConfigured()) return;

        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveRemoteState().catch((error) => {
                console.error("Shared sync save failed:", error);
            });
        }, 500);
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

        function openModal() {
            inputElement.value = getSessionCode();
            setStatus("", false);
            modalElement.classList.remove("hidden");
            requestAnimationFrame(() => inputElement.focus());
        }

        function closeModal() {
            modalElement.classList.add("hidden");
        }

        syncButton.addEventListener("click", () => {
            openModal();
        });

        closeButton.addEventListener("click", closeModal);

        disconnectButton.addEventListener("click", () => {
            localStorage.removeItem(SESSION_KEY);
            setStatus("Sesión compartida desconectada.");
        });

        saveButton.addEventListener("click", async () => {
            const sessionCode = inputElement.value.trim();

            if (!sessionCode) {
                setStatus("Ingresa un código de sesión.");
                return;
            }

            if (!isConfigured()) {
                setStatus("Completa supabase-config.js con tu URL y anon key antes de conectar.");
                return;
            }

            localStorage.setItem(SESSION_KEY, sessionCode);
            setStatus("Conectando y sincronizando...");

            try {
                const remote = await fetchRemoteState(sessionCode);

                if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
                    applyShareableState(remote.state);
                    setStatus("Se cargó el progreso compartido. La página se va a recargar.");
                    setTimeout(() => window.location.reload(), 700);
                    return;
                }

                await saveRemoteState();
                setStatus("Sesión compartida conectada correctamente.");
            } catch (error) {
                console.error("Shared sync connect failed:", error);
                setStatus("No se pudo conectar con Supabase. Revisa la tabla, la URL, la anon key y las políticas.");
            }
        });

        modalElement.addEventListener("click", (event) => {
            if (event.target === modalElement) closeModal();
        });
    }

    async function initializeRemoteState() {
        const sessionCode = getSessionCode();
        if (!sessionCode || !isConfigured()) return;

        const remote = await fetchRemoteState(sessionCode);
        if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
            applyShareableState(remote.state);
        }
    }

    patchLocalStorage();

    window.sharedSyncReady = (async () => {
        try {
            await initializeRemoteState();
        } catch (error) {
            console.error("Shared sync init failed:", error);
        }
    })();

    document.addEventListener("DOMContentLoaded", () => {
        injectSyncUi();
    });
})();
