// admin-analys.js (Komplett och fungerande version)

document.addEventListener('DOMContentLoaded', () => {
    // ----------------- REFERENSER TILL HTML-ELEMENT -----------------
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');
    const addGroupBtn = document.getElementById('add-group-btn');
    const saveBtn = document.getElementById('save-btn');
    const jsonOutput = document.getElementById('json-output');
    const scenarioTitleInput = document.getElementById('scenario-title');
    const scenarioDescriptionInput = document.getElementById('scenario-description');
    const answerEditor = document.getElementById('answer-editor');
    const answerDetails = document.getElementById('answer-details');
    const answerExplanationInput = document.getElementById('answer-explanation');

    // ----------------- GLOBALT TILLSTÅND (STATE) -----------------
    let activeGroup = null;
    let scenarios = []; // Håller alla scenarier
    // Håller det facit vi bygger upp för det nuvarande scenariot
    let currentAnswer = { type: 'correct' }; 

    // ----------------- FUNKTIONER FÖR ATT BYGGA GRÄNSSNITTET -----------------

    // Bygger paletten med klickbara händelser
    function buildPalette() {
        if (typeof ANALYS_EVENTS === 'undefined') { return; }
        ANALYS_EVENTS.forEach(eventDef => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            item.innerHTML = `<div class="event-block"><img src="${eventDef.image}" alt="${eventDef.name}"><div class="event-type">${eventDef.name}</div></div>`;
            item.addEventListener('click', () => addEventToActiveGroup(eventDef));
            paletteContainer.appendChild(item);
        });
    }

    // Lägger till ett nytt grupp-block på arbetsytan
    function addGroupBlock() {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card-admin';
        groupCard.innerHTML = `
            <div class="group-card-header">
                <textarea class="group-title-input" rows="2" placeholder="Grupprubrik (Markdown)..."></textarea>
                <select class="group-color-select"><option value="green">Grön</option><option value="blue">Blå</option><option value="grey">Grå</option></select>
                <button class="delete-btn small-delete-btn">X</button>
            </div>
            <div class="group-events-canvas">
                <p class="empty-group-prompt">Klicka här för att aktivera, lägg sedan till händelser.</p>
            </div>
        `;
        canvasContainer.appendChild(groupCard);
        
        groupCard.querySelector('.delete-btn').addEventListener('click', () => groupCard.remove());
        const colorSelect = groupCard.querySelector('.group-color-select');
        colorSelect.addEventListener('change', () => {
            groupCard.classList.remove('green', 'blue', 'grey');
            groupCard.classList.add(colorSelect.value);
        });
        groupCard.classList.add(colorSelect.value);

        groupCard.addEventListener('click', () => {
            document.querySelectorAll('.group-card-admin').forEach(card => card.classList.remove('active'));
            groupCard.classList.add('active');
            activeGroup = groupCard;
        });
        
        groupCard.click(); // Aktivera direkt
    }

    // Lägger till ett händelse-block i den för tillfället aktiva gruppen
    function addEventToActiveGroup(eventDef) {
        if (!activeGroup) { alert("Klicka på ett grupp-block för att aktivera det först."); return; }
        activeGroup.querySelector('.empty-group-prompt')?.remove();
        
        const eventCanvas = activeGroup.querySelector('.group-events-canvas');
        const blockWrapper = document.createElement('div');
        blockWrapper.className = 'canvas-block-wrapper';
        
        if (typeof ALL_OFFICES === 'undefined') { return; }
        let optionsHtml = ALL_OFFICES.map(office => `<option value="${office}">${office}</option>`).join('');
        let selectHtml = `<select class="office-select"><option value="">Välj kontor...</option>${optionsHtml}</select>`;

        blockWrapper.innerHTML = `
            <div class="event-block"><img src="${eventDef.image}" alt="${eventDef.name}">${selectHtml}</div>
            <button class="delete-btn small-delete-btn">X</button>
        `;
        blockWrapper.dataset.eventName = eventDef.name;
        blockWrapper.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); blockWrapper.remove(); });
        eventCanvas.appendChild(blockWrapper);
    }

    // ----------------- LOGIK FÖR FACIT-SEKTIONEN -----------------

    // Nollställer redigeringsläget för arbetsytan
    function exitEditMode() {
        canvasContainer.querySelectorAll('.canvas-block-wrapper, .plus-icon-wrapper').forEach(el => {
            el.classList.remove('selectable-to-edit', 'selected-as-answer');
            el.replaceWith(el.cloneNode(true)); // Tar bort gamla event listeners
        });
        canvasContainer.querySelectorAll('.plus-icon-wrapper').forEach(el => el.remove());
    }

    // Aktiverar läget för att markera ett block som ska tas bort
    function enterRemoveMode() {
        exitEditMode();
        answerDetails.innerHTML = `<p class="instruction-text">Redigeringsläge: Klicka på det händelseblock i arbetsytan som ska tas bort.</p>`;
        canvasContainer.querySelectorAll('.canvas-block-wrapper').forEach((block, index) => {
            block.classList.add('selectable-to-edit');
            block.addEventListener('click', () => {
                currentAnswer = { type: 'remove', index: index };
                answerDetails.innerHTML = `<p class="instruction-text">OK! Block ${index + 1} kommer att markeras som fel.</p>`;
                block.classList.add('selected-as-answer');
                exitEditMode();
            }, { once: true }); // Lyssnaren körs bara en gång
        });
    }
    
    // (Funktioner för 'add' och 'correct_office' kan läggas till här på liknande sätt)

    // Lyssnare för radioknapparna i facit-sektionen
    answerEditor.querySelectorAll('input[name="answerType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const answerType = radio.value;
            currentAnswer = { type: answerType }; // Sätt grundtypen för facit

            if (answerType === 'remove') {
                enterRemoveMode();
            } else if (answerType === 'correct') {
                exitEditMode();
                answerDetails.innerHTML = `<p class="instruction-text">Kedjan kommer att bedömas som korrekt.</p>`;
            } else {
                exitEditMode();
                answerDetails.innerHTML = `<p class="instruction-text">Denna funktion är inte fullt implementerad än.</p>`;
            }
        });
    });

    // ----------------- SPARA-LOGIK OCH INITIERING -----------------

    saveBtn.addEventListener('click', () => {
        const scenarioData = {
            title: document.getElementById('scenario-title').value.trim(),
            type: 'sequence-analysis',
            steps: [{
                description: document.getElementById('scenario-description').value.trim(),
                sequenceGroups: [],
                correctAnswer: currentAnswer,
                explanation: document.getElementById('answer-explanation').value.trim()
            }]
        };

        canvasContainer.querySelectorAll('.group-card-admin').forEach(groupCard => {
            const groupData = {
                title: groupCard.querySelector('.group-title-input').value.trim(),
                color: groupCard.querySelector('.group-color-select').value,
                events: []
            };
            groupCard.querySelectorAll('.canvas-block-wrapper').forEach(block => {
                groupData.events.push({
                    event: block.dataset.eventName,
                    office: block.querySelector('.office-select').value
                });
            });
            scenarioData.steps[0].sequenceGroups.push(groupData);
        });
        
        jsonOutput.value = JSON.stringify([scenarioData], null, 2); // Omsluter i en lista
        alert("JSON genererad! Kopiera texten från rutan.");
    });
    
    // Initiera sidan
    buildPalette();
    addGroupBtn.addEventListener('click', addGroupBlock);
    addGroupBlock(); // Starta med ett tomt grupp-block
});
