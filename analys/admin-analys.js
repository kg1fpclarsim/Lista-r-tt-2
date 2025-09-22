// admin-analys.js
document.addEventListener('DOMContentLoaded', () => {
    // ... (referenser och globala variabler) ...
    
    // Funktion för att bygga paletten, nu smartare
    function buildPalette() {
        if (typeof ANALYS_EVENTS === 'undefined') { return; }

        // Använd Set för att undvika dubbletter
        const paletteEventNames = new Set();
        
        // Hämta namn från event-definitions.js
        ANALYS_EVENTS.forEach(eventDef => paletteEventNames.add(eventDef.name));

        // Hämta namn från alla kontor
        if (typeof ALL_OFFICES !== 'undefined') {
            ALL_OFFICES.forEach(officeName => paletteEventNames.add(officeName));
        }

        // Skapa palett-objekt från den unika listan
        Array.from(paletteEventNames).forEach(eventName => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            
            // Hitta originaldefinitionen för att få bilden (om den finns)
            const eventDef = ANALYS_EVENTS.find(e => e.name === eventName);
            const imageHtml = eventDef ? `<img src="${eventDef.image}" alt="${eventName}">` : '';

            item.innerHTML = `<div class="event-block">${imageHtml}<div class="event-type">${eventName}</div></div>`;
            item.addEventListener('click', () => {
                // Skapa ett "fake" eventDef-objekt för kontoren
                const def = eventDef || { name: eventName, image: '' }; 
                addEventToActiveGroup(def);
            });
            paletteContainer.appendChild(item);
        });
    }
    
    // ... (resten av admin-analys.js är oförändrad) ...
});
