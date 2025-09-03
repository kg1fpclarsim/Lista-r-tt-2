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
        const clickCounter = sequenceDisplay.children.length;

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
        stepDiv.innerHTML = `
            <div class="step-header"><h4>Delmoment ${stepsContainer.children.length + 1}</h4><button class="delete-btn step-delete-btn">Ta bort</button></div>
            <label>Beskrivning / Fråga (för detta delmoment):</label>
            <textarea class="step-description" rows="3" placeholder="Skriv uppgiften här..."></textarea>
            <label>Poänggivande sekvens (spelas in från simulatorn):</label>
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

        stepDiv.querySelector('.step-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeStepCard === stepDiv) activeStepCard = null;
            stepDiv.remove();
        });

        stepDiv.querySelector('.btn-clear-sequence').addEventListener('click', (e) => {
            e.stopPropagation();
            stepDiv.querySelector('.step-sequence-display').innerHTML = '';
            stepDiv.querySelector('.scoring-clicks-container').innerHTML = '';
        });
        stepDiv.click();
    }
    
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

    saveScenarioBtn.addEventListener('click', () => {
        const title = scenarioTitleInput.value.trim();
        if (!title) { alert("Du måste ange en titel för scenariot."); return; }
        const newScenario = { title: title, steps: [] };
        const stepCards = stepsContainer.querySelectorAll('.step-card');

        stepCards.forEach(card => {
            const description = card.querySelector('.step-description').value.trim();
            const sequence = [];
            card.querySelectorAll('.scoring-clicks-container input[type="checkbox"]:checked').forEach(checkbox => {
                sequence.push(checkbox.value);
            });
            if (!description || sequence.length === 0) return;
            newScenario.steps.push({ description, sequence });
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

    addStepBtn.addEventListener('click', addStep);
    initializeSimulator(simulatorContainer, 'main', recordSimulatorClick);
    loadExistingScenarios();
    addStep();
});
