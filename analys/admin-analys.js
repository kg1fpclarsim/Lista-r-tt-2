document.addEventListener('DOMContentLoaded', () => {
    // Referenser
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');
    const addGroupBtn = document.getElementById('add-group-btn');
    const saveBtn = document.getElementById('save-btn');
    const jsonOutput = document.getElementById('json-output');

    let activeGroup = null; // Håller koll på vilken grupp som är aktiv

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
        groupCard.querySelector('.group-color-select').addEventListener('change', (e) => {
            groupCard.dataset.color = e.target.value;
            groupCard.className = `group-card-admin active ${e.target.value}`;
        });
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
        activeGroup.querySelector('.empty-group-prompt')?.remove();
        
        const eventCanvas = activeGroup.querySelector('.group-events-canvas');
        const blockWrapper = document.createElement('div');
        blockWrapper.className = 'canvas-block-wrapper';
        
        let optionsHtml = ALL_OFFICES.map(office => `<option value="${office}">${office}</option>`).join('');
        let selectHtml = `<select class="office-select"><option value="">Välj kontor...</option>${optionsHtml}</select>`;

        blockWrapper.innerHTML = `
            <div class="event-block">
                <img src="${eventDef.image}" alt="${eventDef.name}">
                ${selectHtml}
            </div>
            <button class="delete-btn small-delete-btn">X</button>
        `;
        blockWrapper.dataset.eventName = eventDef.name; // Spara namnet för att kunna spara
        blockWrapper.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); blockWrapper.remove(); });
        eventCanvas.appendChild(blockWrapper);
    }
    
    // Spara-funktionen kommer vi att bygga ut i nästa steg när vi gör facit-delen

    // Initiera sidan
    buildPalette();
    addGroupBtn.addEventListener('click', addGroupBlock);
    addGroupBlock(); // Starta med ett tomt grupp-block
});
