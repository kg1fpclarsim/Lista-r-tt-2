// admin.js (helt ny version)
document.addEventListener('DOMContentLoaded', () => {
    // Referenser till HTML-element
    const simulatorContainer = document.getElementById('simulator-container');
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
    let adminMode = 'sequence'; // Kan vara 'sequence' eller 'errors'

    // Callback-funktion för klick i simulatorn
    function recordSimulatorClick(clickedEvent) {
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

    // Logik för att spela in korrekt sekvens
    function recordCorrectStep(clickedEvent) {
        const eventName = clickedEvent.name;
        const sequenceDisplay = activeStepCard.querySelector('.step-sequence-display');
        const scoringContainer = activeStepCard.querySelector('.scoring-clicks-container');
        const clickCounter = sequenceDisplay.children.length;

        sequenceDisplay.innerHTML += `<span class="sequence-step">${eventName}</span>`;
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'scoring-checkbox';
        checkboxDiv.innerHTML = `<input type="checkbox" id="scoring_${activeStepCard.dataset.stepId}_${clickCounter}" value="${eventName}"><label for="scoring_${activeStepCard.dataset.stepId}_${clickCounter}">${eventName}</label>`;
        scoringContainer.appendChild(checkboxDiv);
    }

    // Logik för att definiera felmeddelanden
    function defineErrorMessage(clickedEvent) {
        const buttonName = clickedEvent.name;
        const currentMessage = activeStepCard.querySelector(`.defined-error-row[data-button-name="${buttonName}"] input`)?.value || '';
        
        const message = prompt(`Ange felmeddelande för klick på '${buttonName}':`, currentMessage);

        if (message !== null) { // Om användaren klickar OK (även om fältet är tomt)
            // Spara datan i ett dolt element
            const dataStore = activeStepCard.querySelector('.wrong-messages-datastore');
            let wrongMessages = JSON.parse(dataStore.value || '{}');
            wrongMessages[buttonName] = message;
            dataStore.value = JSON.stringify(wrongMessages);
            renderDefinedErrors();
        }
    }
    
    // Ritar upp listan med definierade felmeddelanden
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

    // Skapar ett nytt tomt delmoment
    function addStep() {
        const stepId = stepCounter++;
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        stepDiv.dataset.stepId = stepId;
        
        stepDiv.innerHTML = `
            <div class="step-header"><h4>Delmoment ${stepsContainer.children.length + 1}</h4><button class="delete-btn step-delete-btn">Ta bort</button></div>
            <textarea class="step-description" rows="3" placeholder="Skriv beskrivning/fråga här..."></textarea>
            
            <div class="mode-toggle">
                <button class="btn btn-mode" data-mode="sequence">Spela in korrekt sekvens</button>
                <button class="btn btn-mode" data-mode="errors">Definiera felmeddelanden</button>
            </div>
            
            <div class="sequence-editor">
                <label>Inspelad sekvens:</label>
                <div class="sequence-header"><div class="sequence-display step-sequence-display"></div><button class="btn btn-secondary btn-clear-sequence">Rensa</button></div>
                <label>Poänggivande klick:</label>
                <div class="scoring-clicks-container"></div>
            </div>

            <div class="errors-editor" style="display: none;">
                <label>Definierade felmeddelanden:</label>
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
        
        // Logik för att byta läge
        const modeButtons = stepDiv.querySelectorAll('.btn-mode');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                adminMode = e.target.dataset.mode;
                modeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                stepDiv.querySelector('.sequence-editor').style.display = adminMode === 'sequence' ? 'block' : 'none';
                stepDiv.querySelector('.errors-editor').style.display = adminMode === 'errors' ? 'block' : 'none';
            });
        });
        
        stepDiv.click();
        stepDiv.querySelector('.btn-mode[data-mode="sequence"]').classList.add('active');
    }
    
    // ... (loadExistingScenarios och renderScenariosList är oförändrade) ...
    
    // Spara-funktion anpassad för den nya strukturen
    saveScenarioBtn.addEventListener('click', () => {
        // ... (denna funktion är nu mycket enklare eftersom datan redan är strukturerad)
    });
    
    // Starta allt
    const simulator = initializeSimulator(simulatorContainer, 'main', recordSimulatorClick);
    addStepBtn.addEventListener('click', () => { addStep(); simulator.reset(); });
    // ... (övriga funktioner och anrop)
});
