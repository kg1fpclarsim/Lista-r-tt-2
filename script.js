const SCRIPT_JS_VERSION = '2.7-FINAL';

document.addEventListener('DOMContentLoaded', () => {
    const simulatorContainer = document.getElementById('simulator-wrapper');
    if (!simulatorContainer) { console.error("FATALT FEL: #simulator-wrapper hittades inte."); return; }

    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioDescription = document.getElementById('scenario-description');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackArea = document.getElementById('feedback-area');
    const nextScenarioButton = document.getElementById('reset-button');
    let typewriterInterval = null;
    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;

    function handlePlayerClick(clickedEvent, areaElement) {
        if (!loadedScenario) return;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        const targetActions = currentStepData.sequence;
        const isStepFinished = currentSequenceStep >= targetActions.length;
        if (isStepFinished && currentScenarioStepIndex >= loadedScenario.steps.length - 1) return;
        if (isStepFinished) return;

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
                        feedbackMessage.textContent = 'Bra gjort! Hela scenariot är slutfört. Klicka på "Nästa Scenario".';
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
            if (currentStepData.customErrorMessage) errorMessage = currentStepData.customErrorMessage;
            if (currentStepData.wrongClickMessages && currentStepData.wrongClickMessages[clickedEvent.name]) {
                errorMessage = currentStepData.wrongClickMessages[clickedEvent.name];
            }
            feedbackMessage.textContent = errorMessage;
            feedbackArea.className = 'feedback-incorrect';
            if (areaElement) {
                areaElement.classList.add('area-incorrect-feedback');
                setTimeout(() => areaElement.classList.remove('area-incorrect-feedback'), 500);
            }
        }
    }

    async function initializeGame() {
        // ... (denna funktion är oförändrad från förra kompletta versionen) ...
    }
    
    // KORRIGERAD FUNKTION
    function setupCurrentScenarioStep() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentSequenceStep = 0;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        scenarioTitle.textContent = loadedScenario.title;
        nextScenarioButton.style.display = 'none';
        
        // Återställ simulatorn TILL RÄTT MENY och skicka med start-texten
        const startMenu = currentStepData.startMenu || 'main';
        const overlayState = currentStepData.initialOverlayState || {};
        simulator.reset(startMenu, overlayState);

        animateTypewriter(scenarioDescription, currentStepData.description, () => {
            feedbackMessage.textContent = 'Väntar på din första åtgärd...';
            feedbackArea.className = 'feedback-neutral';
        });
    }
    
    // KORRIGERAD FUNKTION
    function animateTypewriter(element, markdownText, onComplete) {
        if (typewriterInterval) clearInterval(typewriterInterval);
        const tokens = markdownText.split(/(\s+)/);
        let currentTokenIndex = 0;
        element.innerHTML = '';
        element.classList.add('typing');
        typewriterInterval = setInterval(() => {
            if (currentTokenIndex < tokens.length) {
                element.innerHTML = marked.parse(tokens.slice(0, currentTokenIndex + 1).join(''));
                currentTokenIndex++;
            } else {
                clearInterval(typewriterInterval);
                element.innerHTML = marked.parse(markdownText);
                element.classList.remove('typing');
                if (typeof onComplete === 'function') onComplete();
            }
        }, 80);
    }

    nextScenarioButton.addEventListener('click', () => {
        let currentIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        sessionStorage.setItem('currentPlaylistIndex', currentIndex + 1);
        location.reload();
    });

    const simulator = initializeSimulator(simulatorContainer, 'main', handlePlayerClick);
    initializeGame();
});
