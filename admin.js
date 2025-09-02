document.addEventListener('DOMContentLoaded', () => {
    const ALL_EVENTS = [
        "Lasta ut", "Lossa in", "Hämta", "Leverera", "Bomhämtning", 
        "Ej levererat", "Hämtning utan sändnings-ID", "Åter terminal", "Flänsa",
        "Hämta åt annan bil", "Hämta obokad hämtning",
        "Flänsa på", "Flänsa av",
        "Hem", "Synkronisera visa", "Ångra" // Se till att alla knappar finns med
    ];
    let scenarios = [];
    let stepCounter = 0;

    // ... (alla const-deklarationer för HTML-element är oförändrade) ...
    const scenarioTitleInput = document.getElementById('scenario-title');
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const saveScenarioBtn = document.getElementById('save-scenario-btn');
    const jsonOutput = document.getElementById('json-output');
    const scenariosList = document.getElementById('scenarios-list');

    // ... (loadExistingScenarios och renderScenariosList är oförändrade) ...
    async function loadExistingScenarios() { /* ... */ }
    function renderScenariosList() { /* ... */ }

    function addStep() {
    const stepId = stepCounter++;
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-card';
    stepDiv.dataset.stepId = stepId;
    
    let buttonsHtml = ALL_EVENTS.map(event => `<button class="btn sequence-builder-btn" data-event-name="${event}">${event}</button>`).join('');
    let optionsHtml = ALL_EVENTS.map(event => `<option value="${event}">${event}</option>`).join('');

    stepDiv.innerHTML = `
        <div class="step-header">
            <h4>Delmoment ${stepsContainer.children.length + 1}</h4>
            <button class="delete-btn step-delete-btn">Ta bort</button>
        </div>
        <label>Beskrivning / Fråga (Markdown):</label>
        <textarea class="step-description" rows="4"></textarea>
        <label>Allmänt felmeddelande (valfritt):</label>
        <input type="text" class="step-error-message" placeholder="Används om inget specifikt meddelande finns">
        
        <div class="specific-errors-container"></div>
        <button class="btn btn-secondary btn-add-specific-error">Lägg till specifikt felmeddelande</button>

        <label>Korrekt sekvens (klicka i ordning):</label>
        <div class="sequence-header">
            <div class="sequence-display step-sequence-display"></div>
            <button class="btn btn-secondary btn-clear-sequence">Rensa sekvens</button>
        </div>
        
        <label class="scoring-label" style="display: none;">Vilka klick ska ge "Korrekt"-feedback?</label>
        <div class="scoring-clicks-container"></div>

        <div class="button-grid">${buttonsHtml}</div>
    `;
    stepsContainer.appendChild(stepDiv);

    // Hämta referenser till de nya elementen
    const sequenceDisplay = stepDiv.querySelector('.step-sequence-display');
    const scoringContainer = stepDiv.querySelector('.scoring-clicks-container');
    const scoringLabel = stepDiv.querySelector('.scoring-label');
    const clearSequenceBtn = stepDiv.querySelector('.btn-clear-sequence');
    let currentSequence = [];

    stepDiv.querySelector('.step-delete-btn').addEventListener('click', () => stepDiv.remove());
    stepDiv.querySelector('.btn-add-specific-error').addEventListener('click', (e) => {
        const container = e.target.previousElementSibling;
        const errorRow = document.createElement('div');
        errorRow.className = 'specific-error-row';
        errorRow.innerHTML = `
            <span>OM man klickar på:</span>
            <select class="specific-error-key">${optionsHtml}</select>
            <span>VISA meddelandet:</span>
            <input type="text" class="specific-error-value" placeholder="T.ex. Du kan inte leverera nu...">
            <button class="delete-btn small-delete-btn">X</button>
        `;
        container.appendChild(errorRow);
        errorRow.querySelector('.small-delete-btn').addEventListener('click', () => errorRow.remove());
    });
    
    stepDiv.querySelectorAll('.sequence-builder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventName = btn.dataset.eventName;
            currentSequence.push(eventName);
            sequenceDisplay.innerHTML += `<span class="sequence-step">${eventName}</span>`;
            stepDiv.dataset.sequence = JSON.stringify(currentSequence);
            
            scoringLabel.style.display = 'block';
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'scoring-checkbox';
            checkboxDiv.innerHTML = `<input type="checkbox" id="scoring_${stepId}_${currentSequence.length}" value="${eventName}" checked><label for="scoring_${stepId}_${currentSequence.length}">${eventName}</label>`;
            scoringContainer.appendChild(checkboxDiv);
        });
    });

    // NY EVENT LISTENER FÖR RENSA-KNAPPEN
    clearSequenceBtn.addEventListener('click', () => {
        currentSequence = [];
        stepDiv.dataset.sequence = '[]';
        sequenceDisplay.innerHTML = '';
        scoringContainer.innerHTML = '';
        scoringLabel.style.display = 'none';
    });
}
    
    addStepBtn.addEventListener('click', addStep);

    saveScenarioBtn.addEventListener('click', () => {
        // ... (början av funktionen är oförändrad) ...
        const title = scenarioTitleInput.value.trim();
        if (!title) { alert("Du måste ange en titel för scenariot."); return; }
        const newScenario = { title: title, steps: [] };
        const stepCards = stepsContainer.querySelectorAll('.step-card');

        stepCards.forEach(card => {
            const description = card.querySelector('.step-description').value.trim();
            const sequence = JSON.parse(card.dataset.sequence || '[]');
            if (!description || sequence.length === 0) return;
            
            const stepData = { description, sequence };
            const customErrorMessage = card.querySelector('.step-error-message').value.trim();
            if (customErrorMessage) { stepData.customErrorMessage = customErrorMessage; }

            const wrongClickMessages = {};
            card.querySelectorAll('.specific-error-row').forEach(row => { /* ... (oförändrad) ... */ });
            if (Object.keys(wrongClickMessages).length > 0) { stepData.wrongClickMessages = wrongClickMessages; }

            // NYTT: Läs av kryssrutorna
            const scoringClicks = [];
            card.querySelectorAll('.scoring-clicks-container input[type="checkbox"]:checked').forEach(checkbox => {
                scoringClicks.push(checkbox.value);
            });
            // Lägg bara till 'scoringClicks' om den inte är identisk med hela sekvensen
            if (scoringClicks.length < sequence.length) {
                stepData.scoringClicks = scoringClicks;
            }

            newScenario.steps.push(stepData);
        });

        // ... (resten av funktionen är oförändrad) ...
    });

    loadExistingScenarios();
    addStep();
});
