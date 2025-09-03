document.addEventListener('DOMContentLoaded', () => {
    // ####################################################################
    // ### KONFIGURATION                                                ###
    // ####################################################################
    
    // Ersätt 426 med den verkliga bredden i pixlar på din `handdator.png`-fil.
    // Det är VIKTIGT att alla dina bilder har SAMMA bredd för att detta ska fungera.
    const ORIGINAL_IMAGE_WIDTH = 426;
    
    // Anger vilken meny i `menu-definitions.js` som spelet ska starta med.
    const START_MENU_KEY = 'main';

    // ####################################################################

    // Variabler för spellogiken
    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;
    let currentMenuViewKey = START_MENU_KEY;
    let menuHistory = []; // Kommer nu att spara meny-nycklar (strängar)
    let typewriterInterval = null;

    // HTML-element referenser
    const gameImage = document.getElementById('game-image');
    const imageContainer = document.getElementById('image-container');
    const navOverlay = document.getElementById('navigation-overlay');
    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioDescription = document.getElementById('scenario-description');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackArea = document.getElementById('feedback-area');
    const nextScenarioButton = document.getElementById('reset-button');
    
    // --- FUNKTIONER ---

    function animateTypewriter(element, markdownText) {
        if (typewriterInterval) {
            clearInterval(typewriterInterval);
        }
        let i = 0;
        element.innerHTML = '';
        element.classList.add('typing');
        typewriterInterval = setInterval(() => {
            if (i < markdownText.length) {
                element.innerHTML = marked.parse(markdownText.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typewriterInterval);
                element.classList.remove('typing');
            }
        }, 30);
    }

    async function initializeGame() {
        let scenarioPlaylist = JSON.parse(sessionStorage.getItem('scenarioPlaylist'));
        let currentPlaylistIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);

        if (!scenarioPlaylist) {
            try {
                const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
                if (!response.ok) throw new Error('Nätverksfel');
                let allScenarios = await response.json();
                if (!allScenarios || allScenarios.length === 0) {
                     scenarioTitle.textContent = "Inga Scenarier Hittades";
                    scenarioDescription.innerHTML = "Filen <code>scenarios.json</code> är tom. Öppna <code>admin.html</code> för att skapa ditt första scenario.";
                    imageContainer.style.display = 'none';
                    return;
                }
                for (let i = allScenarios.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allScenarios[i], allScenarios[j]] = [allScenarios[j], allScenarios[i]];
                }
                scenarioPlaylist = allScenarios;
                sessionStorage.setItem('scenarioPlaylist', JSON.stringify(scenarioPlaylist));
                sessionStorage.setItem('currentPlaylistIndex', '0');
            } catch (error) {
                console.error("Fel vid laddning av scenarios.json:", error);
                scenarioTitle.textContent = "Ett fel uppstod";
                scenarioDescription.innerHTML = "Kunde inte ladda övningarna. Kontrollera att <code>scenarios.json</code> finns.";
                return;
            }
        }

        if (currentPlaylistIndex >= scenarioPlaylist.length) {
            sessionStorage.removeItem('scenarioPlaylist');
            sessionStorage.removeItem('currentPlaylistIndex');
            window.location.href = 'certifikat.html';
            return;
        }

        loadedScenario = scenarioPlaylist[currentPlaylistIndex];
        currentScenarioStepIndex = 0;
        setupCurrentScenarioStep();
    }
    
    nextScenarioButton.textContent = 'Nästa Scenario';
    nextScenarioButton.style.display = 'none';
    nextScenarioButton.addEventListener('click', () => {
        let currentIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        sessionStorage.setItem('currentPlaylistIndex', currentIndex + 1);
        location.reload(); 
    });

    function setupCurrentScenarioStep() {
        currentSequenceStep = 0;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        scenarioTitle.textContent = loadedScenario.title;
        animateTypewriter(scenarioDescription, currentStepData.description);
        resetGameState();
    }
    
    function resetGameState() {
        menuHistory = [];
        feedbackMessage.textContent = 'Väntar på din första åtgärd...';
        feedbackArea.className = 'feedback-neutral';
        imageContainer.style.display = 'block';
        nextScenarioButton.style.display = 'none';
        switchMenuView(START_MENU_KEY);
    }
    
    function handleEventClick(clickedEvent, areaElement) {
        if (!loadedScenario) return;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        const targetActions = currentStepData.sequence;
        const isStepFinished = currentSequenceStep >= targetActions.length;
        if (isStepFinished && currentScenarioStepIndex >= loadedScenario.steps.length - 1) return;

        if (isStepFinished) {
            if (clickedEvent.submenu) {
                menuHistory.push(currentMenuViewKey);
                switchMenuView(clickedEvent.submenu);
            }
            return;
        }

        const nextTargetAction = targetActions[currentSequenceStep];

        if (clickedEvent.name === nextTargetAction) {
            feedbackMessage.textContent = `Korrekt! "${clickedEvent.name}" var rätt steg.`;
            feedbackArea.className = 'feedback-correct';
            areaElement.classList.add('area-correct-feedback');
            areaElement.style.pointerEvents = 'none';
            currentSequenceStep++;
            const isStepComplete = currentSequenceStep === targetActions.length;
            if (isStepComplete) {
                const isLastStepOfScenario = currentScenarioStepIndex === loadedScenario.steps.length - 1;
                if (isLastStepOfScenario) {
                    setTimeout(() => {
                        feedbackMessage.textContent = 'Bra gjort! Hela scenariot är slutfört. Klicka på "Nästa Scenario" för att fortsätta.';
                        feedbackArea.className = 'feedback-correct';
                        nextScenarioButton.style.display = 'block';
                        if (menuHistory.length > 0) {
                            menuHistory = [];
                            switchMenuView(START_MENU_KEY);
                        }
                    }, 700);
                } else {
                    setTimeout(() => {
                        currentScenarioStepIndex++;
                        setupCurrentScenarioStep();
                    }, 1200);
                }
                return;
            }
            if (clickedEvent.submenu) {
                menuHistory.push(currentMenuViewKey);
                switchMenuView(clickedEvent.submenu);
            }
            return;
        }

        if (clickedEvent.submenu) {
            menuHistory.push(currentMenuViewKey);
            switchMenuView(clickedEvent.submenu);
            return;
        }
        
        const clickedName = clickedEvent.name;
        let errorMessage = "Fel knapp för denna uppgift.";
        if (currentStepData.customErrorMessage) { errorMessage = currentStepData.customErrorMessage; }
        if (currentStepData.wrongClickMessages && currentStepData.wrongClickMessages[clickedName]) {
            errorMessage = currentStepData.wrongClickMessages[clickedName];
        }
        feedbackMessage.textContent = errorMessage;
        feedbackArea.className = 'feedback-incorrect';
        areaElement.classList.add('area-incorrect-feedback');
        setTimeout(() => { areaElement.classList.remove('area-incorrect-feedback'); }, 500);
    }

    function switchMenuView(menuKey) {
        const menuData = ALL_MENUS[menuKey];
        if (!menuData) {
            console.error(`Kunde inte hitta en meny med nyckeln: ${menuKey}`);
            return;
        }
        currentMenuViewKey = menuKey;
        gameImage.src = menuData.image;
        gameImage.onload = () => {
            createClickableAreas(menuData.events);
            createBackButton(menuData);
            scaleClickableAreas();
        };
        if (gameImage.complete) { gameImage.onload(); }
    }

    function createBackButton(menuData) {
        navOverlay.innerHTML = '';
        if (menuData.backButtonCoords) {
            const backArea = document.createElement('div');
            backArea.classList.add('clickable-area');
            const coords = menuData.backButtonCoords;
            backArea.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height];
            backArea.addEventListener('click', () => {
                if (menuHistory.length > 0) {
                    const previousMenuKey = menuHistory.pop();
                    switchMenuView(previousMenuKey);
                }
            });
            navOverlay.appendChild(backArea);
        }
    }
    
    function createClickableAreas(eventsToCreate) {
        imageContainer.querySelectorAll('.clickable-area').forEach(area => area.remove());
        if (!eventsToCreate) return;
        eventsToCreate.forEach(event => {
            const area = document.createElement('div');
            area.classList.add('clickable-area');
            const coords = event.coords;
            area.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height];
            area.addEventListener('click', () => handleEventClick(event, area));
            imageContainer.appendChild(area);
        });
    }
    
    function scaleClickableAreas() {
        const scaleRatio = gameImage.offsetWidth / ORIGINAL_IMAGE_WIDTH;
        if (!scaleRatio) return;
        imageContainer.querySelectorAll('.clickable-area').forEach(area => {
            const originalCoords = area.dataset.originalCoords.split(',').map(Number);
            area.style.top = `${originalCoords[0] * scaleRatio}px`;
            area.style.left = `${originalCoords[1] * scaleRatio}px`;
            area.style.width = `${originalCoords[2] * scaleRatio}px`;
            area.style.height = `${originalCoords[3] * scaleRatio}px`;
        });
        const backArea = navOverlay.querySelector('.clickable-area');
        if (backArea) {
            const originalCoords = backArea.dataset.originalCoords.split(',').map(Number);
            backArea.style.top = `${originalCoords[0] * scaleRatio}px`;
            backArea.style.left = `${originalCoords[1] * scaleRatio}px`;
            backArea.style.width = `${originalCoords[2] * scaleRatio}px`;
            backArea.style.height = `${originalCoords[3] * scaleRatio}px`;
        }
    }

    window.addEventListener('resize', scaleClickableAreas);
    initializeGame(); 
});
