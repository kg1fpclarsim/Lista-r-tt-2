// script.js (Komplett version med förbättrad feedback-timing)
document.addEventListener('DOMContentLoaded', () => {
    // ####################################################################
    // ### KONFIGURATION                                                ###
    // ####################################################################
    const ORIGINAL_IMAGE_WIDTH = 426;
    const START_MENU_KEY = 'main';
    // ####################################################################

    // Variabler för spellogiken
    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;
    let typewriterInterval = null;

    // HTML-element referenser
    const simulatorContainer = document.getElementById('simulator-wrapper');
    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioDescription = document.getElementById('scenario-description');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackArea = document.getElementById('feedback-area');
    const nextScenarioButton = document.getElementById('reset-button');
    
    // --- FUNKTIONER ---

    // UPPDATERAD: Kan nu ta emot en "onComplete" callback-funktion
    function animateTypewriter(element, markdownText, onComplete) {
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
                // KÖR CALLBACK-FUNKTIONEN NÄR ANIMATIONEN ÄR KLAR
                if (typeof onComplete === 'function') {
                    onComplete();
                }
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
                const validScenarios = allScenarios.filter(scenario => scenario.steps && scenario.steps.length > 0);
                if (!validScenarios || validScenarios.length === 0) {
                    scenarioTitle.textContent = "Inga giltiga scenarier hittades";
                    document.getElementById('scenario-description-wrapper').style.display = 'none';
                    simulatorContainer.style.display = 'none';
                    return;
                }
                for (let i = validScenarios.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [validScenarios[i], validScenarios[j]] = [validScenarios[j], validScenarios[i]];
                }
                scenarioPlaylist = validScenarios;
                sessionStorage.setItem('scenarioPlaylist', JSON.stringify(scenarioPlaylist));
                sessionStorage.setItem('currentPlaylistIndex', '0');
            } catch (error) {
                console.error("Fel vid laddning av scenarios.json:", error);
                scenarioTitle.textContent = "Ett fel uppstod";
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

    // UPPDATERAD: Anropar nu animateTypewriter med en callback-funktion
    function setupCurrentScenarioStep() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentSequenceStep = 0;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        scenarioTitle.textContent = loadedScenario.title;
        
        // Återställ simulatorn och knappen, men INTE feedback-rutan än
        resetGameState();

        // Anropa typewriter och skicka med en funktion som ska köras när den är KLAR
        animateTypewriter(scenarioDescription, currentStepData.description, () => {
            // Denna kod körs först efter att hela texten har skrivits ut
            feedbackMessage.textContent = 'Väntar på din första åtgärd...';
            feedbackArea.className = 'feedback-neutral';
        });
    }
    
    // UPPDATERAD: Återställer inte längre feedback-rutan
    function resetGameState() {
        nextScenarioButton.style.display = 'none';
        simulator.reset();
    }
    
    function handlePlayerClick(clickedEvent, areaElement) {
        if (!loadedScenario) return;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        const targetActions = currentStepData.sequence;
        const isStepFinished = currentSequenceStep >= targetActions.length;
        if (isStepFinished && currentScenarioStepIndex >= loadedScenario.steps.length - 1) return;
        if (isStepFinished) { return; }

        const nextTargetAction = targetActions[currentSequenceStep];
        if (clickedEvent.name === nextTargetAction) {
            feedbackMessage.textContent = `Korrekt! "${clickedEvent.name}" var rätt steg.`;
            feedbackArea.className = 'feedback-correct';
            if (areaElement) {
                areaElement.classList.add('area-correct-feedback');
                areaElement.style.pointerEvents = 'none';
            }
            currentSequenceStep++;
            const isStepComplete = currentSequenceStep === targetActions.length;
            if (isStepComplete) {
                const isLastStepOfScenario = currentScenarioStepIndex === loadedScenario.steps.length - 1;
                if (isLastStepOfScenario) {
                    setTimeout(() => {
                        feedbackMessage.textContent = 'Bra gjort! Hela scenariot är slutfört. Klicka på "Nästa Scenario" för att fortsätta.';
                        nextScenarioButton.style.display = 'block';
                    }, 700);
                } else {
                    setTimeout(() => {
                        currentScenarioStepIndex++;
                        setupCurrentScenarioStep();
                    }, 1200);
                }
            }
        } else if (!clickedEvent.submenu && clickedEvent.name !== 'Tillbaka') {
            let errorMessage = "Fel knapp för denna uppgift.";
            if (currentStepData.customErrorMessage) { errorMessage = currentStepData.customErrorMessage; }
            if (currentStepData.wrongClickMessages && currentStepData.wrongClickMessages[clickedEvent.name]) {
                errorMessage = currentStepData.wrongClickMessages[clickedEvent.name];
            }
            feedbackMessage.textContent = errorMessage;
            feedbackArea.className = 'feedback-incorrect';
            if (areaElement) {
                areaElement.classList.add('area-incorrect-feedback');
                setTimeout(() => { areaElement.classList.remove('area-incorrect-feedback'); }, 500);
            }
        }
    }

    nextScenarioButton.addEventListener('click', () => {
        let currentIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        sessionStorage.setItem('currentPlaylistIndex', currentIndex + 1);
        location.reload();
    });

    const simulator = initializeSimulator(simulatorContainer, START_MENU_KEY, handlePlayerClick);
    initializeGame();
});
