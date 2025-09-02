document.addEventListener('DOMContentLoaded', () => {
    const ALL_EVENTS = [
        "Lasta ut", "Lossa in", "Hämta", "Leverera", "Bomhämtning", 
        "Ej levererat", "Hämtning utan sändnings-ID", "Åter terminal", "Flänsa",
        "Hämta åt annan bil", "Hämta obokad hämtning",
        "Flänsa på", "Flänsa av", "Ångra"
    ];
    let scenarios = [];
    let stepCounter = 0;

    const scenarioTitleInput = document.getElementById('scenario-title');
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const saveScenarioBtn = document.getElementById('save-scenario-btn');
    const jsonOutput = document.getElementById('json-output');
    const scenariosList = document.getElementById('scenarios-list');

    async function loadExistingScenarios() {
        try {
            const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
            if (response.ok) {
                scenarios = await response.json();
                renderScenariosList();
            }
        } catch (error) { console.warn("Kunde inte ladda scenarios.json"); }
    }

    function renderScenariosList() {
        scenariosList.innerHTML = '';
        scenarios.forEach((scenario, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${scenario.title} (${scenario.steps.length} steg)</span> <button data-index="${index}" class="delete-btn">Ta bort</button>`;
            scenariosList.appendChild(li);
        });
        scenariosList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                scenarios.splice(e.target.dataset.index, 1);
                renderScenariosList();
                jsonOutput.value = JSON.stringify(scenarios, null, 2);
            });
        });
    }

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
            <div class="sequence-display step-sequence-display"></div>
            <div class="button-grid">${buttonsHtml}</div>
        `;
        stepsContainer.appendChild(stepDiv);

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
        
        const sequenceDisplay = stepDiv.querySelector('.step-sequence-display');
        let currentSequence = [];
        stepDiv.querySelectorAll('.sequence-builder-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentSequence.push(btn.dataset.eventName);
                sequenceDisplay.innerHTML += `<span class="sequence-step">${btn.dataset.eventName}</span>`;
                stepDiv.dataset.sequence = JSON.stringify(currentSequence);
            });
        });
    }
    
    addStepBtn.addEventListener('click', addStep);

    saveScenarioBtn.addEventListener('click', () => {
        const title = scenarioTitleInput.value.trim();
        if (!title) {
            alert("Du måste ange en titel för scenariot.");
            return;
        }
        const newScenario = { title: title, steps: [] };
        const stepCards = stepsContainer.querySelectorAll('.step-card');

        stepCards.forEach(card => {
            const description = card.querySelector('.step-description').value.trim();
            const sequence = JSON.parse(card.dataset.sequence || '[]');
            if (!description || sequence.length === 0) return;
            
            const stepData = { description, sequence };
            const customErrorMessage = card.querySelector('.step-error-message').value.trim();
            if (customErrorMessage) {
                stepData.customErrorMessage = customErrorMessage;
            }

            const wrongClickMessages = {};
            card.querySelectorAll('.specific-error-row').forEach(row => {
                const key = row.querySelector('.specific-error-key').value;
                const value = row.querySelector('.specific-error-value').value.trim();
                if (key && value) {
                    wrongClickMessages[key] = value;
                }
            });
            if (Object.keys(wrongClickMessages).length > 0) {
                stepData.wrongClickMessages = wrongClickMessages;
            }

            newScenario.steps.push(stepData);
        });

        if (newScenario.steps.length > 0) {
            scenarios.push(newScenario);
            alert(`Scenariot "${title}" har sparats! Din fullständiga JSON har uppdaterats i rutan nedan.`);
            scenarioTitleInput.value = '';
            stepsContainer.innerHTML = '';
            addStep();
            renderScenariosList();
        } else {
            alert("Kunde inte spara. Se till att minst ett delmoment har en beskrivning och en sekvens.");
        }
        
        jsonOutput.value = JSON.stringify(scenarios, null, 2);
        jsonOutput.select();
        navigator.clipboard.writeText(jsonOutput.value).then(() => {
            alert('JSON genererad och kopierad till urklipp!');
        });
    });

    loadExistingScenarios();
    addStep();
});
