const SCRIPT_JS_VERSION = '5.5-FINAL';

document.addEventListener('DOMContentLoaded', () => {
    const simulatorContainer = document.getElementById('simulator-wrapper');
    if (!simulatorContainer) {
        console.error("FATALT FEL i script.js: Behållaren #simulator-wrapper hittades inte.");
        return;
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
        let scenarioPlaylist = JSON.parse(sessionStorage.getItem('scenarioPlaylist'));
        let currentPlaylistIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        if (!scenarioPlaylist) {
            try {
                const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
                if (!response.ok) throw new Error('Nätverksfel');
                let allScenarios = await response.json();
                if (!Array.isArray(allScenarios)) throw new Error("scenarios.json är inte en giltig lista.");
                const validScenarios = allScenarios.filter(s => s.steps && s.steps.length > 0);
                if (!validScenarios.length) {
                    scenarioTitle.textContent = "Inga giltiga scenarier hittades";
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

