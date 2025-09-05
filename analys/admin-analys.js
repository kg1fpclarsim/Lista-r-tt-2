document.addEventListener('DOMContentLoaded', () => {
    // --- START PÅ FELSÖKNINGSKOD ---
    const debugBox = document.createElement('div');
    debugBox.style.position = 'fixed';
    debugBox.style.top = '10px';
    debugBox.style.left = '10px';
    debugBox.style.padding = '10px';
    debugBox.style.backgroundColor = '#333';
    debugBox.style.color = 'white';
    debugBox.style.zIndex = '1000';
    debugBox.style.border = '2px solid red';
    debugBox.style.fontFamily = 'monospace';
    debugBox.innerHTML = '<h3>Diagnostik</h3><p id="debug-status">Väntar på interaktion...</p>';
    document.body.appendChild(debugBox);
    const debugStatus = document.getElementById('debug-status');
    // --- SLUT PÅ FELSÖKNINGSKOD ---

    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');
    const addGroupBtn = document.getElementById('add-group-btn');
    
    let activeGroup = null;

    function buildPalette() {
        if (typeof ANALYS_EVENTS === 'undefined' || !Array.isArray(ANALYS_EVENTS)) {
            debugStatus.textContent = "FEL: ANALYS_EVENTS är inte definierad. Ladda event-definitions.js.";
            return;
        }
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
        // ... (innerHTML är oförändrad från förra gången)
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
        groupCard.classList.add(colorSelect.value);

        groupCard.addEventListener('click', () => {
            document.querySelectorAll('.group-card-admin').forEach(card => card.classList.remove('active'));
            groupCard.classList.add('active');
            activeGroup = groupCard;
            debugStatus.textContent = `Grupp ${groupCard.querySelector('h4')?.textContent || ''} är nu aktiv!`;
        });
        
        groupCard.click();
    }

    function addEventToActiveGroup(eventDef) {
        debugStatus.textContent = `Försöker lägga till block: ${eventDef.name}`;
        
        if (!activeGroup) {
            debugStatus.textContent += "\nFEL: Ingen aktiv grupp hittades!";
            alert("Klicka på ett grupp-block för att aktivera det först.");
            return;
        }
        
        activeGroup.querySelector('.empty-group-prompt')?.remove();
        
        const eventCanvas = activeGroup.querySelector('.group-events-canvas');
        if (!eventCanvas) {
            debugStatus.textContent += "\nFEL: Hittade inte .group-events-canvas inuti den aktiva gruppen!";
            return;
        }

        const blockWrapper = document.createElement('div');
        blockWrapper.className = 'canvas-block-wrapper';
        
        if (typeof ALL_OFFICES === 'undefined' || !Array.isArray(ALL_OFFICES)) {
            debugStatus.textContent += "\nFEL: ALL_OFFICES är inte definierad. Ladda office-definitions.js.";
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
            e.stopPropagation();
            blockWrapper.remove();
        });
        
        eventCanvas.appendChild(blockWrapper);
        debugStatus.textContent = `Block för ${eventDef.name} lades till!`;
    }
    
    buildPalette();
    addGroupBtn.addEventListener('click', addGroupBlock);
    addGroupBlock();
});
