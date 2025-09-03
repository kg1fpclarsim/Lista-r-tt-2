// admin.js (korrigerad version)
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
            alert("Klicka på ett delmoment för att aktivera det först.");
            return;
        }

        const eventName = clickedEvent.name;
        const sequenceDisplay = activeStepCard.querySelector('.step-sequence-display');
        const scoringContainer = activeStepCard.querySelector('.scoring-clicks-container');
        const clickCounter = (sequenceDisplay.children.length);

        sequenceDisplay.innerHTML += `<span class="sequence-step">${eventName}</span>`;
        
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'scoring-checkbox';
        // KORRIGERING HÄR: `activeStepCard.dataset.stepId` istället för `active_stepId`
        checkboxDiv.innerHTML = `<input type="checkbox" id="scoring_${activeStepCard.dataset.stepId}_${clickCounter}" value="${eventName}"><label for="scoring_${activeStepCard.dataset.stepId}_${clickCounter}">${eventName}</label>`;
        scoringContainer.appendChild(checkboxDiv);
    }

    function addStep() {
        const stepId = stepCounter++;
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        stepDiv.dataset.stepId = stepId;
        
        // Denna logik var mer komplicerad än nödvändigt, förenklad nu
        const uniqueEventNames = Object.values(ALL_MENUS)
            .flatMap(menu => menu.events.map(event => event.name))
            .filter((value, index, self) => self.indexOf(value) === index);
        let optionsHtml = uniqueEventNames.map(event => `<option value="${event}">${event}</option>`).join('');

        stepDiv.innerHTML = `
            <div class="step-header"><h4>Delmoment ${stepsContainer.children.length + 1}</h4><button class="delete-btn step-delete-btn">Ta bort</button></div>
            <textarea class="step-description" rows="3" placeholder="Skriv beskrivning/fråga här..."></textarea>
            
            <div class="mode-toggle">
                <button class="btn btn-mode active" data-mode="sequence">Spela in korrekt sekvens</button>
                <button class="btn btn-mode" data-mode="errors">Definiera felmeddelanden</button>
            </div>
            
            <div class="sequence-editor">
                <label>Inspelad sekvens:</label>
                <div class="sequence-header"><div class="sequence-display step-sequence-display"></div><button class="btn btn-secondary btn-clear-sequence">Rensa</button></div>
                <label>Poänggivande klick:</label>
                <div class="scoring-clicks-container"></div>
            </div>

            <div class="errors-editor" style="display: none;">
                <label>Definierade felmeddelanden (klicka i simulatorn för att lägga till):</label>
                <div class="defined-errors-list"></div>
                <input type="hidden" class="wrong-messages-datastore">
            </div>
        `;
        stepsContainer.appendChild(stepDiv);

        stepDiv.addEventListener('click', () => {
            document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
            stepDiv.classList.add('active');
            activeStepCard = stepDiv;
        });

        stepDiv.querySelector('.step-delete-btn').addEventListener('click', (e) => { e.stopPropagation(); if (activeStepCard === stepDiv) activeStepCard = null; stepDiv.remove(); });
        stepDiv.querySelector('.btn-clear-sequence').addEventListener('click', (e) => { e.stopPropagation(); stepDiv.querySelector('.step-sequence-display').innerHTML = ''; stepDiv.querySelector('.scoring-clicks-container').innerHTML = ''; });
        
        const modeButtons = stepDiv.querySelectorAll('.btn-mode');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.adminMode = e.target.dataset.mode;
                modeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                stepDiv.querySelector('.sequence-editor').style.display = window.adminMode === 'sequence' ? 'block' : 'none';
                stepDiv.querySelector('.errors-editor').style.display = window.adminMode === 'errors' ? 'block' : 'none';
            });
        });
        
        stepDiv.click();
    }

    function defineErrorMessage(clickedEvent) {
        const buttonName = clickedEvent.name;
        const dataStore = activeStepCard.querySelector('.wrong-messages-datastore');
        let wrongMessages = JSON.parse(dataStore.value || '{}');
        const currentMessage = wrongMessages[buttonName] || '';
        
        const message = prompt(`Ange felmeddelande för klick på '${buttonName}':`, currentMessage);

        if (message !== null) {
            wrongMessages[buttonName] = message.trim();
            dataStore.value = JSON.stringify(wrongMessages);
            renderDefinedErrors();
        }
    }
    
    function renderDefinedErrors() {
        if (!activeStepCard) return;
        const container = activeStepCard.querySelector('.defined-errors-list');
        const dataStore = activeStepCard.querySelector('.wrong-messages-datastore');
        const wrongMessages = JSON.parse(dataStore.value || '{}');
        container.innerHTML = '';
        for (const buttonName in wrongMessages) {
            const message = wrongMessages[buttonName];
            if (message) {
                const row = document.createElement('div');
                row.className = 'defined-error-row';
                row.dataset.buttonName = buttonName;
                row.innerHTML = `<strong>${buttonName}:</strong> <em>"${message}"</em> <button class="delete-btn small-delete-btn">X</button>`;
                container.appendChild(row);
                row.querySelector('.small-delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    delete wrongMessages[buttonName];
                    dataStore.value = JSON.stringify(wrongMessages);
                    renderDefinedErrors();
                });
            }
        }
    }

    // Uppdaterad Spara-funktion
    saveScenarioBtn.addEventListener('click', () => {
        const title = scenarioTitleInput.value.trim();
        if (!title) { alert("Du måste ange en titel."); return; }
        const newScenario = { title: title, steps: [] };
        
        stepsContainer.querySelectorAll('.step-card').forEach(card => {
            const description = card.querySelector('.step-description').value.trim();
            const sequence = [];
            card.querySelectorAll('.scoring-clicks-container input[type="checkbox"]:checked').forEach(checkbox => {
                sequence.push(checkbox.value);
            });
            if (!description || sequence.length === 0) return;
            
            const stepData = { description, sequence };
            const wrongMessages = JSON.parse(card.querySelector('.wrong-messages-datastore').value || '{}');
            if (Object.keys(wrongMessages).length > 0) {
                stepData.wrongClickMessages = wrongMessages;
            }
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

    const simulator = initializeSimulator(simulatorContainer, 'main', recordSimulatorClick);
    addStepBtn.addEventListener('click', () => { addStep(); simulator.reset(); });
    loadExistingScenarios();
    addStep();
});
