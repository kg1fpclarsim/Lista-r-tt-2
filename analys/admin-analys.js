document.addEventListener('DOMContentLoaded', () => {
    // Referenser
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');
    const addGroupBtn = document.getElementById('add-group-btn');
    // Vi kommer behöva spara-knappen och JSON-utdatan senare
    // const saveBtn = document.getElementById('save-btn');
    // const jsonOutput = document.getElementById('json-output');

    let activeGroup = null; // Håller koll på vilken grupp som är aktiv

    // Bygg paletten med händelser
    function buildPalette() {
        if (typeof ANALYS_EVENTS === 'undefined') {
            console.error("ANALYS_EVENTS är inte definierad. Se till att event-definitions.js är laddad.");
            return;
        }
        ANALYS_EVENTS.forEach(eventDef => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            // Använd event-block-styling direkt i paletten för igenkänning
            item.innerHTML = `
                <div class="event-block">
                    <img src="${eventDef.image}" alt="${eventDef.name}">
                    <div class="event-type">${eventDef.name}</div>
                </div>`;
            item.addEventListener('click', () => addEventToActiveGroup(eventDef));
            paletteContainer.appendChild(item);
        });
    }

    // Lägg till ett nytt grupp-block på arbetsytan
    function addGroupBlock() {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card-admin';
        groupCard.innerHTML = `
            <div class="group-card-header">
                <textarea class="group-title-input" rows="2" placeholder="Grupprubrik (Markdown)..."></textarea>
                <select class="group-color-select">
                    <option value="green">Grön</option>
                    <option value="blue">Blå</option>
                    <option value="grey">Grå</option>
                </select>
                <button class="delete-btn small-delete-btn">X</button>
            </div>
            <div class="group-events-canvas">
                <p class="empty-group-prompt">Klicka här för att aktivera gruppen, lägg sedan till händelser från paletten.</p>
            </div>
        `;
        canvasContainer.appendChild(groupCard);
        
        groupCard.querySelector('.delete-btn').addEventListener('click', () => groupCard.remove());
        
        const colorSelect = groupCard.querySelector('.group-color-select');
        colorSelect.addEventListener('change', () => {
            groupCard.classList.remove('green', 'blue', 'grey');
            groupCard.classList.add(colorSelect.value);
        });
        // Sätt defaultfärg
        groupCard.classList.add(colorSelect.value);

        groupCard.addEventListener('click', () => {
            document.querySelectorAll('.group-card-admin').forEach(card => card.classList.remove('active'));
            groupCard.classList.add('active');
            activeGroup = groupCard;
        });
        
        groupCard.click(); // Aktivera direkt
    }

    // Lägg till ett händelse-block i den aktiva gruppen
    function addEventToActiveGroup(eventDef) {
        if (!activeGroup) {
            alert("Klicka på ett grupp-block för att aktivera det först.");
            return;
        }
        // Ta bort platshållartexten
        activeGroup.querySelector('.empty-group-prompt')?.remove();
        
        const eventCanvas = activeGroup.querySelector('.group-events-canvas');
        const blockWrapper = document.createElement('div');
        blockWrapper.className = 'canvas-block-wrapper';
        
        if (typeof ALL_OFFICES === 'undefined') {
            console.error("ALL_OFFICES är inte definierad.");
            return;
        }
        let optionsHtml = ALL_OFFICES.map(office => `<option value="${office}">${office}</option>`).join('');
        let selectHtml = `<select class="office-select"><option value="">Välj kontor...</option>${optionsHtml}</select>`;

        blockWrapper.innerHTML = `
            <div class="event-block">
                <img src="${eventDef.image}" alt="${eventDef.name}">
                ${selectHtml}
            </div>
            <button class="delete-btn small-delete-btn">X</button>
        `;
        blockWrapper.dataset.eventName = eventDef.name;
        blockWrapper.querySelector('.delete-btn').addEventListener('click', (e) => { 
            e.stopPropagation(); // Förhindra att klicket aktiverar kortet
            blockWrapper.remove();
        });
        eventCanvas.appendChild(blockWrapper);
    }
    
    // Initiera sidan
    buildPalette();
    addGroupBtn.addEventListener('click', addGroupBlock);
    addGroupBlock(); // Starta med ett tomt grupp-block
});
