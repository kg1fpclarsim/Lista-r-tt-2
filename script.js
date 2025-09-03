// script.js (ny, förenklad version)
document.addEventListener('DOMContentLoaded', () => {
    const simulatorContainer = document.querySelector('.game-container');
    const scenarioTitle = document.getElementById('scenario-title');
    const scenarioDescription = document.getElementById('scenario-description');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackArea = document.getElementById('feedback-area');
    const nextScenarioButton = document.getElementById('reset-button');
    let typewriterInterval = null;

    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;

    function handlePlayerClick(clickedEvent) {
        if (!loadedScenario) return;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        const targetActions = currentStepData.sequence;
        const isStepFinished = currentSequenceStep >= targetActions.length;
        if (isStepFinished) return;

        const nextTargetAction = targetActions[currentSequenceStep];
        const areaElement = document.querySelector(`[data-event-name="${clickedEvent.name}"]`); // Not robust, needs improvement

        if (clickedEvent.name === nextTargetAction) {
            feedbackMessage.textContent = `Korrekt! "${clickedEvent.name}" var rätt steg.`;
            feedbackArea.className = 'feedback-correct';
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
            if (currentStepData.customErrorMessage) { errorMessage = currentStepData.customErrorMessage; }
            if (currentStepData.wrongClickMessages && currentStepData.wrongClickMessages[clickedEvent.name]) {
                errorMessage = currentStepData.wrongClickMessages[clickedEvent.name];
            }
            feedbackMessage.textContent = errorMessage;
            feedbackArea.className = 'feedback-incorrect';
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
                if (!allScenarios || allScenarios.length === 0) {
                     scenarioTitle.textContent = "Inga Scenarier Hittades";
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
        currentSequenceStep = 0;
        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        scenarioTitle.textContent = loadedScenario.title;
        feedbackMessage.textContent = 'Väntar på din första åtgärd...';
        feedbackArea.className = 'feedback-neutral';
        nextScenarioButton.style.display = 'none';
        animateTypewriter(scenarioDescription, currentStepData.description);
    }
    
    function animateTypewriter(element, markdownText) {
        if (typewriterInterval) clearInterval(typewriterInterval);
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

    nextScenarioButton.addEventListener('click', () => {
        let currentIndex = parseInt(sessionStorage.getItem('currentPlaylistIndex') || '0', 10);
        sessionStorage.setItem('currentPlaylistIndex', currentIndex + 1);
        location.reload();
    });

    initializeSimulator(simulatorContainer, 'main', handlePlayerClick);
    initializeGame();
});
