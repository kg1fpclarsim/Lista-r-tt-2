const ADMIN_JS_VERSION = '10.0-STABLE';

document.addEventListener('DOMContentLoaded', () => {
    // Referenser till HTML-element
    const simulatorContainer = document.getElementById('simulator-container');
    if (!simulatorContainer) {
        console.error("FATALT FEL i admin.js: Behållaren #simulator-container hittades inte i HTML-koden.");
        return;
    }
    const scenarioTitleInput = document.getElementById('scenario-title');
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const saveScenarioBtn = document.getElementById('save-scenario-btn');
    const jsonOutput = document.getElementById('json-output');
    const scenariosList = document.getElementById('scenarios-list');
    
    // Globala variabler
    let scenarios = [];
    let stepCounter = 0;
    let activeStepCard = null;
    let adminMode = 'idle';

    // Huvudfunktion som tar emot klick från simulatorn
    function recordSimulatorClick(clickedEvent, areaElement) {
        if (!activeStepCard) {
            alert("Klicka på ett delmoment för att aktivera det först.");
            return;
        }
        if (adminMode === 'sequence') {
            recordCorrectStep(clickedEvent);
        } else if (adminMode === 'errors') {
            defineErrorMessage(clickedEvent);
        }
    }

    function recordCorrectStep(clickedEvent) {
        const eventName = clickedEvent.name;
        const sequenceDisplay = activeStepCard.querySelector('.step-sequence-display');
        const scoringContainer = activeStepCard.querySelector('.scoring-clicks-container');
        const clickCounter = sequenceDisplay.children.length;
        sequenceDisplay.innerHTML += `<span class="sequence-step">${eventName}</span>`;
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'scoring-checkbox';
        const uniqueId = `scoring_${activeStepCard.dataset.stepId}_${clickCounter}`;
        checkboxDiv.innerHTML = `<input type="checkbox" id="${uniqueId}" value="${eventName}" checked><label for="${uniqueId}">${eventName}</label>`;
        checkboxDiv.addEventListener('click', (e) => e.stopPropagation());
        scoringContainer.appendChild(checkboxDiv);
    }

    function defineErrorMessage(clickedEvent) {
        if (clickedEvent.name === 'Tillbaka') return;
        const buttonName = clickedEvent.name;
        const dataStore = activeStepCard.querySelector('.wrong-messages-datastore');
        let wrongMessages = JSON.parse(dataStore.value || '{}');
        const currentMessage = wrongMessages[buttonName] || '';
        const message = prompt(`Ange felmeddelande för klick på '${buttonName}':`, currentMessage);
        if (message !== null) {
            wrongMessages[buttonName] = message.trim();
            dataStore.value = JSON.stringify(wrongMessages);
            renderDefinedErrors(activeStepCard);
        }
    }
    
    function renderDefinedErrors(stepCard) {
        if (!stepCard) return;
        const container = stepCard.querySelector('.defined-errors-list');
        const dataStore = stepCard.querySelector('.wrong-messages-datastore');
        const wrongMessages = JSON.parse(dataStore.value || '{}');
        container.innerHTML = '';
        for (const buttonName in wrongMessages) {
            const message = wrongMessages[buttonName];
            if (message) {
                const row = document.createElement('div');
                row.className = 'defined-error-row';
                row.innerHTML = `<strong>${buttonName}:</strong> <em>"${message}"</em> <button class="delete-btn small-delete-btn" data-button-name="${buttonName}">X</button>`;
                container.appendChild(row);
                row.querySelector('.small-delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    delete wrongMessages[buttonName];
                    dataStore.value = JSON.stringify(wrongMessages);
                    renderDefinedErrors(stepCard);
                });
            }
        }
    }

     function addStep(existingStepData = null) {
        const stepId = stepCounter++;
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        stepDiv.dataset.stepId = stepId;
        stepDiv.innerHTML = `
            <div class="step-header"><h4>Delmoment ${stepsContainer.children.length + 1}</h4><button class="delete-btn step-delete-btn">Ta bort</button></div>
            <textarea class="step-description" rows="3" placeholder="Skriv beskrivning/fråga här..."></textarea>
            div class="initial-overlay-selector">
                <label>Val för startvy:</label>
                <select class="initial-office-select"></select>
                <input type="hidden" class="initial-overlay-datastore">
            </div>
            <div class="mode-toggle">
                <p>2. Välj vad du vill göra (klicka i simulatorn efter val):</p>
                <button class="btn btn-mode" data-mode="sequence">Spela in poänggivande sekvens</button>
                <button class="btn btn-mode" data-mode="errors">Definiera felmeddelanden</button>
            </div>
            <div class="sequence-editor" style="display: none;">
                <label>Inspelad sekvens:</label>
                <div class="sequence-header"><div class="sequence-display step-sequence-display"></div><button class="btn btn-secondary btn-clear-sequence">Rensa</button></div>
                <label>Poänggivande klick (bocka ur navigationsklick):</label>
                <div class="scoring-clicks-container"></div>
            </div>
            <div class="errors-editor" style="display: none;">
                <label>Definierade felmeddelanden:</label>
                <div class="defined-errors-list"></div>
                <input type="hidden" class="wrong-messages-datastore">
            </div>
        `;
        stepsContainer.appendChild(stepDiv);
 const initialOfficeValue = existingStepData?.initialOverlayState?.['selected-office-display'] || '';
        const overlayDatastore = stepDiv.querySelector('.initial-overlay-datastore');
        const officeSelect = stepDiv.querySelector('.initial-office-select');

        if (overlayDatastore) {
            overlayDatastore.value = initialOfficeValue;
        }
        if (officeSelect) {
            const offices = (typeof ALL_OFFICES !== 'undefined' && Array.isArray(ALL_OFFICES)) ? ALL_OFFICES : [];
            officeSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Välj kontor…';
            officeSelect.appendChild(defaultOption);
            offices.forEach(officeName => {
                const option = document.createElement('option');
                option.value = officeName;
                option.textContent = officeName;
                officeSelect.appendChild(option);
            });
            officeSelect.value = initialOfficeValue;
            if (officeSelect.value !== initialOfficeValue) {
                officeSelect.value = '';
                if (overlayDatastore) {
                    overlayDatastore.value = '';
                }
            }
            officeSelect.addEventListener('change', (event) => {
                if (overlayDatastore) {
                    overlayDatastore.value = event.target.value;
                }
            });
        }

        const activateCard = () => {
            document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
            stepDiv.classList.add('active');
            activeStepCard = stepDiv;
            adminMode = 'idle';
            stepDiv.querySelector('.sequence-editor').style.display = 'none';
            stepDiv.querySelector('.errors-editor').style.display = 'none';
            stepDiv.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
        };
        stepDiv.addEventListener('click', activateCard);

        stepDiv.querySelector('.step-delete-btn').addEventListener('click', (e) => { e.stopPropagation(); if (activeStepCard === stepDiv) activeStepCard = null; stepDiv.remove(); });
        stepDiv.querySelector('.btn-clear-sequence').addEventListener('click', (e) => { e.stopPropagation(); stepDiv.querySelector('.step-sequence-display').innerHTML = ''; stepDiv.querySelector('.scoring-clicks-container').innerHTML = ''; });
        
        const modeButtons = stepDiv.querySelectorAll('.btn-mode');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                activateCard();
                adminMode = e.target.dataset.mode;
                modeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                stepDiv.querySelector('.sequence-editor').style.display = adminMode === 'sequence' ? 'block' : 'none';
                stepDiv.querySelector('.errors-editor').style.display = adminMode === 'errors' ? 'block' : 'none';
            });
        });
         
        if (existingStepData?.description) {
            const descriptionField = stepDiv.querySelector('.step-description');
            if (descriptionField) {
                descriptionField.value = existingStepData.description;
            }
        }
        activateCard();
    }
    
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
            const initialOverlayValue = (card.querySelector('.initial-overlay-datastore')?.value || '').trim();
            if (initialOverlayValue) {
                stepData.initialOverlayState = { 'selected-office-display': initialOverlayValue };
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

    async function loadExistingScenarios() {
        try {
            const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
            if (response.ok) { 
                const data = await response.json();
                if (Array.isArray(data)) {
                    scenarios = data;
                    renderScenariosList();
                }
            }
        } catch (error) { console.warn("Kunde inte ladda scenarios.json", error); }
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

    const simulator = initializeSimulator(simulatorContainer, 'main', recordSimulatorClick);
    simulator.reset();
    addStepBtn.addEventListener('click', () => { addStep(); simulator.reset(); });
    loadExistingScenarios();
    addStep();
});

