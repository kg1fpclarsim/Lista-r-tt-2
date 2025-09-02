document.addEventListener('DOMContentLoaded', () => {
    const ALL_EVENTS = [
        "Lasta ut", "Lossa in", "Hämta", "Leverera", "Bomhämtning", 
        "Ej levererat", "Hämtning utan sändnings-ID", "Åter terminal", "Flänsa",
        "Hämta åt annan bil", "Hämta obokad hämtning",
        "Flänsa på", "Flänsa av"
    ];

    let currentSequence = [];
    let scenarios = [];

    const descriptionInput = document.getElementById('scenario-description');
    const availableButtonsContainer = document.getElementById('available-buttons');
    const selectedSequenceContainer = document.getElementById('selected-sequence');
    const saveButton = document.getElementById('save-scenario-btn');
    const clearButton = document.getElementById('clear-sequence-btn');
    const scenariosList = document.getElementById('scenarios-list');
    const exportButton = document.getElementById('export-btn');
    const jsonOutput = document.getElementById('json-output');
    // I toppen av admin.js, efter de andra const-definitionerna
const descriptionPreview = document.getElementById('description-preview');

// Lyssna efter inmatning i textrutan
descriptionInput.addEventListener('input', () => {
    // Använd marked-biblioteket för att omvandla text till HTML
    descriptionPreview.innerHTML = marked.parse(descriptionInput.value);
});

// Anropa funktionen en gång vid start för att rensa
descriptionPreview.innerHTML = marked.parse('');

    async function loadExistingScenarios() {
        try {
            const response = await fetch('scenarios.json?cachebust=' + new Date().getTime());
            if (response.ok) {
                scenarios = await response.json();
                renderScenariosList();
            } else {
                 scenariosList.innerHTML = '<li>Kunde inte ladda befintlig scenarios.json. Startar med en tom lista.</li>';
            }
        } catch (error) {
            console.warn("Ingen scenarios.json hittades, startar med en tom lista.", error);
            scenariosList.innerHTML = '<li>Ingen befintlig scenarios.json hittades. Startar med en tom lista.</li>';
        }
    }

    function renderAvailableButtons() {
        availableButtonsContainer.innerHTML = '';
        ALL_EVENTS.forEach(event => {
            const btn = document.createElement('button');
            btn.textContent = event;
            btn.className = 'btn';
            btn.addEventListener('click', () => {
                currentSequence.push(event);
                renderSelectedSequence();
            });
            availableButtonsContainer.appendChild(btn);
        });
    }

    function renderSelectedSequence() {
        selectedSequenceContainer.innerHTML = '';
        if (currentSequence.length === 0) {
            selectedSequenceContainer.innerHTML = '<p><em>Inga steg valda.</em></p>';
            return;
        }
        currentSequence.forEach((step, index) => {
            const stepEl = document.createElement('span');
            stepEl.className = 'sequence-step';
            stepEl.textContent = `${index + 1}. ${step}`;
            selectedSequenceContainer.appendChild(stepEl);
        });
    }

    function renderScenariosList() {
        scenariosList.innerHTML = '';
        if (scenarios.length === 0) {
            scenariosList.innerHTML = '<li>Listan är tom. Lägg till ett scenario ovan för att börja.</li>';
            return;
        }
        scenarios.forEach((scenario, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <strong>${scenario.description}</strong>
                    <br>
                    <small>${scenario.sequence.join(' → ')}</small>
                </div>
                <button class="delete-btn" data-index="${index}">Ta bort</button>
            `;
            scenariosList.appendChild(listItem);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indexToDelete = parseInt(e.target.dataset.index, 10);
                scenarios.splice(indexToDelete, 1);
                renderScenariosList();
                jsonOutput.value = '';
            });
        });
    }

    saveButton.addEventListener('click', () => {
        const description = descriptionInput.value.trim();
        if (description === '' || currentSequence.length === 0) {
            alert('Du måste ange en beskrivning och välja minst ett steg i sekvensen.');
            return;
        }
        scenarios.push({
            description: description,
            sequence: currentSequence
        });
        descriptionInput.value = '';
        currentSequence = [];
        renderSelectedSequence();
        renderScenariosList();
        jsonOutput.value = '';
    });

    clearButton.addEventListener('click', () => {
        currentSequence = [];
        renderSelectedSequence();
    });

    exportButton.addEventListener('click', () => {
        const jsonString = JSON.stringify(scenarios, null, 2);
        jsonOutput.value = jsonString;
        jsonOutput.select();
        navigator.clipboard.writeText(jsonString).then(() => {
            alert('JSON genererad och kopierad till urklipp! Klistra nu in detta i din scenarios.json-fil på GitHub.');
        }).catch(err => {
            alert('JSON genererad! Kopiera texten från rutan manuellt.');
            console.error('Kunde inte kopiera till urklipp:', err);
        });
    });

    loadExistingScenarios();
    renderAvailableButtons();
});
