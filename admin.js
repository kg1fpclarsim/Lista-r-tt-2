// admin.js (ny version)
document.addEventListener('DOMContentLoaded', () => {
    const simulatorContainer = document.getElementById('simulator-container');
    const scenarioTitleInput = document.getElementById('scenario-title');
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const saveScenarioBtn = document.getElementById('save-scenario-btn');
    const jsonOutput = document.getElementById('json-output');
    const scenariosList = document.getElementById('scenarios-list');
    
    let scenarios = [];
    let stepCounter = 0;
    let activeStepCard = null;

    function recordSimulatorClick(clickedEvent) {
        if (!activeStepCard) {
            alert("Klicka i ett delmoments beskrivningsruta för att aktivera det först.");
            return;
        }
        const eventName = clickedEvent.name;
        const sequenceDisplay = activeStepCard.querySelector('.step-sequence-display');
        const scoringContainer = activeStepCard.querySelector('.scoring-clicks-container');
        const clickCounter = (sequenceDisplay.children.length);
        sequenceDisplay.innerHTML += `<span class="sequence-step">${eventName}</span>`;
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'scoring-checkbox';
        checkboxDiv.innerHTML = `<input type="checkbox" id="scoring_${activeStepCard.dataset.stepId}_${clickCounter}" value="${eventName}"><label for="scoring_${activeStepCard.dataset.stepId}_${clickCounter}">${eventName}</label>`;
        scoringContainer.appendChild(checkboxDiv);
    }

    function addStep() {
        const stepId = stepCounter++;
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        stepDiv.dataset.stepId = stepId;
        const allEventNames = Object.values(ALL_MENUS).flatMap(menu => menu.events.map(event => event.name));
        const uniqueEventNames = [...new Set(allEventNames)];
        let optionsHtml = uniqueEventNames.map(event => `<option value="${event}">${event}</option>`).join('');

        stepDiv.innerHTML = `
            <div class="step-header"><h4>Delmoment ${stepsContainer.children.length + 1}</h4><button class="delete-btn step-delete-btn">Ta bort</button></div>
            <label>Beskrivning / Fråga:</label>
            <textarea class="step-description" rows="3" placeholder="Skriv uppgiften här..."></textarea>
            <label>Allmänt felmeddelande (valfritt):</label>
            <input type="text" class="step-error-message" placeholder="Används om inget specifikt meddelande finns">
            <div class="specific-errors-container"></div>
            <button class="btn btn-secondary btn-add-specific-error">Lägg till specifikt felmeddelande</button>
            <label>Inspelad sekvens (från simulatorn):</label>
            <div class="sequence-header"><div class="sequence-display step-sequence-display"></div><button class="btn btn-secondary btn-clear-sequence">Rensa</button></div>
            <label class="scoring-label">Vilka klick ska ge poäng? (Bocka ur navigationsklick)</label>
            <div class="scoring-clicks-container"></div>
        `;
        stepsContainer.appendChild(stepDiv);

        stepDiv.addEventListener('click', () => {
            document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
            stepDiv.classList.add('active');
            activeStepCard = stepDiv;
        });

        stepDiv.querySelector('.step-delete-btn').addEventListener('click', (e) => { e.stopPropagation(); if (activeStepCard === stepDiv) activeStepCard = null; stepDiv.remove(); });
        stepDiv.querySelector('.btn-clear-sequence').addEventListener('click', (e) => { e.stopPropagation(); stepDiv.querySelector('.step-sequence-display').innerHTML = ''; stepDiv.querySelector('.scoring-clicks-container').innerHTML = ''; });
        stepDiv.querySelector('.btn-add-specific-error').addEventListener('click', (e) => {
            e.stopPropagation();
            const container = e.target.previousElementSibling;
            const errorRow = document.createElement('div');
            errorRow.className = 'specific-error-row';
            errorRow.innerHTML = `<span>OM man klickar på:</span><select class="specific-error-key">${optionsHtml}</select><span>VISA:</span><input type="text" class="specific-error-value"><button class="delete-btn small-delete-btn">X</button>`;
            container.appendChild(errorRow);
            errorRow.querySelector('.small-delete-btn').addEventListener('click', () => errorRow.remove());
        });
        
        stepDiv.click();
    }
    
    // Starta simulatorn och spara referensen till dess kontroller
    const simulator = initializeSimulator(simulatorContainer, 'main', recordSimulatorClick);

    addStepBtn.addEventListener('click', () => {
        addStep();
        // Återställ simulatorn till huvudmenyn
        simulator.reset();
    });

    // Spara-logiken behöver uppdateras för att inkludera de nya fälten
    saveScenarioBtn.addEventListener('click', () => {
        const title = scenarioTitleInput.value.trim();
        if (!title) { alert("Du måste ange en titel."); return; }
        const newScenario = { title: title, steps: [] };
        const stepCards = stepsContainer.querySelectorAll('.step-card');

        stepCards.forEach(card => {
            const description = card.querySelector('.step-description').value.trim();
            const sequence = [];
            card.querySelectorAll('.scoring-clicks-container input[type="checkbox"]:checked').forEach(checkbox => {
                sequence.push(checkbox.value);
            });
            if (!description || sequence.length === 0) return;
            
            const stepData = { description, sequence };
            const customErrorMessage = card.querySelector('.step-error-message').value.trim();
            if (customErrorMessage) { stepData.customErrorMessage = customErrorMessage; }

            const wrongClickMessages = {};
            card.querySelectorAll('.specific-error-row').forEach(row => {
                const key = row.querySelector('.specific-error-key').value;
                const value = row.querySelector('.specific-error-value').value.trim();
                if (key && value) wrongClickMessages[key] = value;
            });
            if (Object.keys(wrongClickMessages).length > 0) { stepData.wrongClickMessages = wrongClickMessages; }

            newScenario.steps.push(stepData);
        });

        if (newScenario.steps.length > 0) {
            scenarios.push(newScenario);
            alert(`Scenariot "${title}" har sparats!`);
            scenarioTitleInput.value = '';
            stepsContainer.innerHTML = '';
            addStep();
            renderScenariosList();
            jsonOutput.value = JSON.stringify(scenarios, null, 2);
        } else {
            alert("Kunde inte spara. Se till att minst ett delmoment har en beskrivning och en poänggivande sekvens.");
        }
    });

    // ... (loadExistingScenarios och renderScenariosList är oförändrade) ...
    async function loadExistingScenarios() { /* ... */ }
    function renderScenariosList() { /* ... */ }

    loadExistingScenarios();
    addStep();
});
