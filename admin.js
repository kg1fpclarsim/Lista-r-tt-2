// admin.js (Komplett version med förbättrat arbetsflöde)
document.addEventListener('DOMContentLoaded', () => {
    // Referenser till HTML-element
    const simulatorContainer = document.getElementById('simulator-container');
    const scenarioTitleInput = document.getElementById('scenario-title');
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const saveScenarioBtn = document.getElementById('save-scenario-btn');
    const jsonOutput = document.getElementById('json-output');
    const scenariosList = document.getElementById('scenarios-list');
    
    // Globala variabler för att hålla koll på tillstånd
    let scenarios = [];
    let stepCounter = 0;
    let activeStepCard = null;
    let adminMode = 'idle'; // Lägen: 'idle', 'sequence', 'errors'

    // Huvudfunktion som tar emot klick från simulatorn
    function recordSimulatorClick(clickedEvent) {
        if (!activeStepCard) {
            // Gör inget om inget kort är aktivt
            return; 
        }
        // Anropa rätt funktion beroende på vilket läge som är aktivt
        if (adminMode === 'sequence') {
            recordCorrectStep(clickedEvent);
        } else if (adminMode === 'errors') {
            defineErrorMessage(clickedEvent);
        }
        // Om adminMode är 'idle', gör ingenting med klicket.
    }

    // Spelar in ett klick som en del av den korrekta sekvensen
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
        scoringContainer.appendChild(checkboxDiv);
    }

    // Öppnar en dialogruta för att definiera ett felmeddelande
    function defineErrorMessage(clickedEvent) {
        const buttonName = clickedEvent.name;
        const dataStore = activeStepCard.querySelector('.wrong-messages-datastore');
        let wrongMessages = JSON.parse(dataStore.value || '{}');
        const currentMessage = wrongMessages[buttonName] || '';
        
        const message = prompt(`Ange felmeddelande för klick på '${buttonName}':`, currentMessage);

        if (message !== null) { // Användaren klickade OK
            wrongMessages[buttonName] = message.trim();
            dataStore.value = JSON.stringify(wrongMessages);
            renderDefinedErrors();
        }
    }
    
    // Ritar upp listan med definierade felmeddelanden på det aktiva kortet
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
                row.innerHTML = `<strong>${buttonName}:</strong> <em>"${message}"</em> <button class="delete-btn small-delete-btn" data-button-name="${buttonName}">X</button>`;
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

    // Skapar ett nytt, tomt delmoment-kort
    function addStep() {
        const stepId = stepCounter++;
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        stepDiv.dataset.stepId = stepId;
        
        stepDiv.innerHTML = `
            <div class="step-header"><h4>Delmoment ${stepsContainer.children.length + 1}</h4><button class="delete-btn step-delete-btn">Ta bort</button></div>
            
            <label>1. Skriv beskrivning / fråga:</label>
            <textarea class="step-description" rows="3" placeholder="Skriv uppgiften här..."></textarea>
            
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

        const activateCard = () => {
            document.querySelectorAll('.step-card').forEach(c => c.classList.remove('active'));
            stepDiv.classList.add('active');
            activeStepCard = stepDiv;
            adminMode = 'idle'; // Återställ läge när man byter kort
        };
        stepDiv.addEventListener('click', activateCard);

        stepDiv.querySelector('.step-delete-btn').addEventListener('click', (e) => { e.stopPropagation(); if (activeStepCard === stepDiv) activeStepCard = null
