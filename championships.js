(async function () {
await (window.sharedSyncReady || Promise.resolve());

const currentCategory = localStorage.getItem("currentCategory");
const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const startChampionshipBtn = document.getElementById("startChampionshipBtn");
const resetChampionshipBtn = document.getElementById("resetChampionshipBtn");
const addRaceBtn = document.getElementById("addRaceBtn");
const raceSelectorContainer = document.getElementById("raceSelectorContainer");
const raceSelectorGrid = document.getElementById("raceSelectorGrid");
const raceListContainer = document.getElementById("raceList");
const closeRaceSelectorBtn = document.getElementById("closeRaceSelector");
const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const headerMenuBtn = document.getElementById("headerMenuBtn");
const headerDropdown = document.getElementById("headerDropdown");
const editPlayersBtn = document.getElementById("editPlayersBtn");
const resetCareerBtn = document.getElementById("resetCareerBtn");
const playerModal = document.getElementById("playerModal");
const player1Input = document.getElementById("player1Input");
const player2Input = document.getElementById("player2Input");
const savePlayersBtn = document.getElementById("savePlayersBtn");
const resultsModal = document.getElementById("resultsModal");
const resultsModalSubtitle = document.getElementById("resultsModalSubtitle");
const resultsForm = document.getElementById("resultsForm");
const saveResultsBtn = document.getElementById("saveResultsBtn");
const closeResultsModalBtn = document.getElementById("closeResultsModalBtn");
const ocrImageInput = document.getElementById("ocrImageInput");
const ocrStatus = document.getElementById("ocrStatus");
const playerDetectModal = document.getElementById("playerDetectModal");
const playerDetectList = document.getElementById("playerDetectList");
const closePlayerDetectBtn = document.getElementById("closePlayerDetectBtn");
const savePlayerDetectBtn = document.getElementById("savePlayerDetectBtn");
const categoryHero = document.getElementById("categoryHero");
const categoryHeroImage = document.getElementById("categoryHeroImage");
const categoryHeroIcon = document.getElementById("categoryHeroIcon");
const categoryHeroTitle = document.getElementById("categoryHeroTitle");
const heroStatus = document.getElementById("heroStatus");
const heroRounds = document.getElementById("heroRounds");
const heroProgress = document.getElementById("heroProgress");
const heroTeamPosition = document.getElementById("heroTeamPosition");
const teamAverage = document.getElementById("teamAverage");
const teamPosition = document.getElementById("teamPosition");
const teamDriver1 = document.getElementById("teamDriver1");
const teamDriver2 = document.getElementById("teamDriver2");
const teamDriver1Pts = document.getElementById("teamDriver1Pts");
const teamDriver2Pts = document.getElementById("teamDriver2Pts");
const teamDriver1Bar = document.getElementById("teamDriver1Bar");
const teamDriver2Bar = document.getElementById("teamDriver2Bar");

raceSelectorContainer.classList.add("hidden");

let coopDrivers = JSON.parse(localStorage.getItem("careerPlayers")) || ["Vacío", "Vacío"];
let championshipStarted = localStorage.getItem("championshipStarted_" + currentCategory) === "true";
let championshipRaces = JSON.parse(localStorage.getItem("races_" + currentCategory)) || [];
let drivers = JSON.parse(localStorage.getItem("drivers_" + currentCategory)) || [];
let activeResultsRaceIndex = null;
let pendingDetectedHumans = [];
const OCR_ENDPOINT = window.location.hostname === "localhost"
    ? "http://localhost:3000/upload"
    : "/.netlify/functions/upload";
const DRIVER_ALIASES_KEY = "driverAliases_" + currentCategory;
let driverAliasMap = JSON.parse(localStorage.getItem(DRIVER_ALIASES_KEY)) || {};

function getCategoryMeta(categoryName) {
    for (const level of career) {
        for (const branch of level.branches) {
            const match = branch.categories.find((category) => category.name === categoryName);
            if (match) return match;
        }
    }

    return null;
}

function saveDriverAliasMap() {
    localStorage.setItem(DRIVER_ALIASES_KEY, JSON.stringify(driverAliasMap));
}

function comparisonKey(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[“”"'`´]+/g, "")
        .replace(/\(\s*ia\s*\)/gi, "")
        .replace(/\bia\b/gi, "")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function sanitizeEnteredName(rawName) {
    if (!rawName) return "";

    const hasIaMarker = /\(\s*ia\s*\)|\bia\b/i.test(rawName);
    let cleaned = rawName
        .replace(/[“”]/g, "\"")
        .replace(/[‘’]/g, "'")
        .replace(/^\s*\d+[\).\-\s]+/, "")
        .replace(/\b(p\d+|pos\.?\s*\d+)\b/gi, "")
        .replace(/\b\d{1,4}\s*(pts?|point?s?)\b/gi, "")
        .replace(/\b(best|lap|time|gap|class|total|laps?)\b.*$/gi, "")
        .replace(/[|\\/_]+/g, " ")
        .replace(/[^\p{L}\p{N}\s()'".,-]/gu, " ")
        .replace(/^[\s"'`.,;:!?-]+|[\s"'`.,;:!?-]+$/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    cleaned = cleaned.replace(/\(\s*ia\s*\)/gi, "").replace(/\bia\b/gi, "").replace(/\s{2,}/g, " ").trim();

    if (!cleaned) return "";

    return hasIaMarker ? `${cleaned} (IA)` : cleaned;
}

function renderCategoryHero() {
    const categoryMeta = getCategoryMeta(currentCategory);

    if (!currentCategory) {
        categoryHero.hidden = true;
        return;
    }

    categoryHeroTitle.innerText = currentCategory;

    if (categoryMeta?.img) {
        categoryHeroImage.src = categoryMeta.img;
        categoryHeroImage.alt = currentCategory;
    }

    if (categoryMeta?.icon) {
        categoryHeroIcon.src = categoryMeta.icon;
        categoryHeroIcon.alt = `${currentCategory} icono`;
    }
}

function syncHeaderPlayers() {
    player1Name.innerText = coopDrivers?.[0] || "Vacío";
    player2Name.innerText = coopDrivers?.[1] || "Vacío";
}

function preloadPlayerInputs() {
    player1Input.value = coopDrivers?.[0] || "";
    player2Input.value = coopDrivers?.[1] || "";
}

function openPlayerModal() {
    playerModal.classList.remove("hidden");
    requestAnimationFrame(() => player1Input.focus());
}

function closePlayerModal() {
    playerModal.classList.add("hidden");
}

function openResultsModal(raceIndex) {
    const race = championshipRaces[raceIndex];
    activeResultsRaceIndex = raceIndex;
    resultsModalSubtitle.innerText = `Fecha ${raceIndex + 1}: ${race.trackName} - ${race.layoutName}`;
    resultsForm.innerHTML = "";

    const suggestedDrivers = [...new Set([
        ...drivers.map((driver) => driver.name),
        ...coopDrivers
    ])];

    const rows = Math.max(2, suggestedDrivers.length || 2);
    ocrStatus.innerText = "";
    ocrStatus.classList.add("hidden");
    ocrImageInput.value = "";

    for (let position = 0; position < rows; position++) {
        const row = document.createElement("div");
        row.className = "resultRow";

        const label = document.createElement("div");
        label.className = "resultPosition";
        label.innerText = `P${position + 1}`;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "resultInput";
        input.placeholder = `Piloto en posición ${position + 1}`;
        input.value = suggestedDrivers[position] || "";
        input.dataset.position = String(position);

        row.appendChild(label);
        row.appendChild(input);
        resultsForm.appendChild(row);
    }

    resultsModal.classList.remove("hidden");
    requestAnimationFrame(() => {
        const firstInput = resultsForm.querySelector("input");
        if (firstInput) firstInput.focus();
    });
}

function closeResultsModal() {
    resultsModal.classList.add("hidden");
    activeResultsRaceIndex = null;
    ocrStatus.innerText = "";
    ocrStatus.classList.add("hidden");
    ocrImageInput.value = "";
}

function closeHeaderMenu() {
    headerDropdown.hidden = true;
    headerMenuBtn.setAttribute("aria-expanded", "false");
}

function saveResultsFromModal() {
    if (window.sharedSyncRequireSession && !window.sharedSyncRequireSession()) return;
    if (activeResultsRaceIndex === null) return;

    const inputs = [...resultsForm.querySelectorAll("input")];
    const order = inputs.map((input) => input.value.trim()).filter(Boolean);

    if (order.length < 2) {
        alert("Ingresa al menos dos pilotos para guardar resultados.");
        return;
    }

    const canonicalOrder = canonicalizeResultsOrder(order);
    const uniqueNames = new Set(canonicalOrder.map((name) => comparisonKey(name)));
    if (uniqueNames.size !== canonicalOrder.length) {
        alert("No puede haber pilotos repetidos en la clasificación.");
        return;
    }

    championshipRaces[activeResultsRaceIndex].results = canonicalOrder;
    localStorage.setItem("races_" + currentCategory, JSON.stringify(championshipRaces));

    rebuildStandings();
    renderRaceList();
    updateTeamPanel();
    closeResultsModal();
    maybeSuggestCareerPlayersFromResults(canonicalOrder);
    checkCareerProgress();
}

function buildKnownDriverPool() {
    return [...new Set([
        ...drivers.map((driver) => driver.name),
        ...championshipRaces.flatMap((race) => Array.isArray(race.results) ? race.results : []),
        ...coopDrivers,
        ...Object.values(driverAliasMap)
    ])];
}

function scoreNameMatch(candidate, knownName) {
    const candidateLower = candidate.toLowerCase();
    const knownLower = knownName.toLowerCase();

    if (candidateLower === knownLower) return 100;
    if (candidateLower.includes(knownLower) || knownLower.includes(candidateLower)) return 80;

    const candidateTokens = candidateLower.split(/\s+/).filter(Boolean);
    const knownTokens = knownLower.split(/\s+/).filter(Boolean);
    const sharedTokens = candidateTokens.filter((token) => knownTokens.includes(token)).length;

    return sharedTokens * 20;
}

function mapToKnownDriver(candidate, knownDrivers) {
    const aliasKey = comparisonKey(candidate);
    if (driverAliasMap[aliasKey]) {
        return driverAliasMap[aliasKey];
    }

    let bestMatch = candidate;
    let bestScore = 0;

    knownDrivers.forEach((knownName) => {
        const score = scoreNameMatch(candidate, knownName);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = knownName;
        }
    });

    return bestScore >= 40 ? bestMatch : candidate;
}

function rememberDriverAlias(rawName, canonicalName) {
    const rawKey = comparisonKey(rawName);
    const canonicalKey = comparisonKey(canonicalName);

    if (rawKey) driverAliasMap[rawKey] = canonicalName;
    if (canonicalKey) driverAliasMap[canonicalKey] = canonicalName;

    saveDriverAliasMap();
}

function canonicalizeDriverName(rawName) {
    const sanitized = sanitizeEnteredName(rawName);
    if (!sanitized) return "";

    const knownDrivers = buildKnownDriverPool();
    const canonical = mapToKnownDriver(sanitized, knownDrivers);
    rememberDriverAlias(rawName, canonical);
    rememberDriverAlias(sanitized, canonical);

    return canonical;
}

function canonicalizeResultsOrder(order) {
    return order
        .map((name) => canonicalizeDriverName(name))
        .filter(Boolean);
}

function normalizeOcrLines(text) {
    return text
        .split(/\r?\n/)
        .map((line) => sanitizeEnteredName(line))
        .filter((line) => line.length >= 3)
        .filter((line) => /[a-zA-Z\u00C0-\u017F]/.test(line))
        .filter((line) => !/^(results?|clasificaci[oó]n|position|driver|piloto|puntos)$/i.test(line))
        .map((line) => canonicalizeDriverName(line))
        .filter((line, index, array) => array.findIndex((item) => item.toLowerCase() === line.toLowerCase()) === index);
}

function applyOcrTextToResults(text) {
    const names = normalizeOcrLines(text);

    if (!names.length) {
        ocrStatus.innerText = "No se encontró texto útil en la imagen.";
        ocrStatus.classList.remove("hidden");
        return;
    }

    const inputs = [...resultsForm.querySelectorAll("input")];

    while (names.length > inputs.length) {
        const position = resultsForm.children.length;
        const row = document.createElement("div");
        row.className = "resultRow";

        const label = document.createElement("div");
        label.className = "resultPosition";
        label.innerText = `P${position + 1}`;

        const input = document.createElement("input");
        input.type = "text";
        input.className = "resultInput";
        input.placeholder = `Piloto en posición ${position + 1}`;

        row.appendChild(label);
        row.appendChild(input);
        resultsForm.appendChild(row);
        inputs.push(input);
    }

    names.forEach((name, index) => {
        if (inputs[index]) inputs[index].value = name;
    });

    ocrStatus.innerText = `OCR completado: se detectaron ${names.length} líneas. Revisa los nombres antes de guardar.`;
    ocrStatus.classList.remove("hidden");
}

async function uploadImageForOcr(file) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("OCR request failed");
    }

    return response.json();
}

async function runBrowserOcr(file) {
    if (!window.Tesseract?.createWorker) {
        throw new Error("Browser OCR unavailable");
    }

    const worker = await window.Tesseract.createWorker("spa+eng");

    try {
        const result = await worker.recognize(file);
        return { text: result.data.text || "" };
    } finally {
        await worker.terminate();
    }
}

function toggleHeaderMenu() {
    const shouldOpen = headerDropdown.hidden;
    headerDropdown.hidden = !shouldOpen;
    headerMenuBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function renameCareerPlayersAcrossStorage(previousPlayers, nextPlayers) {
    if (!previousPlayers || previousPlayers.length < 2) return;

    const renamedPairs = previousPlayers.map((previousName, index) => ({
        previousName,
        nextName: nextPlayers[index]
    }));

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("races_")) {
            const races = JSON.parse(localStorage.getItem(key)) || [];
            let changed = false;

            races.forEach((race) => {
                if (!Array.isArray(race.results)) return;

                race.results = race.results.map((driverName) => {
                    const renamed = renamedPairs.find(
                        ({ previousName }) => previousName && driverName.toLowerCase() === previousName.toLowerCase()
                    );

                    if (renamed) {
                        changed = true;
                        return renamed.nextName;
                    }

                    return driverName;
                });
            });

            if (changed) {
                localStorage.setItem(key, JSON.stringify(races));
            }
        }

        if (key.startsWith("drivers_")) {
            const savedDrivers = JSON.parse(localStorage.getItem(key)) || [];
            let changed = false;

            savedDrivers.forEach((driver) => {
                const renamed = renamedPairs.find(
                    ({ previousName }) => previousName && driver.name.toLowerCase() === previousName.toLowerCase()
                );

                if (renamed) {
                    driver.name = renamed.nextName;
                    changed = true;
                }
            });

            if (changed) {
                localStorage.setItem(key, JSON.stringify(savedDrivers));
            }
        }
    });
}

function resetCareer() {
    const confirmReset = confirm(
        "¿Reiniciar toda la carrera?\n\nSe perderán todos los campeonatos y el progreso."
    );

    if (!confirmReset) return;

    localStorage.removeItem("careerResults");
    localStorage.removeItem("careerPlayers");
    localStorage.removeItem("unlockedCategories");

    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("races_")) localStorage.removeItem(key);
        if (key.startsWith("drivers_")) localStorage.removeItem(key);
        if (key.startsWith("championshipStarted_")) localStorage.removeItem(key);
    });

    alert("Carrera reiniciada correctamente");
    window.location.href = "index.html";
}

function getFinishedRacesCount() {
    return championshipRaces.filter((race) => race.results).length;
}

function getChampionshipProgress() {
    if (championshipRaces.length === 0) return 0;
    return Math.round((getFinishedRacesCount() / championshipRaces.length) * 100);
}

function getHeroStatusLabel() {
    if (championshipRaces.length === 0) return "Sin calendario";
    if (!championshipStarted) return "Listo para iniciar";
    if (championshipFinished()) return "Finalizado";
    return "En progreso";
}

function getTeamAverage() {
    let total = 0;

    coopDrivers.forEach((name) => {
        const driver = drivers.find((item) => item.name.toLowerCase() === name.toLowerCase());
        if (driver) total += driver.points;
    });

    return Math.round(total / coopDrivers.length) || 0;
}

function getTeamPosition() {
    if (drivers.length === 0) return "-";

    const teamAvg = getTeamAverage();

    const higher = drivers.filter((driver) =>
        !coopDrivers.some((name) => name.toLowerCase() === driver.name.toLowerCase()) &&
        driver.points > teamAvg
    ).length;

    return higher + 1;
}

function updateHeroStats() {
    heroStatus.innerText = getHeroStatusLabel();
    heroRounds.innerText = String(championshipRaces.length);
    heroProgress.innerText = `${getChampionshipProgress()}%`;
    const pos = getTeamPosition();
    heroTeamPosition.innerText = pos === "-" ? "-" : `P${pos}`;
}

function isAiDriver(name) {
    return /\(\s*ia\s*\)/i.test(name || "");
}

function isEmptyPlayerSlot(name) {
    return !name || /^vac[ií]o$/i.test(name);
}

function autoAssignCareerPlayersFromResults(resultsOrder) {
    const detectedHumans = resultsOrder
        .filter(Boolean)
        .filter((name) => !isAiDriver(name));

    if (!detectedHumans.length) return;

    const currentPlayers = Array.isArray(coopDrivers) ? [...coopDrivers] : ["Vacío", "Vacío"];
    const nextPlayers = [...currentPlayers];

    detectedHumans.forEach((name) => {
        const alreadyAssigned = nextPlayers.some(
            (player) => comparisonKey(player) === comparisonKey(name)
        );

        if (alreadyAssigned) return;

        const emptySlotIndex = nextPlayers.findIndex((player) => isEmptyPlayerSlot(player));
        if (emptySlotIndex >= 0) {
            nextPlayers[emptySlotIndex] = name;
        }
    });

    const changed =
        comparisonKey(nextPlayers[0] || "") !== comparisonKey(currentPlayers[0] || "") ||
        comparisonKey(nextPlayers[1] || "") !== comparisonKey(currentPlayers[1] || "");

    if (!changed) return;

    coopDrivers = nextPlayers;
    localStorage.setItem("careerPlayers", JSON.stringify(coopDrivers));
    syncHeaderPlayers();
    preloadPlayerInputs();
}

function getDetectedHumanCandidates(resultsOrder) {
    return resultsOrder
        .filter(Boolean)
        .filter((name) => !isAiDriver(name));
}

function closePlayerDetectModal() {
    playerDetectModal.classList.add("hidden");
    pendingDetectedHumans = [];
}

function maybeSuggestCareerPlayersFromResults(resultsOrder) {
    const currentPlayers = Array.isArray(coopDrivers) ? [...coopDrivers] : ["VacÃ­o", "VacÃ­o"];
    const emptySlots = currentPlayers.filter((player) => isEmptyPlayerSlot(player)).length;
    if (!emptySlots) return;

    const candidates = getDetectedHumanCandidates(resultsOrder).filter((name) => {
        return !currentPlayers.some((player) => comparisonKey(player) === comparisonKey(name));
    });

    if (!candidates.length) return;

    pendingDetectedHumans = candidates;
    playerDetectList.innerHTML = "";

    candidates.forEach((name, index) => {
        const row = document.createElement("label");
        row.className = "detectPlayerRow";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = name;
        checkbox.checked = index < Math.min(emptySlots, 2);

        const text = document.createElement("span");
        text.className = "detectPlayerName";
        text.innerText = name;

        row.appendChild(checkbox);
        row.appendChild(text);
        playerDetectList.appendChild(row);
    });

    playerDetectModal.dataset.maxSelections = String(Math.min(emptySlots, 2));
    playerDetectModal.classList.remove("hidden");
}

function enforceDetectSelectionLimit() {
    const maxSelections = Number(playerDetectModal.dataset.maxSelections || "2");
    const checked = [...playerDetectList.querySelectorAll('input[type="checkbox"]:checked')];

    if (checked.length <= maxSelections) return;
    checked[checked.length - 1].checked = false;
}

function saveDetectedPlayersSelection() {
    const selected = [...playerDetectList.querySelectorAll('input[type="checkbox"]:checked')]
        .map((input) => input.value)
        .slice(0, 2);

    if (!selected.length) {
        closePlayerDetectModal();
        return;
    }

    const currentPlayers = Array.isArray(coopDrivers) ? [...coopDrivers] : ["VacÃ­o", "VacÃ­o"];
    const nextPlayers = [...currentPlayers];

    selected.forEach((name) => {
        const alreadyAssigned = nextPlayers.some(
            (player) => comparisonKey(player) === comparisonKey(name)
        );

        if (alreadyAssigned) return;

        const emptySlotIndex = nextPlayers.findIndex((player) => isEmptyPlayerSlot(player));
        if (emptySlotIndex >= 0) {
            nextPlayers[emptySlotIndex] = name;
        }
    });

    coopDrivers = nextPlayers.slice(0, 2);
    localStorage.setItem("careerPlayers", JSON.stringify(coopDrivers));
    syncHeaderPlayers();
    preloadPlayerInputs();
    updateTeamPanel();
    closePlayerDetectModal();
}

function updateTeamPanel() {
    const [d1, d2] = coopDrivers;
    const driver1 = drivers.find((driver) => driver.name.toLowerCase() === d1.toLowerCase());
    const driver2 = drivers.find((driver) => driver.name.toLowerCase() === d2.toLowerCase());
    const leaderPoints = Math.max(...drivers.map((driver) => driver.points), 0);
    const driver1Points = driver1 ? driver1.points : 0;
    const driver2Points = driver2 ? driver2.points : 0;

    teamDriver1.innerText = d1;
    teamDriver2.innerText = d2;
    teamDriver1Pts.innerText = `${driver1Points} pts`;
    teamDriver2Pts.innerText = `${driver2Points} pts`;
    teamAverage.innerText = String(getTeamAverage());

    const pos = getTeamPosition();
    teamPosition.innerText = pos === "-" ? "-" : `P${pos}`;
    teamDriver1Bar.style.width = `${leaderPoints ? Math.round((driver1Points / leaderPoints) * 100) : 0}%`;
    teamDriver2Bar.style.width = `${leaderPoints ? Math.round((driver2Points / leaderPoints) * 100) : 0}%`;

    updateHeroStats();
}

function renderRaceSelector() {
    raceSelectorGrid.innerHTML = "";

    if (typeof trackList === "undefined") {
        raceSelectorGrid.innerHTML = "<p>No se cargaron circuitos.</p>";
        return;
    }

    trackList.forEach((track) => {
        const card = document.createElement("div");
        card.className = "raceCard";

        const img = document.createElement("img");
        img.src = track.img;
        img.alt = track.name;

        const title = document.createElement("div");
        title.className = "raceCardTitle";
        title.innerText = track.name;

        const variantsDiv = document.createElement("div");
        variantsDiv.className = "variants";

        track.layouts.forEach((layout) => {
            const btn = document.createElement("button");
            btn.className = "variantBtn";
            btn.innerText = layout.name;

            btn.onclick = (event) => {
                event.stopPropagation();
                addRace(track.name, layout.name, track.img);
            };

            variantsDiv.appendChild(btn);
        });

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(variantsDiv);

        card.addEventListener("click", () => {
            if (track.layouts.length === 1) {
                addRace(track.name, track.layouts[0].name, track.img);
                return;
            }

            variantsDiv.style.display = variantsDiv.style.display === "flex" ? "none" : "flex";
        });

        raceSelectorGrid.appendChild(card);
    });
}

function addRace(trackName, layoutName, trackImg) {
    championshipRaces.push({
        trackName,
        layoutName,
        img: trackImg,
        results: null
    });

    localStorage.setItem("races_" + currentCategory, JSON.stringify(championshipRaces));
    renderRaceList();
    updateHeroStats();
    raceSelectorContainer.classList.add("hidden");
}

function rebuildStandings() {
    drivers = [];

    championshipRaces.forEach((race) => {
        if (!race.results) return;

        race.results.forEach((driverName, position) => {
            let driver = drivers.find((item) => item.name === driverName);
            const pts = pointsSystem[position] || 0;

            if (!driver) {
                driver = { name: driverName, points: 0 };
                drivers.push(driver);
            }

            driver.points += pts;
        });
    });

    localStorage.setItem("drivers_" + currentCategory, JSON.stringify(drivers));
    updateStandings();
    updateTeamPanel();
}

function getNextRaceIndex() {
    for (let index = 0; index < championshipRaces.length; index++) {
        if (!championshipRaces[index].results) return index;
    }

    return -1;
}

function renderRaceList() {
    raceListContainer.innerHTML = "";
    const nextRace = getNextRaceIndex();

    championshipRaces.forEach((race, index) => {
        const card = document.createElement("div");
        card.className = "raceItem";

        let statusClass = "locked";
        let statusText = "Bloqueada";
        let actionMarkup = "<span class='raceBadge locked'>Bloqueada</span>";

        if (race.results) {
            statusClass = "done";
            statusText = "Finalizada";
            actionMarkup = "<span class='raceBadge done'>Resultados cargados</span>";
        } else if (index === nextRace) {
            statusClass = "next";
            statusText = "Próxima fecha";
            actionMarkup = `<button class="inlineRaceBtn" onclick="addResult(${index})">Cargar resultados</button>`;
        }

        card.innerHTML = `
<img src="${race.img}" alt="${race.trackName}">
<div class="raceRound">Fecha ${index + 1}</div>
<div class="raceTrack">${race.trackName}</div>
<div class="raceLayout">${race.layoutName}</div>
<div class="raceStatus">${statusText}</div>
<div class="raceActionArea">
  <span class="raceBadge ${statusClass}">${statusText}</span>
  ${index === nextRace && !race.results ? actionMarkup : ""}
  <button class="removeRaceBtn" onclick="removeRace(${index})">Quitar</button>
</div>
`;

        raceListContainer.appendChild(card);
    });

    updateChampionshipState();
    updateHeroStats();
}

function removeRace(index) {
    championshipRaces.splice(index, 1);
    localStorage.setItem("races_" + currentCategory, JSON.stringify(championshipRaces));
    rebuildStandings();
    renderRaceList();
}

function addResult(raceIndex) {
    if (championshipRaces[raceIndex].results) {
        alert("Los resultados ya fueron cargados.");
        return;
    }

    openResultsModal(raceIndex);
}

function updateStandings() {
    const tbody = document.querySelector("#standings tbody");
    if (!tbody) return;

    drivers.sort((a, b) => b.points - a.points);
    tbody.innerHTML = "";

    drivers.forEach((driver, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
<td>${index + 1}</td>
<td>${driver.name}</td>
<td>${driver.points}</td>
`;
        tbody.appendChild(row);
    });
}

function championshipFinished() {
    return championshipRaces.length > 0 && championshipRaces.every((race) => race.results);
}

function registerCareerResult() {
    const results = JSON.parse(localStorage.getItem("careerResults")) || {};

    if (!results[currentCategory]) {
        results[currentCategory] = getTeamPosition();
        localStorage.setItem("careerResults", JSON.stringify(results));
    }
}

function checkCareerProgress() {
    if (!championshipFinished()) return;

    registerCareerResult();

    const results = JSON.parse(localStorage.getItem("careerResults")) || {};
    let tierTop3 = 0;

    career.forEach((level) => {
        level.branches.forEach((branch) => {
            branch.categories.forEach((category) => {
                if (results[category.name] && results[category.name] <= 3) {
                    tierTop3++;
                }
            });
        });
    });

    if (tierTop3 >= 2) {
        const unlocked = JSON.parse(localStorage.getItem("unlockedCategories")) || [];

        career.forEach((level) => {
            level.branches.forEach((branch) => {
                branch.categories.forEach((category) => {
                    if (!unlocked.includes(category.name)) unlocked.push(category.name);
                });
            });
        });

        localStorage.setItem("unlockedCategories", JSON.stringify(unlocked));
        showUnlockPopup();
    }
}

function updateChampionshipState() {
    const standingsContainer = document.getElementById("standingsContainer");

    if (championshipStarted) {
        addRaceBtn.style.display = "none";
        startChampionshipBtn.style.display = "none";

        document.querySelectorAll(".removeRaceBtn").forEach((button) => {
            button.style.display = "none";
        });

        if (standingsContainer) standingsContainer.classList.remove("hidden");
    } else {
        if (standingsContainer) standingsContainer.classList.add("hidden");
    }

    updateHeroStats();
}

function showUnlockPopup() {
    const popup = document.getElementById("unlockPopup");
    if (popup) popup.classList.remove("hidden");
}

function closeUnlockPopup() {
    document.getElementById("unlockPopup").classList.add("hidden");
    window.location.href = "index.html";
}

window.addResult = addResult;
window.removeRace = removeRace;
window.closeUnlockPopup = closeUnlockPopup;

addRaceBtn.addEventListener("click", () => {
    if (window.sharedSyncRequireSession && !window.sharedSyncRequireSession()) return;
    raceSelectorContainer.classList.remove("hidden");
    renderRaceSelector();
});

closeRaceSelectorBtn.addEventListener("click", () => {
    raceSelectorContainer.classList.add("hidden");
});

raceSelectorContainer.addEventListener("click", (event) => {
    if (event.target === raceSelectorContainer) {
        raceSelectorContainer.classList.add("hidden");
    }
});

headerMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHeaderMenu();
});

headerDropdown.addEventListener("click", (event) => {
    event.stopPropagation();
});

editPlayersBtn.addEventListener("click", () => {
    preloadPlayerInputs();
    closeHeaderMenu();
    openPlayerModal();
});

resetCareerBtn.addEventListener("click", () => {
    closeHeaderMenu();
    resetCareer();
});

savePlayersBtn.addEventListener("click", () => {
    if (window.sharedSyncRequireSession && !window.sharedSyncRequireSession()) return;
    const p1 = player1Input.value.trim();
    const p2 = player2Input.value.trim();

    if (!p1 || !p2) {
        alert("Por favor completa ambos nombres.");
        return;
    }

    const previousPlayers = Array.isArray(coopDrivers) ? [...coopDrivers] : null;
    coopDrivers = [p1, p2];

    renameCareerPlayersAcrossStorage(previousPlayers, coopDrivers);
    localStorage.setItem("careerPlayers", JSON.stringify(coopDrivers));

    championshipRaces = JSON.parse(localStorage.getItem("races_" + currentCategory)) || championshipRaces;
    drivers = JSON.parse(localStorage.getItem("drivers_" + currentCategory)) || drivers;

    syncHeaderPlayers();
    preloadPlayerInputs();
    rebuildStandings();
    renderRaceList();
    updateTeamPanel();
    closePlayerModal();
});

playerModal.addEventListener("click", (event) => {
    if (event.target === playerModal && coopDrivers?.[0] && coopDrivers?.[1]) {
        closePlayerModal();
    }
});

resultsModal.addEventListener("click", (event) => {
    if (event.target === resultsModal) {
        closeResultsModal();
    }
});

playerDetectModal.addEventListener("click", (event) => {
    if (event.target === playerDetectModal) {
        closePlayerDetectModal();
    }
});

playerDetectList.addEventListener("change", enforceDetectSelectionLimit);

ocrImageInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    ocrStatus.innerText = "Procesando imagen...";
    ocrStatus.classList.remove("hidden");

    try {
        const data = await uploadImageForOcr(file);
        applyOcrTextToResults(data.text || "");
    } catch (_error) {
        try {
            ocrStatus.innerText = "El OCR del servidor falló. Probando OCR local en el navegador...";
            ocrStatus.classList.remove("hidden");

            const fallbackData = await runBrowserOcr(file);
            applyOcrTextToResults(fallbackData.text || "");
            ocrStatus.innerText = "OCR completado en el navegador. Revisa los nombres antes de guardar.";
        } catch (_fallbackError) {
            ocrStatus.innerText = window.location.hostname === "localhost"
                ? "No se pudo conectar con el backend OCR y también falló el OCR local. Verifica que el servidor Node esté corriendo en http://localhost:3000."
                : "Falló Netlify Functions y también el OCR local del navegador. Revisa el deploy, la consola del navegador y los logs de la función upload.";
            ocrStatus.classList.remove("hidden");
        }
    }
});

document.addEventListener("click", (event) => {
    if (!headerDropdown.hidden && !event.target.closest(".headerMenu")) {
        closeHeaderMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !headerDropdown.hidden) closeHeaderMenu();

    if (!resultsModal.classList.contains("hidden")) {
        if (event.key === "Escape") closeResultsModal();
        if (event.key === "Enter" && event.target.tagName !== "BUTTON") {
            saveResultsFromModal();
        }
        return;
    }

    if (playerModal.classList.contains("hidden")) return;

    if (event.key === "Escape" && coopDrivers?.[0] && coopDrivers?.[1]) {
        closePlayerModal();
    }

    if (event.key === "Enter") {
        savePlayersBtn.click();
    }
});

closeResultsModalBtn.addEventListener("click", closeResultsModal);
saveResultsBtn.addEventListener("click", saveResultsFromModal);
closePlayerDetectBtn.addEventListener("click", closePlayerDetectModal);
savePlayerDetectBtn.addEventListener("click", saveDetectedPlayersSelection);

startChampionshipBtn.addEventListener("click", () => {
    if (window.sharedSyncRequireSession && !window.sharedSyncRequireSession()) return;
    championshipStarted = true;
    localStorage.setItem("championshipStarted_" + currentCategory, true);
    updateChampionshipState();
});

resetChampionshipBtn.addEventListener("click", () => {
    if (window.sharedSyncRequireSession && !window.sharedSyncRequireSession()) return;
    const confirmReset = confirm("¿Reiniciar este campeonato?");
    if (!confirmReset) return;

    localStorage.removeItem("races_" + currentCategory);
    localStorage.removeItem("drivers_" + currentCategory);
    localStorage.removeItem("championshipStarted_" + currentCategory);
    localStorage.removeItem(DRIVER_ALIASES_KEY);

    championshipRaces = [];
    drivers = [];
    championshipStarted = false;
    driverAliasMap = {};

    renderRaceList();
    updateStandings();
    updateTeamPanel();
    updateChampionshipState();
});

syncHeaderPlayers();
preloadPlayerInputs();
renderCategoryHero();
rebuildStandings();
renderRaceList();
updateChampionshipState();
updateTeamPanel();
})();
