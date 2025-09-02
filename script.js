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
                    backButtonCoords: { top: 145, left: 70, width: 20, height: 25 }, // Rättad från "with"
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
                    backButtonCoords: { top: 145, left: 70, width: 20, height: 25 }, // Rättad från "with"
                    events: [
                        { name: "Flänsa på", coords: { top: 197, left: 71, width: 138, height: 76 } },
                        { name: "Flänsa av", coords: { top: 197, left: 221, width: 138, height: 76 } }
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
        feedback
