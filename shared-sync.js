(function () {
    const DEPLOY_VERSION = "2026-03-23-user-sync-v1";
    const SESSION_KEY = "sharedCareerSessionCode";
    const USER_KEY = "sharedCareerUsername";
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
    let pendingLocalChanges = false;
    let saveTimer = null;
    let ui = null;

    function isConfigured() {
        return Boolean(
            window.supabase &&
            window.SUPABASE_CONFIG?.url &&
            window.SUPABASE_CONFIG?.anonKey
        );
    }

    function getSessionCode() {
        return (localStorage.getItem(SESSION_KEY) || "").trim();
    }

    function getUsername() {
        return (localStorage.getItem(USER_KEY) || "").trim();
    }

    function hasIdentity() {
        return Boolean(getSessionCode() && getUsername());
    }

    function sameName(a, b) {
        return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
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
    }

    function scheduleSave() {
        if (!hasIdentity() || applyingRemoteState || !isConfigured()) return;

        pendingLocalChanges = true;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveRemoteState().catch((error) => {
                console.error("Shared sync save failed:", error);
                if (ui) {
                    ui.setStatus("No se pudo guardar el progreso compartido. Revisa conexión o permisos.");
                }
            });
        }, 600);
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

    function ensureUserRegistered(username) {
        const currentPlayers = JSON.parse(localStorage.getItem("careerPlayers")) || [];
        const cleanedPlayers = currentPlayers.filter((name) => String(name || "").trim());

        if (cleanedPlayers.some((name) => sameName(name, username))) {
            localStorage.setItem("careerPlayers", JSON.stringify(cleanedPlayers.slice(0, 2)));
            return { added: false, full: false, players: cleanedPlayers.slice(0, 2) };
        }

        if (cleanedPlayers.length >= 2) {
            return { added: false, full: true, players: cleanedPlayers.slice(0, 2) };
        }

        const nextPlayers = [...cleanedPlayers, username].slice(0, 2);
        localStorage.setItem("careerPlayers", JSON.stringify(nextPlayers));
        return { added: true, full: false, players: nextPlayers };
    }

    function ensureIdentityPrompt() {
        if (!isConfigured() || hasIdentity()) return;
        if (ui) {
            ui.openModal(true);
            return;
        }

        window.setTimeout(ensureIdentityPrompt, 250);
    }

    function injectSyncUi() {
        const headerDropdown = document.getElementById("headerDropdown");
        const rightHeader = document.querySelector(".rightHeader");
        const existingModal = document.getElementById("sharedSyncModal");
        if (!headerDropdown || !rightHeader || existingModal) return;

        const syncButton = document.createElement("button");
        syncButton.type = "button";
        syncButton.className = "dropdownAction";
        syncButton.id = "openSharedSyncBtn";
        syncButton.innerText = "Usuario y sesión";
        headerDropdown.insertBefore(syncButton, headerDropdown.firstChild);

        const syncSummary = document.createElement("div");
        syncSummary.id = "sharedSyncSummary";
        syncSummary.className = "sharedSyncSummary";
        headerDropdown.insertBefore(syncSummary, syncButton);

        const syncHeaderCard = document.createElement("div");
        syncHeaderCard.id = "sharedSyncHeaderCard";
        syncHeaderCard.className = "sharedSyncHeaderCard";
        rightHeader.insertBefore(syncHeaderCard, rightHeader.querySelector(".headerMenu"));

        const modal = document.createElement("div");
        modal.id = "sharedSyncModal";
        modal.className = "modal hidden";
        modal.innerHTML = `
  <div class="modalContent sharedSyncModalContent">
    <span class="syncKicker">Modo compartido</span>
    <h2>Entrar a la sesión</h2>
    <p class="syncIntro">Ingresá tu nombre de usuario y el código de sincronización. Si tu nombre todavía no está en esta carrera, se agrega automáticamente como jugador.</p>
    <p id="sharedSyncStatus" class="syncStatus hidden"></p>
    <div class="syncField">
      <label for="sharedUsernameInput">Nombre de usuario</label>
      <input type="text" id="sharedUsernameInput" placeholder="Ej: Fabian" autocomplete="off">
    </div>
    <div class="syncField">
      <label for="sharedSessionCodeInput">Código de sincronización</label>
      <input type="text" id="sharedSessionCodeInput" placeholder="Ej: carrera-amigos-01" autocomplete="off">
    </div>
    <div class="syncInfoCard">
      <strong>Cómo funciona</strong>
      <span>Si el usuario ya estaba registrado, solo carga el progreso compartido. Si no estaba, intenta sumarlo a los pilotos del campeonato.</span>
    </div>
    <div class="syncActions">
      <button type="button" id="closeSharedSyncBtn" class="syncSecondaryBtn">Cerrar</button>
      <button type="button" id="disconnectSharedSyncBtn" class="syncSecondaryBtn">Salir de la sesión</button>
      <button type="button" id="saveSharedSyncBtn">Entrar</button>
    </div>
  </div>
`;

        document.body.appendChild(modal);

        let versionBadge = document.getElementById("deployVersionBadge");
        if (!versionBadge) {
            versionBadge = document.createElement("div");
            versionBadge.id = "deployVersionBadge";
            versionBadge.className = "deployVersionBadge";
            versionBadge.innerText = `Deploy ${DEPLOY_VERSION}`;
            document.body.appendChild(versionBadge);
        }

        const modalElement = document.getElementById("sharedSyncModal");
        const headerCardElement = document.getElementById("sharedSyncHeaderCard");
        const summaryElement = document.getElementById("sharedSyncSummary");
        const statusElement = document.getElementById("sharedSyncStatus");
        const usernameInput = document.getElementById("sharedUsernameInput");
        const sessionInput = document.getElementById("sharedSessionCodeInput");
        const closeButton = document.getElementById("closeSharedSyncBtn");
        const disconnectButton = document.getElementById("disconnectSharedSyncBtn");
        const saveButton = document.getElementById("saveSharedSyncBtn");

        function updateSummary() {
            const username = getUsername();
            const sessionCode = getSessionCode();

            if (!username || !sessionCode) {
                summaryElement.innerHTML = `
                    <span class="syncSummaryLabel">Sin conexión</span>
                    <strong class="syncSummaryValue">Ingresá usuario y código para compartir el progreso.</strong>
                `;
                headerCardElement.innerHTML = `
                    <span class="syncHeaderLabel">Sesión compartida</span>
                    <strong class="syncHeaderValue">Sin conectar</strong>
                    <span class="syncHeaderMeta">Todavía no ingresaste usuario ni código.</span>
                `;
                return;
            }

            summaryElement.innerHTML = `
                <span class="syncSummaryLabel">Sesión activa</span>
                <strong class="syncSummaryValue">${username} · ${sessionCode}</strong>
            `;
            headerCardElement.innerHTML = `
                <span class="syncHeaderLabel">Sesión compartida</span>
                <strong class="syncHeaderValue">${username}</strong>
                <span class="syncHeaderMeta">Código: ${sessionCode}</span>
            `;
        }

        function setStatus(message, visible = true, tone = "") {
            statusElement.innerText = message;
            statusElement.className = `syncStatus${visible ? "" : " hidden"}${tone ? ` ${tone}` : ""}`;
        }

        function openModal(required = false) {
            usernameInput.value = getUsername();
            sessionInput.value = getSessionCode();
            modalElement.dataset.required = required ? "true" : "false";
            setStatus(required ? "Completá usuario y código de sincronización antes de seguir." : "", required);
            modalElement.classList.remove("hidden");
            requestAnimationFrame(() => {
                if (!usernameInput.value) usernameInput.focus();
                else sessionInput.focus();
            });
        }

        function closeModal() {
            if (modalElement.dataset.required === "true" && !hasIdentity()) return;
            modalElement.classList.add("hidden");
        }

        async function connectIdentity() {
            const username = usernameInput.value.trim();
            const sessionCode = sessionInput.value.trim();

            if (!username) {
                setStatus("Ingresá tu nombre de usuario.");
                return false;
            }

            if (!sessionCode) {
                setStatus("Ingresá el código de sincronización.");
                return false;
            }

            if (!isConfigured()) {
                setStatus("Completa supabase-config.js con tu URL y publishable key antes de conectar.");
                return false;
            }

            localStorage.setItem(USER_KEY, username);
            localStorage.setItem(SESSION_KEY, sessionCode);
            updateSummary();
            setStatus("Conectando y sincronizando...");

            try {
                const remote = await fetchRemoteState(sessionCode);

                if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
                    applyShareableState(remote.state);
                }

                const registration = ensureUserRegistered(username);
                pendingLocalChanges = true;
                await saveRemoteState(true);

                updateSummary();

                if (registration.full) {
                    setStatus("La sesión ya tenía dos jugadores registrados. Se sincronizó el progreso, pero tu usuario no se agregó como piloto.", true, "warning");
                    modalElement.classList.add("hidden");
                    window.setTimeout(() => window.location.reload(), 250);
                    return true;
                }

                if (registration.added) {
                    setStatus("Usuario agregado al campeonato y progreso sincronizado.", true, "success");
                } else {
                    setStatus("Usuario reconocido. Progreso sincronizado correctamente.", true, "success");
                }

                modalElement.classList.add("hidden");
                window.setTimeout(() => window.location.reload(), 250);
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
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(SESSION_KEY);
            updateSummary();
            setStatus("Se cerró la sesión compartida.");
            openModal(true);
        });

        saveButton.addEventListener("click", connectIdentity);

        modalElement.addEventListener("click", (event) => {
            if (event.target === modalElement) closeModal();
        });

        modalElement.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                connectIdentity();
            }
        });

        ui = {
            openModal,
            closeModal,
            setStatus,
            updateSummary
        };

        updateSummary();

        if (!hasIdentity() && isConfigured()) {
            openModal(true);
        }
    }

    async function initializeRemoteState() {
        const sessionCode = getSessionCode();
        const username = getUsername();
        if (!sessionCode || !isConfigured()) return;

        const remote = await fetchRemoteState(sessionCode);
        if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
            applyShareableState(remote.state);
        }

        if (username) {
            const registration = ensureUserRegistered(username);
            if (registration.added) {
                pendingLocalChanges = true;
                await saveRemoteState(true);
            }
        }
    }

    patchLocalStorage();

    window.sharedSyncHasSession = hasIdentity;
    window.sharedSyncRequireSession = function () {
        if (!isConfigured()) return true;
        if (hasIdentity()) return true;
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
        document.addEventListener("DOMContentLoaded", () => {
            injectSyncUi();
            ensureIdentityPrompt();
        });
    } else {
        injectSyncUi();
        ensureIdentityPrompt();
    }

    window.addEventListener("load", ensureIdentityPrompt);
})();
