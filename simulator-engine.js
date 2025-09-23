const SIMULATOR_ENGINE_VERSION = '7.0-FINAL';

function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    if (!containerElement) {
        console.error("FATALT FEL: Simulator-behållaren (containerElement) hittades inte!");
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

    function switchMenuView(menuKey) {
        // Returnerar ett Promise som löses när bilden är laddad och UI är ritat
        return new Promise((resolve) => {
            const menuData = ALL_MENUS[menuKey];
            if (!menuData) {
                console.error(`Hittade inte meny: ${menuKey}`);
                resolve(false); // Signalerar att det misslyckades
                return;
            }
            currentMenuViewKey = menuKey;
            gameImage.src = menuData.image;
            
            const onImageLoad = () => {
                createUIElements(menuData);
                scaleUIElements();
                resolve(true); // Signalerar att allt är klart!
            };

            if (gameImage.complete) {
                onImageLoad();
            } else {
                gameImage.onload = onImageLoad;
            }
        });
    }

    function createUIElements(menuData) {
        imageContainer.querySelectorAll('.clickable-area, .custom-dropdown-overlay, .text-overlay').forEach(el => el.remove());
        navOverlay.innerHTML = '';
        if (menuData.textOverlays) {
            menuData.textOverlays.forEach(overlayData => {
                const overlayDiv = document.createElement('div');
                overlayDiv.id = overlayData.id;
                overlayDiv.className = 'text-overlay';
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

    function handleDropdown(event) {
        // ... (denna funktion är oförändrad från den senaste kompletta versionen) ...
    }
    function createArea(coords) {
        // ... (denna funktion är oförändrad) ...
    }
    function scaleSingleElement(element, coords) {
        // ... (denna funktion är oförändrad) ...
    }
    function scaleUIElements() {
        // ... (denna funktion är oförändrad) ...
    }

    window.addEventListener('resize', scaleUIElements);
    
    // Returnera en async reset-funktion
    return {
        reset: async (menuKey = startMenuKey) => {
            menuHistory = [];
            return await switchMenuView(menuKey); // Vänta tills menyn är helt klar
        }
    };
}


