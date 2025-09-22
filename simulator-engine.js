const SIMULATOR_ENGINE_VERSION = 'DEBUG-2.8';

function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    console.log('[Engine] initializeSimulator anropas.');

    if (!containerElement) {
        console.error("[Engine] FATALT FEL: Simulator-behållaren (containerElement) är null! Kontrollera att HTML-filen är korrekt.");
        return null;
    }
    console.log('[Engine] Simulator-behållaren hittades.', containerElement);

    containerElement.innerHTML = `
        <div id="image-container">
            <img src="" alt="Handdatormeny" id="game-image" style="max-width: 100%; height: auto; display: block;">
            <div id="navigation-overlay"></div>
        </div>
    `;
    const gameImage = containerElement.querySelector('#game-image');
    if (!gameImage) {
        console.error("[Engine] FATALT FEL: Kunde inte hitta #game-image inuti behållaren. innerHTML misslyckades.");
        return null;
    }
    console.log('[Engine] Bildelementet (#game-image) hittades.');

    const imageContainer = containerElement.querySelector('#image-container');
    const navOverlay = containerElement.querySelector('#navigation-overlay');
    let currentMenuViewKey = startMenuKey;
    let menuHistory = [];

    function switchMenuView(menuKey) {
        console.log(`[Engine] switchMenuView anropas med nyckeln: ${menuKey}`);
        const menuData = ALL_MENUS[menuKey];
        if (!menuData) {
            console.error(`[Engine] Hittade inte meny: ${menuKey}`);
            return;
        }
        currentMenuViewKey = menuKey;
        gameImage.src = menuData.image;
        console.log(`[Engine] Bildkälla satt till: ${menuData.image}`);
        gameImage.onload = () => {
            console.log(`[Engine] Bilden ${menuData.image} har laddats. Skapar UI-element.`);
            createUIElements(menuData);
            scaleUIElements();
        };
        if (gameImage.complete) {
             console.log(`[Engine] Bilden ${menuData.image} var redan laddad (cache). Kör onload manuellt.`);
             gameImage.onload();
        }
    }
    
    // ... (resten av funktionerna är oförändrade, vi behöver inte logga i dem just nu)
    function createUIElements(menuData) { /*...*/ }
    function handleDropdown(event) { /*...*/ }
    function createArea(coords) { /*...*/ }
    function scaleSingleElement(element, coords) { /*...*/ }
    function scaleUIElements() { /*...*/ }

    window.addEventListener('resize', scaleUIElements);
    
    console.log('[Engine] Initiering klar. Anropar switchMenuView för första gången.');
    switchMenuView(startMenuKey);

    return {
        reset: (menuKey = startMenuKey, initialOverlayState = {}) => {
            console.log(`[Engine] simulator.reset() anropas med nyckeln: ${menuKey}`);
            menuHistory = [];
            switchMenuView(menuKey, initialOverlayState);
        }
    };
}
