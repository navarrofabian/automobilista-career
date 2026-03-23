const tree = document.getElementById("careerTree");

// Obtener elementos del modal
const playerModal = document.getElementById("playerModal");
const player1Input = document.getElementById("player1Input");
const player2Input = document.getElementById("player2Input");
const savePlayersBtn = document.getElementById("savePlayersBtn");
const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");
const editPlayersBtn = document.getElementById("editPlayersBtn");
const resetCareerBtn = document.getElementById("resetCareerBtn");
const headerMenuBtn = document.getElementById("headerMenuBtn");
const headerDropdown = document.getElementById("headerDropdown");

let coopPlayers = JSON.parse(localStorage.getItem("careerPlayers"));
let careerResults = JSON.parse(localStorage.getItem("careerResults")) || {};

let totalCategories = 0;
let completedCategories = 0;

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

function openPlayerModal() {
    playerModal.style.display = "flex";
    playerModal.removeAttribute("hidden");
    requestAnimationFrame(() => player1Input.focus());
}

function closePlayerModal() {
    playerModal.style.display = "none";
    playerModal.setAttribute("hidden", "");
}

function syncPlayerNames() {
    player1Name.innerText = coopPlayers?.[0] || "Vacío";
    player2Name.innerText = coopPlayers?.[1] || "Vacío";
}

function preloadPlayerInputs() {
    player1Input.value = coopPlayers?.[0] || "";
    player2Input.value = coopPlayers?.[1] || "";
}

function closeHeaderMenu() {
    headerDropdown.hidden = true;
    headerMenuBtn.setAttribute("aria-expanded", "false");
}

function toggleHeaderMenu() {
    const shouldOpen = headerDropdown.hidden;
    headerDropdown.hidden = !shouldOpen;
    headerMenuBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

// Mostrar modal solo si no hay jugadores guardados
if (!coopPlayers || coopPlayers.length < 2 || !coopPlayers[0] || !coopPlayers[1]) {
    openPlayerModal();
} else {
    syncPlayerNames();
    preloadPlayerInputs();
}

// Guardar jugadores al hacer clic en el botón
savePlayersBtn.addEventListener("click", () => {
    const p1 = player1Input.value.trim();
    const p2 = player2Input.value.trim();

    if (!p1 || !p2) {
        alert("Por favor completa ambos nombres.");
        return;
    }

    const previousPlayers = Array.isArray(coopPlayers) ? [...coopPlayers] : null;
    coopPlayers = [p1, p2];
    renameCareerPlayersAcrossStorage(previousPlayers, coopPlayers);
    localStorage.setItem("careerPlayers", JSON.stringify(coopPlayers));

    syncPlayerNames();
    preloadPlayerInputs();
    closePlayerModal();
});

// Botón para editar jugadores después
editPlayersBtn.addEventListener("click", () => {
    preloadPlayerInputs();
    closeHeaderMenu();
    openPlayerModal();
});

headerMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHeaderMenu();
});

headerDropdown.addEventListener("click", (event) => {
    event.stopPropagation();
});

playerModal.addEventListener("click", (event) => {
    if (event.target === playerModal && coopPlayers?.[0] && coopPlayers?.[1]) {
        closePlayerModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !headerDropdown.hidden) {
        closeHeaderMenu();
    }

    if (playerModal.style.display !== "flex") return;

    if (event.key === "Escape" && coopPlayers?.[0] && coopPlayers?.[1]) {
        closePlayerModal();
    }

    if (event.key === "Enter") {
        savePlayersBtn.click();
    }
});

document.addEventListener("click", (event) => {
    if (!headerDropdown.hidden && !event.target.closest(".headerMenu")) {
        closeHeaderMenu();
    }
});

// función que detecta si un nivel está desbloqueado
function levelUnlocked(levelIndex) {
    if (levelIndex === 0) return true;

    const prevLevel = career[levelIndex - 1];
    let completed = 0;

    prevLevel.branches.forEach((branch) => {
        branch.categories.forEach((cat) => {
            if (careerResults[cat.name]) completed++;
        });
    });

    return completed >= 2;
}

career.forEach((level, levelIndex) => {
    const levelDiv = document.createElement("div");
    levelDiv.className = "tier";

    const title = document.createElement("div");
    title.className = "tierTitle";
    title.innerText = level.level;

    levelDiv.appendChild(title);

    level.branches.forEach((branch) => {
        const branchTitle = document.createElement("h3");
        branchTitle.innerText = branch.name;
        levelDiv.appendChild(branchTitle);

        const row = document.createElement("div");
        row.className = "tierRow";

        branch.categories.forEach((cat) => {
            totalCategories++;

            const card = document.createElement("div");
            card.className = "card";

            const unlocked = levelUnlocked(levelIndex);

            if (!unlocked) {
                card.classList.add("locked");
            }

            if (careerResults[cat.name]) {
                card.classList.add("completed");
                completedCategories++;
            }

            const img = document.createElement("img");
            img.src = cat.img;
            img.className = "cardBackground";
            img.alt = `${cat.name} background`;

            const icon = document.createElement("img");
            icon.src = cat.icon;
            icon.className = "cardIcon";
            icon.alt = `${cat.name} icon`;

            const name = document.createElement("div");
            name.className = "cardTitle";
            name.innerText = cat.name;

            card.appendChild(img);
            card.appendChild(icon);
            card.appendChild(name);
            row.appendChild(card);

            card.addEventListener("click", () => {
                if (!unlocked) return;

                localStorage.setItem("currentCategory", cat.name);
                window.location.href = "championship.html";
            });
        });

        levelDiv.appendChild(row);
    });

    tree.appendChild(levelDiv);
});

// progreso global
function updateVerticalProgress() {
    const progress = Math.round((completedCategories / totalCategories) * 100 || 0);
    const fill = document.getElementById("verticalProgressFill");
    const text = document.getElementById("verticalProgressText");

    if (fill) fill.style.height = progress + "%";
    if (text) text.innerText = progress + "%";
}

// actualizar al cargar
updateVerticalProgress();

// actualizar dinámicamente cada 3 segundos
setInterval(updateVerticalProgress, 3000);

resetCareerBtn.addEventListener("click", () => {
    closeHeaderMenu();

    const confirmReset = confirm(
        "¿Reiniciar toda la carrera?\n\nSe perderán todos los campeonatos y el progreso."
    );

    if (!confirmReset) return;

    localStorage.removeItem("careerResults");
    localStorage.removeItem("careerPlayers");
    localStorage.removeItem("unlockedCategories");

    // borrar datos de campeonatos
    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("races_")) localStorage.removeItem(key);
        if (key.startsWith("drivers_")) localStorage.removeItem(key);
        if (key.startsWith("championshipStarted_")) localStorage.removeItem(key);
    });

    alert("Carrera reiniciada correctamente");
    location.reload();
});
