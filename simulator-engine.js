const SIMULATOR_ENGINE_VERSION = '2.7-ROBUST';

function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    if (!containerElement) {
        console.error("FATALT FEL: Simulator-behållaren hittades inte!");
        return null;
    }
    containerElement.innerHTML = `
        <div id="image-container">
            <img src="" alt="Handdatormeny" id="game-image" style="max-width: 100%; height: auto; display: block;">
            <div id="navigation-overlay"></div>
        </div>`;
    const gameImage = containerElement.querySelector('#game-image');
    if (!gameImage) {
        console.error("FATALT FEL: Kunde inte skapa <img>-elementet.");
        return null;
    }
    const imageContainer = containerElement.querySelector('#image-container');
    const navOverlay = containerElement.querySelector('#navigation-overlay');
    let currentMenuViewKey = startMenuKey;
    let menuHistory = [];

    // UPPDATERAD: Tar nu emot overlayState för att hantera start-text
    function switchMenuView(menuKey, overlayState = {}) {
        const menuData = ALL_MENUS[menuKey];
        if (!menuData) { console.error(`Hittade inte meny: ${menuKey}`); return; }
        currentMenuViewKey = menuKey;
        gameImage.src = menuData.image;
        gameImage.onload = () => {
            createUIElements(menuData); // Skapar tomma textrutor
            
            // Fyller i textrutorna EFTER att de har skapats
            for (const overlayId in overlayState) {
                const text = overlayState[overlayId];
                const overlayElement = imageContainer.querySelector(`#${overlayId}`);
                if (overlayElement) {
                    overlayElement.textContent = text;
                }
            }
            
            scaleUIElements(); // Skalar allt till rätt storlek
        };
        if (gameImage.complete) gameImage.onload();
    }

    function createUIElements(menuData) {
        imageContainer.querySelectorAll('.clickable-area, .custom-dropdown-overlay, .text-overlay').forEach(el => el.remove());
        navOverlay.innerHTML = '';
        if (menuData.textOverlays) {
            menuData.textOverlays.forEach(overlayData => {
                const overlayDiv = document.createElement('div');
                overlayDiv.id = overlayData.id;
                overlayDiv.className = 'text-overlay';
                // Notera: Sätter inte text här, det görs i switchMenuView
                overlayDiv.dataset.originalCoords = [overlayData.coords.top, overlayData.coords.left, overlayData.coords.width, overlayData.coords.height];
                imageContainer.appendChild(overlayDiv);
            });
        }
        if (menuData.events) {
            menuData.events.forEach(event => {
                const triggerCoordinates = event.type === 'dropdown' ? event.triggerCoords : event.coords;
                if (!triggerCoordinates) return;
                const area = createArea(triggerCoordinates);
                area.addEventListener('click', () => {
                    if (typeof onButtonClickCallback === 'function') onButtonClickCallback(event, area);
                    if (event.submenu) {
                        menuHistory.push(currentMenuViewKey);
                        switchMenuView(event.submenu);
                    } else if (event.type === 'dropdown') {
                        handleDropdown(event);
                    }
                });
                imageContainer.appendChild(area);
            });
        }
        if (menuData.backButtonCoords) {
            const backArea = createArea(menuData.backButtonCoords);
            backArea.addEventListener('click', () => {
                if (menuHistory.length > 0) {
                    if (typeof onButtonClickCallback === 'function') onButtonClickCallback({ name: 'Tillbaka' }, backArea);
                    const previousMenuKey = menuHistory.pop();
                    switchMenuView(previousMenuKey);
                }
            });
            navOverlay.appendChild(backArea);
        }
    }

    // ... (handleDropdown, createArea, scaleSingleElement, scaleUIElements är oförändrade) ...
    function handleDropdown(event) { /* ... */ }
    function createArea(coords) { /* ... */ }
    function scaleSingleElement(element, coords) { /* ... */ }
    function scaleUIElements() { /* ... */ }

    window.addEventListener('resize', scaleUIElements);
    
    // KORRIGERING: Returnera den nya, smartare reset-funktionen
    return {
        reset: (menuKey = startMenuKey, initialOverlayState = {}) => {
            menuHistory = [];
            switchMenuView(menuKey, initialOverlayState);
        }
    };
}
