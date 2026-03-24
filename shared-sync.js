(function () {
    const DEPLOY_VERSION = "2026-03-24-shared-sync-lite";
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
    const POLL_INTERVAL_MS = 12000;

    let client = null;
    let applyingRemoteState = false;
    let pendingLocalChanges = false;
    let saveTimer = null;
    let pollTimer = null;
    let lastKnownRemoteUpdatedAt = null;

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

    async function fetchRemoteState() {
        const supabase = ensureClient();
        const sessionCode = getSessionCode();
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
        if (!hasIdentity() || applyingRemoteState || !isConfigured()) return;

        pendingLocalChanges = true;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            saveRemoteState().catch((error) => {
                console.error("Shared sync save failed:", error);
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

    function renderIdentityUi() {
        const headerDropdown = document.getElementById("headerDropdown");
        const rightHeader = document.querySelector(".rightHeader");
        if (!headerDropdown || !rightHeader) return;

        if (!document.getElementById("deployVersionBadge")) {
            const badge = document.createElement("div");
            badge.id = "deployVersionBadge";
            badge.className = "deployVersionBadge";
            badge.innerText = `Deploy ${DEPLOY_VERSION}`;
            document.body.appendChild(badge);
        }

        let summary = document.getElementById("sharedSyncSummary");
        if (!summary) {
            summary = document.createElement("div");
            summary.id = "sharedSyncSummary";
            summary.className = "sharedSyncSummary";
            headerDropdown.insertBefore(summary, headerDropdown.firstChild);
        }

        let headerCard = document.getElementById("sharedSyncHeaderCard");
        if (!headerCard) {
            headerCard = document.createElement("div");
            headerCard.id = "sharedSyncHeaderCard";
            headerCard.className = "sharedSyncHeaderCard";
            rightHeader.insertBefore(headerCard, rightHeader.querySelector(".headerMenu"));
        }

        const username = getUsername();
        const sessionCode = getSessionCode();

        summary.innerHTML = `
            <span class="syncSummaryLabel">Sesion activa</span>
            <strong class="syncSummaryValue">${username} · ${sessionCode}</strong>
            <a class="openSyncPromptBtn" href="index.html">Cambiar usuario o sesion</a>
        `;

        headerCard.innerHTML = `
            <span class="syncHeaderLabel">Sesion compartida</span>
            <strong class="syncHeaderValue">${username}</strong>
            <span class="syncHeaderMeta">Codigo: ${sessionCode}</span>
            <a class="openSyncPromptBtn" href="index.html">Cambiar sesion</a>
        `;
    }

    async function refreshRemoteState() {
        if (!hasIdentity() || !isConfigured() || applyingRemoteState || pendingLocalChanges) return;

        try {
            const remote = await fetchRemoteState();
            if (!remote?.state?.data) return;
            if (remote.updated_at && remote.updated_at !== lastKnownRemoteUpdatedAt) {
                applyShareableState(remote.state);
                lastKnownRemoteUpdatedAt = remote.updated_at;
                window.dispatchEvent(new CustomEvent("shared-sync-updated"));
            }
        } catch (error) {
            console.error("Shared sync refresh failed:", error);
        }
    }

    async function initializeRemoteState() {
        if (!hasIdentity() || !isConfigured()) return;

        const remote = await fetchRemoteState();
        if (remote?.state?.data) {
            applyShareableState(remote.state);
            lastKnownRemoteUpdatedAt = remote.updated_at || null;
        }
    }

    function startPolling() {
        clearInterval(pollTimer);
        pollTimer = window.setInterval(refreshRemoteState, POLL_INTERVAL_MS);
    }

    patchLocalStorage();

    window.sharedSyncHasSession = hasIdentity;
    window.sharedSyncRequireSession = function () {
        if (hasIdentity()) return true;
        window.location.replace("index.html");
        return false;
    };
    window.sharedSyncForceSave = function () {
        return saveRemoteState(true);
    };

    window.sharedSyncReady = (async () => {
        if (!hasIdentity()) {
            window.location.replace("index.html");
            return;
        }

        try {
            await initializeRemoteState();
        } catch (error) {
            console.error("Shared sync init failed:", error);
        }
    })();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderIdentityUi);
    } else {
        renderIdentityUi();
    }

    startPolling();
    window.addEventListener("focus", refreshRemoteState);
    window.addEventListener("beforeunload", () => {
        saveRemoteState(true).catch(() => {});
    });
})();
