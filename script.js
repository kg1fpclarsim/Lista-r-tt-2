const SCRIPT_JS_VERSION = '7.0-FINAL';

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
        // ... (denna funktion är oförändrad) ...
    }

    async function initializeGame() {
        // ... (denna funktion är oförändrad) ...
    }
    
    // KORRIGERAD: Denna funktion är nu 'async' för att kunna använda 'await'
    async function setupCurrentScenarioStep() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentSequenceStep = 0;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        scenarioTitle.textContent = loadedScenario.title;
        nextScenarioButton.style.display = 'none';
        
        const startMenu = currentStepData.startMenu || 'main';
        
        // Steg 1: Säg åt motorn att rita om och VÄNTA tills den är klar
        await simulator.reset(startMenu);

        // Steg 2: Fyll i textrutorna. Detta körs först när reset är helt färdig.
        const overlayState = currentStepData.initialOverlayState || {};
        for (const overlayId in overlayState) {
            const text = overlayState[overlayId];
            const overlayElement = simulatorContainer.querySelector(`#${overlayId}`);
            if (overlayElement) {
                overlayElement.textContent = text;
            }
        }
        
        // Steg 3: Starta typewriter-animationen
        animateTypewriter(scenarioDescription, currentStepData.description, () => {
            feedbackMessage.textContent = 'Väntar på din första åtgärd...';
            feedbackArea.className = 'feedback-neutral';
        });
    }
    
    function animateTypewriter(element, markdownText, onComplete) {
        // ... (denna funktion är oförändrad) ...
    }

    nextScenarioButton.addEventListener('click', () => {
        // ... (denna funktion är oförändrad) ...
    });

    const simulator = initializeSimulator(simulatorContainer, 'main', handlePlayerClick);
    initializeGame();
});

