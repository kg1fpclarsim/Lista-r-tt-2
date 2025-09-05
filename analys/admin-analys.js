// admin-analys.js
document.addEventListener('DOMContentLoaded', () => {
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');

    // Funktion för att bygga ett nytt redigerbart block på arbetsytan
    function addEventBlockToCanvas(eventDef) {
        if (typeof ALL_OFFICES === 'undefined') {
            console.error("ALL_OFFICES är inte definierad. Se till att office-definitions.js är laddad.");
            return;
        }

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

        blockWrapper.querySelector('.delete-btn').addEventListener('click', () => {
            blockWrapper.remove();
            updateArrows();
        });

        canvasContainer.appendChild(blockWrapper);
        updateArrows();
    }

    // Funktion för att rita ut pilar mellan blocken
    function updateArrows() {
        canvasContainer.querySelectorAll('.sequence-arrow').forEach(arrow => arrow.remove());
        
        const blocks = canvasContainer.querySelectorAll('.canvas-block-wrapper');
        blocks.forEach((block, index) => {
            if (index < blocks.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'sequence-arrow';
                arrow.textContent = '→';
                block.after(arrow);
            }
        });
    }

    // Funktion för att bygga upp paletten med händelser
    function buildPalette() {
        if (typeof ANALYS_EVENTS === 'undefined') {
            console.error("ANALYS_EVENTS är inte definierad. Se till att event-definitions.js är laddad.");
            return;
        }

        ANALYS_EVENTS.forEach(eventDef => {
            const paletteItem = document.createElement('div');
            paletteItem.className = 'palette-item';
            paletteItem.dataset.eventName = eventDef.name;
            paletteItem.innerHTML = `<div class="event-block"><img src="${eventDef.image}" alt="${eventDef.name}"></div>`;
            
            paletteItem.addEventListener('click', () => {
                addEventBlockToCanvas(eventDef);
            });

            paletteContainer.appendChild(paletteItem);
        });
    }

    // Starta allt
    buildPalette();
});
