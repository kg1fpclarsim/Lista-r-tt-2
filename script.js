const SCRIPT_JS_VERSION = '2.3-FINAL'; // Versionsnummer

document.addEventListener('DOMContentLoaded', () => {
    // Diagnostik: Kontrollera om behållaren finns vid start
    const simulatorContainer = document.getElementById('simulator-wrapper');
    if (!simulatorContainer) {
        console.error("FATALT FEL i script.js: Behållaren #simulator-wrapper hittades inte i HTML-koden.");
        return; // Stoppa all exekvering om behållaren saknas
    }

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
                        nextScenarioButton.style.display = 'block'; // <-- VISA KNAPPEN HÄR
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

    async function initializeGame() {
        let scenarioPlaylist = JSON.parse(sessionStorage.getItem('scenarioPlaylist'));
        let currentPlaylistIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        if (!scenarioPlaylist) {
            try {
                const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
                if (!response.ok) throw new Error('Nätverksfel');
                let allScenarios = await response.json();
                if (!Array.isArray(allScenarios)) { throw new Error("scenarios.json är inte en giltig lista (array)."); }
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
                document.getElementById('scenario-description').innerHTML = `<p style="color: red;"><strong>Fel:</strong> ${error.message}</p>`;
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
    
    function setupCurrentScenarioStep() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        currentSequenceStep = 0;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        scenarioTitle.textContent = loadedScenario.title;
        
        // Återställ simulatorns vy och knappar
        nextScenarioButton.style.display = 'none'; // <-- DÖLJ KNAPPEN HÄR
        simulator.reset();

        animateTypewriter(scenarioDescription, currentStepData.description, () => {
            feedbackMessage.textContent = 'Väntar på din första åtgärd...';
            feedbackArea.className = 'feedback-neutral';
        });
        setTimeout(() => {
            if (currentStepData.initialOverlayState) {
                for (const overlayId in currentStepData.initialOverlayState) {
                    const text = currentStepData.initialOverlayState[overlayId];
                    const overlayElement = document.getElementById(overlayId);
                    if (overlayElement) {
                        overlayElement.textContent = text;
                    }
                }
            }
        }, 100);
    }
    
    function animateTypewriter(element, markdownText, onComplete) {
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
    }

    element.innerHTML = '';
    element.classList.add('typing');

    // KORRIGERING: Dela upp texten i ord istället för tecken
    const words = markdownText.split(' ');
    let currentWordIndex = 0;

    typewriterInterval = setInterval(() => {
        if (currentWordIndex < words.length) {
            // Bygg upp meningen ord för ord
            const currentSentence = words.slice(0, currentWordIndex + 1).join(' ');
            element.innerHTML = marked.parse(currentSentence + ' '); // Lägg till ett mellanslag för markören
            currentWordIndex++;
        } else {
            // När texten är klar, avbryt animationen och ta bort markören
            clearInterval(typewriterInterval);
            element.classList.remove('typing');
            // Kör onComplete-funktionen om den finns
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    }, 120); // Justerad hastighet för att passa ord (högre = långsammare)
}

    nextScenarioButton.addEventListener('click', () => {
        let currentIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        sessionStorage.setItem('currentPlaylistIndex', currentIndex + 1);
        location.reload();
    });

    const simulator = initializeSimulator(simulatorContainer, 'main', handlePlayerClick);
    initializeGame();
});
