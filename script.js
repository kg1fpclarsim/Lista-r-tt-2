document.addEventListener('DOMContentLoaded', () => {
    // ####################################################################
    // ### DITT JOBB: FYLL I VÄRDET NEDAN                               ###
    // ####################################################################
    
    // 1. Ersätt 430 med den verkliga bredden i pixlar på din `handdator.png`-fil.
    //    Det är VIKTIGT att alla dina 3 bilder har SAMMA bredd för att detta ska fungera.
    const ORIGINAL_IMAGE_WIDTH = 426; 
    
    // Dina koordinater är nu infogade här nedanför.
  const topLevelMenu = {
    image: 'handdator.png',
    events: [
        { name: "Lasta ut", coords: { top:  197, left: 71, width: 138, height: 76 } },
        { name: "Lossa in", coords: { top: 197, left: 221, width: 138, height: 76 } },
        { 
            name: "Hämta", 
            coords: { top: 287, left: 71, width: 138, height: 76 },
            submenu: {
                image: 'handdator-hamta.png',
                backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
                events: [
                    { name: "Hämta åt annan bil", coords: { top: 295, left: 70, width: 185, height: 30 } },
                    { name: "Hämta obokad hämtning", coords: { top: 240, left: 70, width: 185, height: 30 } }
                ]
            }
        },
        { name: "Leverera", coords: { top: 287, left: 221, width: 138, height: 76 } },
        { name: "Bomhämtning", coords: { top: 374, left: 71, width: 138, height: 76 } },
        { name: "Ej levererat", coords: { top: 374, left: 221, width: 138, height: 76 } },
        { name: "Hämtning utan sändnings-ID", coords: { top: 463, left: 71, width: 138, height: 76 } },
        { name: "Åter terminal", coords: { top: 463, left: 221, width: 138, height: 76 } },
        { 
            name: "Flänsa", 
            coords: { top: 552, left: 71, width: 138, height: 76 },
            submenu: {
                image: 'handdator-flansa.png',
                backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
                events: [
                    { name: "Flänsa på", coords: { top: 197, left: 71, width: 138, height: 76 } },
                    { name: "Flänsa av", coords: { top: 197, left: 221, width: 138, height: 76 } }
                ]
            }
        },
        { 
            name: "Hem", 
            coords: { top: 655, left: 90, width: 35, height: 50 },
            submenu: {
                image: 'handdator-hem.png',
                backButtonCoords: { top: 655, left: 175, width: 80, height: 50 },
                events: [
                    { 
                        name: "Synkronisera visa",
                        coords: { top: 385, left: 70, width: 80, height: 25 },
                        // KORRIGERAD KOD BÖRJAR HÄR
                        submenu: { // Rättad från "submenu;"
                            image: 'handdator-senastehandelse.png',
                            backButtonCoords: { top: 145, left: 70, width: 20, height: 25 },
                            events: [
                                { name: "Ångra", coords: { top: 240, left: 300, width: 60, height: 30 } }
                            ]
                        } 
                    }
                ]
            }
        }
    ]
};
    // ####################################################################
    // ### SLUT PÅ SEKTIONEN MED DINA VÄRDEN                            ###
    // ####################################################################

    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;
    let currentMenuView = topLevelMenu;
    let menuHistory = [];

    const gameImage = document.getElementById('game-image');
    const imageContainer = document.getElementById('image-container');
    const navOverlay = document.getElementById('navigation-overlay');
    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioDescription = document.getElementById('scenario-description');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackArea = document.getElementById('feedback-area');
    const nextScenarioButton = document.getElementById('reset-button');
    
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
        scenarioDescription.innerHTML = marked.parse(currentStepData.description);
        resetGameState();
    }
    
    function resetGameState() {
        menuHistory = [];
        feedbackMessage.textContent = 'Väntar på din första åtgärd...';
        feedbackArea.className = 'feedback-neutral';
        imageContainer.style.display = 'block';
        nextScenarioButton.style.display = 'none';
        switchMenuView(topLevelMenu);
    }

    function switchMenuView(menuData) {
        currentMenuView = menuData;
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
                    const previousMenu = menuHistory.pop();
                    switchMenuView(previousMenu);
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

    function handleEventClick(clickedEvent, areaElement) {
    if (!loadedScenario) return;

    const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
    const scenarioSequence = currentStepData.sequence;
    const isFinished = currentSequenceStep >= scenarioSequence.length;

    if(isFinished && currentScenarioStepIndex >= loadedScenario.steps.length - 1) return;

    if (!isFinished && clickedEvent.name === scenarioSequence[currentSequenceStep]) {
        feedbackMessage.textContent = `Korrekt! "${clickedEvent.name}" var rätt steg.`;
        feedbackArea.className = 'feedback-correct';
        areaElement.classList.add('area-correct-feedback');
        areaElement.style.pointerEvents = 'none';
        currentSequenceStep++;
        
        const isStepComplete = currentSequenceStep === scenarioSequence.length;
        if (isStepComplete) {
            const isLastStepOfScenario = currentScenarioStepIndex === loadedScenario.steps.length - 1;
            if (isLastStepOfScenario) {
                setTimeout(() => {
                    feedbackMessage.textContent = 'Bra gjort! Hela scenariot är slutfört. Klicka på "Nästa Scenario" för att fortsätta.';
                    feedbackArea.className = 'feedback-correct';
                    nextScenarioButton.style.display = 'block';
                    if (menuHistory.length > 0) {
                        menuHistory = [];
                        switchMenuView(topLevelMenu);
                    }
                }, 700);
            } else {
                // NY LOGIK FÖR ANIMERING HÄR
                // Tona ut den gamla beskrivningen
                scenarioDescription.classList.add('fade-out');
                
                // Vänta tills uttoningen är klar, byt sedan innehåll och tona in
                setTimeout(() => {
                    currentScenarioStepIndex++;
                    setupCurrentScenarioStep(); // Denna byter texten
                    // Ta bort klassen för att tona in den nya texten
                    scenarioDescription.classList.remove('fade-out');
                }, 400); // Denna tid (400ms) matchar vår CSS-transition (0.4s)
            }
            return;
        }
        
        if (clickedEvent.submenu) {
            menuHistory.push(currentMenuView);
            switchMenuView(clickedEvent.submenu);
        }
    } else {
        const clickedName = clickedEvent.name;
        let errorMessage = "Fel ordning. Försök igen.";
        if (currentStepData.customErrorMessage) { errorMessage = currentStepData.customErrorMessage; }
        if (currentStepData.wrongClickMessages && currentStepData.wrongClickMessages[clickedName]) {
            errorMessage = currentStepData.wrongClickMessages[clickedName];
        }
        feedbackMessage.textContent = errorMessage;
        feedbackArea.className = 'feedback-incorrect';
        areaElement.classList.add('area-incorrect-feedback');
        setTimeout(() => { areaElement.classList.remove('area-incorrect-feedback'); }, 500);
    }
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
