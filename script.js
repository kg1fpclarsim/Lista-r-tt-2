document.addEventListener('DOMContentLoaded', () => {
    // ####################################################################
    // ### STEG 1: ÄNDRA VÄRDET NEDAN                                   ###
    // ####################################################################
    // Ersätt 430 med den verkliga bredden i pixlar på din `handdator.png`-fil.
    const ORIGINAL_IMAGE_WIDTH = 426; 
    // ####################################################################

    const topLevelMenu = {
        // ... (din topLevelMenu-struktur med alla koordinater är oförändrad) ...
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
            }
        ]
    };

    let scenarioSequence = [];
    let currentStep = 0;
    let currentMenuView = topLevelMenu;
    let menuHistory = [];

    const gameImage = document.getElementById('game-image');
    const imageContainer = document.getElementById('image-container');
    const navOverlay = document.getElementById('navigation-overlay');
    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioDescription = document.getElementById('scenario-description');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackArea = document.getElementById('feedback-area');
    const resetButton = document.getElementById('reset-button');
    
    // --- NY FUNKTION FÖR OMSKALNING ---
    function scaleClickableAreas() {
        const scaleRatio = gameImage.offsetWidth / ORIGINAL_IMAGE_WIDTH;
        if (!scaleRatio) return; // Gör inget om bilden inte är synlig

        // Skala om knapparna i huvudfönstret
        imageContainer.querySelectorAll('.clickable-area').forEach(area => {
            const originalCoords = area.dataset.originalCoords.split(',').map(Number);
            area.style.top = `${originalCoords[0] * scaleRatio}px`;
            area.style.left = `${originalCoords[1] * scaleRatio}px`;
            area.style.width = `${originalCoords[2] * scaleRatio}px`;
            area.style.height = `${originalCoords[3] * scaleRatio}px`;
        });
        
        // Skala om "Tillbaka"-knappen
        const backArea = navOverlay.querySelector('.clickable-area');
        if (backArea) {
            const originalCoords = backArea.dataset.originalCoords.split(',').map(Number);
            backArea.style.top = `${originalCoords[0] * scaleRatio}px`;
            backArea.style.left = `${originalCoords[1] * scaleRatio}px`;
            backArea.style.width = `${originalCoords[2] * scaleRatio}px`;
            backArea.style.height = `${originalCoords[3] * scaleRatio}px`;
        }
    }

    // Funktioner för att byta vy, skapa knappar, hantera klick etc.
    function switchMenuView(menuData) {
        currentMenuView = menuData;
        gameImage.src = menuData.image;
        
        // Vänta på att den nya bilden laddas innan vi ritar och skalar om knapparna
        gameImage.onload = () => {
            createClickableAreas(menuData.events);
            createBackButton(menuData);
            scaleClickableAreas(); // Skala om direkt när bilden är laddad
        };
    }

    // Separat funktion för att skapa tillbaka-knappen
    function createBackButton(menuData) {
        navOverlay.innerHTML = '';
        if (menuData.backButtonCoords) {
            const backArea = document.createElement('div');
            backArea.classList.add('clickable-area');
            const coords = menuData.backButtonCoords;
            // Spara original-koordinaterna på elementet
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
    
    // Uppdaterad för att spara original-koordinaterna
    function createClickableAreas(eventsToCreate) {
        imageContainer.querySelectorAll('.clickable-area').forEach(area => area.remove());
        if (!eventsToCreate) return;
        
        eventsToCreate.forEach(event => {
            const area = document.createElement('div');
            area.classList.add('clickable-area');
            const coords = event.coords;
            // Spara original-koordinaterna på elementet
            area.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height];
            area.addEventListener('click', () => handleEventClick(event, area));
            imageContainer.appendChild(area);
        });
    }

    // Alla andra funktioner (loadRandomScenario, resetGameState, handleEventClick) är oförändrade
    async function loadRandomScenario() {
        try {
            const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
            if (!response.ok) throw new Error('Nätverksfel');
            const allScenarios = await response.json();

            if (!allScenarios || allScenarios.length === 0) {
                scenarioTitle.textContent = "Inga Scenarier Hittades";
                scenarioDescription.textContent = "Filen scenarios.json är tom. Öppna admin.html för att skapa ditt första scenario.";
                imageContainer.style.display = 'none';
                return;
            }
            const randomScenario = allScenarios[Math.floor(Math.random() * allScenarios.length)];
            scenarioSequence = randomScenario.sequence;
            scenarioTitle.textContent = "Övning";
            scenarioDescription.innerHTML = marked.parse(randomScenario.description);
            resetGameState();
        } catch (error) {
            console.error("Fel vid laddning av scenario:", error);
            scenarioTitle.textContent = "Ett fel uppstod";
            scenarioDescription.textContent = "Kunde inte ladda övningarna. Se till att filen scenarios.json finns och är korrekt formaterad.";
        }
    }
    
    function resetGameState() {
        currentStep = 0;
        menuHistory = [];
        feedbackMessage.textContent = 'Väntar på din första åtgärd...';
        feedbackArea.className = 'feedback-neutral';
        imageContainer.style.display = 'block';
        switchMenuView(topLevelMenu);
    }

    function handleEventClick(clickedEvent, areaElement) {
        if (!scenarioSequence || scenarioSequence.length === 0) return;
        const isFinished = currentStep >= scenarioSequence.length;
        if(isFinished) return;
        if (clickedEvent.name === scenarioSequence[currentStep]) {
            feedbackMessage.textContent = `Korrekt! "${clickedEvent.name}" var rätt steg.`;
            feedbackArea.className = 'feedback-correct';
            areaElement.classList.add('area-correct-feedback');
            areaElement.style.pointerEvents = 'none';
            currentStep++;
            const isComplete = currentStep === scenarioSequence.length;
            if (menuHistory.length > 0 && !clickedEvent.submenu) {
                setTimeout(() => {
                    menuHistory = [];
                    switchMenuView(topLevelMenu);
                    if (isComplete) {
                        feedbackMessage.textContent = 'Bra gjort! Hela sekvensen är korrekt.';
                        feedbackArea.className = 'feedback-correct';
                    }
                }, 700);
                return;
            }
            if (isComplete) {
                feedbackMessage.textContent = 'Bra gjort! Hela sekvensen är korrekt.';
                feedbackArea.className = 'feedback-correct';
            }
            if (clickedEvent.submenu) {
                menuHistory.push(currentMenuView);
                switchMenuView(clickedEvent.submenu);
            }
        } else {
            feedbackMessage.textContent = `Fel ordning. Försök igen.`;
            feedbackArea.className = 'feedback-incorrect';
            areaElement.classList.add('area-incorrect-feedback');
            setTimeout(() => { areaElement.classList.remove('area-incorrect-feedback'); }, 500);
        }
    }

    // --- LYSSNA EFTER FÖNSTERÄNDRING ---
    // Kör funktionen för omskalning när fönstrets storlek ändras
    window.addEventListener('resize', scaleClickableAreas);

    // Starta spelet
    loadRandomScenario(); 
});
