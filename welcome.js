(function () {
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

    const usernameInput = document.getElementById("welcomeUsernameInput");
    const sessionInput = document.getElementById("welcomeSessionInput");
    const status = document.getElementById("welcomeStatus");
    const startButton = document.getElementById("startCareerBtn");

    let client = null;
    let applyingRemoteState = false;

    function setStatus(message, tone = "") {
        status.innerText = message;
        status.className = `welcomeStatus${message ? "" : " hidden"}${tone ? ` ${tone}` : ""}`;
    }

    function ensureClient() {
        if (!window.supabase || !window.SUPABASE_CONFIG?.url || !window.SUPABASE_CONFIG?.anonKey) {
            return null;
        }

        if (!client) {
            client = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
        }

        return client;
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

    function ensureUserRegistered(username) {
        const currentPlayers = JSON.parse(localStorage.getItem("careerPlayers")) || [];
        const cleanedPlayers = currentPlayers.filter((name) => String(name || "").trim());

        if (cleanedPlayers.some((name) => sameName(name, username))) {
            localStorage.setItem("careerPlayers", JSON.stringify(cleanedPlayers.slice(0, 2)));
            return { added: false, full: false };
        }

        if (cleanedPlayers.length >= 2) {
            return { added: false, full: true };
        }

        localStorage.setItem("careerPlayers", JSON.stringify([...cleanedPlayers, username].slice(0, 2)));
        return { added: true, full: false };
    }

    async function fetchRemoteState(sessionCode) {
        const supabase = ensureClient();
        if (!supabase) throw new Error("Supabase no configurado");

        const { data, error } = await supabase
            .from(window.SUPABASE_CONFIG.table || "career_sessions")
            .select("session_code, state, updated_at")
            .eq("session_code", sessionCode)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async function saveRemoteState(sessionCode) {
        const supabase = ensureClient();
        if (!supabase) throw new Error("Supabase no configurado");

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

    async function connectCareer() {
        const username = usernameInput.value.trim();
        const sessionCode = sessionInput.value.trim();

        if (!username) {
            setStatus("Ingresá tu nombre de usuario.");
            return;
        }

        if (!sessionCode) {
            setStatus("Ingresá el código de sincronización.");
            return;
        }

        if (!ensureClient()) {
            setStatus("Supabase no está configurado correctamente.");
            return;
        }

        localStorage.setItem(USER_KEY, username);
        localStorage.setItem(SESSION_KEY, sessionCode);
        setStatus("Conectando y preparando el modo carrera...");

        try {
            const remote = await fetchRemoteState(sessionCode);

            if (remote?.state?.data && Object.keys(remote.state.data).length > 0) {
                applyShareableState(remote.state);
            }

            const registration = ensureUserRegistered(username);
            await saveRemoteState(sessionCode);

            if (registration.full) {
                setStatus("La sesión ya tenía dos jugadores. Se cargó el progreso, pero tu usuario no se sumó como piloto.", "warning");
            } else if (registration.added) {
                setStatus("Usuario agregado al campeonato. Entrando al modo carrera...", "success");
            } else {
                setStatus("Usuario reconocido. Cargando el progreso compartido...", "success");
            }

            window.setTimeout(() => {
                window.location.href = "career.html";
            }, 500);
        } catch (error) {
            console.error("Welcome sync failed:", error);
            setStatus("No se pudo conectar con Supabase. Revisá la configuración y la tabla compartida.");
        }
    }

    usernameInput.value = (localStorage.getItem(USER_KEY) || "").trim();
    sessionInput.value = (localStorage.getItem(SESSION_KEY) || "").trim();

    startButton.addEventListener("click", connectCareer);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            connectCareer();
        }
    });
})();
