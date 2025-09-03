document.addEventListener('DOMContentLoaded', () => {
    // Dina koordinater och ORIGINAL_IMAGE_WIDTH är oförändrade...
    const ORIGINAL_IMAGE_WIDTH = 426; 
    const topLevelMenu = { /* ... din data med alla koordinater ... */ };

    let loadedScenario = null;
    let currentScenarioStepIndex = 0;
    let currentSequenceStep = 0;
    let currentMenuView = topLevelMenu;
    let menuHistory = [];
    let typewriterInterval = null;

    // HTML-element referenser (oförändrade)
    const gameImage = document.getElementById('game-image');
    // ... och alla andra ...

    // Helt omskriven klick-hanterare
    function handleEventClick(clickedEvent, areaElement) {
        if (!loadedScenario) return;

        const currentStepData = loadedScenario.steps[currentScenarioStepIndex];
        const targetActions = currentStepData.sequence;
        const isScenarioComplete = currentSequenceStep >= targetActions.length;

        // Om hela delmomentet redan är slutfört, tillåt endast fri navigering
        if (isScenarioComplete) {
            if (clickedEvent.submenu) {
                menuHistory.push(currentMenuView);
                switchMenuView(clickedEvent.submenu);
            }
            return;
        }

        const nextTargetAction = targetActions[currentSequenceStep];

        // PRIORITET 1: Är klicket nästa AVGÖRANDE HANDLING?
        if (clickedEvent.name === nextTargetAction) {
            feedbackMessage.textContent = `Korrekt! "${clickedEvent.name}" var rätt steg.`;
            feedbackArea.className = 'feedback-correct';
            areaElement.classList.add('area-correct-feedback');
            areaElement.style.pointerEvents = 'none';
            currentSequenceStep++;
            
            const isStepComplete = currentSequenceStep === targetActions.length;
            if (isStepComplete) {
                // ... (logiken för att avsluta ett steg/scenario är oförändrad) ...
            }
            
            // Hantera navigering om den korrekta knappen också har en undermeny
            if (clickedEvent.submenu) {
                menuHistory.push(currentMenuView);
                switchMenuView(clickedEvent.submenu);
            }
            return; // Avsluta eftersom vi har hanterat klicket
        }

        // PRIORITET 2: Är klicket BARA en navigering?
        if (clickedEvent.submenu) {
            menuHistory.push(currentMenuView);
            switchMenuView(clickedEvent.submenu);
            return; // Avsluta, ingen feedback för ren navigering
        }

        // PRIORITET 3: Om inget av ovanstående, då är det ett FELAKTIGT KLICK
        const clickedName = clickedEvent.name;
        let errorMessage = "Fel knapp för denna uppgift."; // Nytt, bättre standardmeddelande
        if (currentStepData.customErrorMessage) { errorMessage = currentStepData.customErrorMessage; }
        if (currentStepData.wrongClickMessages && currentStepData.wrongClickMessages[clickedName]) {
            errorMessage = currentStepData.wrongClickMessages[clickedName];
        }
        feedbackMessage.textContent = errorMessage;
        feedbackArea.className = 'feedback-incorrect';
        areaElement.classList.add('area-incorrect-feedback');
        setTimeout(() => { areaElement.classList.remove('area-incorrect-feedback'); }, 500);
    }
    
    // Justerad "Tillbaka"-knapp - tar inte längre bort steg i sekvensen
    function createBackButton(menuData) {
        navOverlay.innerHTML = '';
        if (menuData.backButtonCoords) {
            const backArea = document.createElement('div');
            backArea.classList.add('clickable-area');
            const coords = menuData.backButtonCoords;
            backArea.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height];
            backArea.addEventListener('click', () => {
                if (menuHistory.length > 0) {
                    // Tar INTE längre bort ett steg med currentSequenceStep--
                    const previousMenu = menuHistory.pop();
                    switchMenuView(previousMenu);
                }
            });
            navOverlay.appendChild(backArea);
        }
    }

    // --- ÖVRIGA FUNKTIONER (kopiera in hela blocket för säkerhets skull) ---
    // (Jag inkluderar alla funktioner här så du kan ersätta hela filen)
    
    function animateTypewriter(element, markdownText) { /* ... oförändrad ... */ }
    async function initializeGame() { /* ... oförändrad ... */ }
    // Knappen för nästa scenario (oförändrad)
    nextScenarioButton.textContent = 'Nästa Scenario';
    nextScenarioButton.style.display = 'none';
    nextScenarioButton.addEventListener('click', () => { /* ... oförändrad ... */ });
    function setupCurrentScenarioStep() { /* ... oförändrad ... */ }
    function resetGameState() { /* ... oförändrad ... */ }
    function scaleClickableAreas() { /* ... oförändrad ... */ }
    function switchMenuView(menuData) { /* ... oförändrad ... */ }
    function createClickableAreas(eventsToCreate) { /* ... oförändrad ... */ }

    // Initiering
    window.addEventListener('resize', scaleClickableAreas);
    initializeGame(); 
});
