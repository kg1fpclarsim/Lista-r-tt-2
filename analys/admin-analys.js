document.addEventListener('DOMContentLoaded', () => {
    // Referenser
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');
    const addGroupBtn = document.getElementById('add-group-btn');
    const saveBtn = document.getElementById('save-btn');
    const jsonOutput = document.getElementById('json-output');
    const answerEditor = document.getElementById('answer-editor');
    const answerDetails = document.getElementById('answer-details');

    let activeGroup = null;

    // Bygg paletten med händelser
    function buildPalette() {
        ANALYS_EVENTS.forEach(eventDef => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            item.innerHTML = `<div class="event-block"><img src="${eventDef.image}" alt="${eventDef.name}"><div class="event-type">${eventDef.name}</div></div>`;
            item.addEventListener('click', () => addEventToActiveGroup(eventDef));
            paletteContainer.appendChild(item);
        });
    }

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
        groupCard.click();
    }

    function addEventToActiveGroup(eventDef) {
        if (!activeGroup) { alert("Klicka på ett grupp-block för att aktivera det först."); return; }
        activeGroup.querySelector('.empty-group-prompt')?.remove();
        
        const eventCanvas = activeGroup.querySelector('.group-events-canvas');
        const blockWrapper = document.createElement('div');
        blockWrapper.className = 'canvas-block-wrapper';
        
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
    
    // Logik för Facit-sektionen
    answerEditor.querySelector('.answer-type-selector').addEventListener('change', (e) => {
        const answerType = e.target.value;
        answerDetails.innerHTML = ''; // Rensa
        canvasContainer.querySelectorAll('.event-block, .plus-icon').forEach(el => el.classList.remove('selectable'));

        if (answerType === 'remove' || answerType === 'correct_office') {
            answerDetails.innerHTML = `<p class="instruction-text">Instruktion: Klicka på det händelseblock i arbetsytan som är felaktigt.</p>`;
            canvasContainer.querySelectorAll('.event-block').forEach(el => el.classList.add('selectable'));
        } else if (answerType === 'add') {
            answerDetails.innerHTML = `<p class="instruction-text">Instruktion: Klicka på ett '+' i arbetsytan där händelsen saknas.</p>`;
        }
    });

    // Spara-knappen (vi bygger ut denna när Facit-delen är klar)
    saveBtn.addEventListener('click', () => {
        alert("Spara-funktionen för Facit är inte implementerad än, men vi har en bra grund!");
    });

    // Initiera sidan
    buildPalette();
    addGroupBtn.addEventListener('click', addGroupBlock);
    addGroupBlock();
});
