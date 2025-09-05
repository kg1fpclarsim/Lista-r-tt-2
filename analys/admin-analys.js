document.addEventListener('DOMContentLoaded', () => {
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');

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

            // Skapa ett visuellt block likt det i spelet
            paletteItem.innerHTML = `
                <div class="event-block">
                    <img src="${eventDef.image}" alt="${eventDef.name}">
                </div>
            `;
            
            // Lägg till en klick-lyssnare (denna bygger vi ut sen)
            paletteItem.addEventListener('click', () => {
                console.log(`Klickade på palett-objekt: ${eventDef.name}`);
                // NÄSTA STEG: Kod för att skapa ett block på arbetsytan
            });

            paletteContainer.appendChild(paletteItem);
        });
    }

    // Starta allt
    buildPalette();
});
