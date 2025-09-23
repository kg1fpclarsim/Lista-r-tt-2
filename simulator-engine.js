const SIMULATOR_ENGINE_VERSION = '5.5-FINAL';

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

    // UPPDATERAD: Tar nu emot overlayState för att hantera start-text
    function switchMenuView(menuKey, overlayState = {}) {
        const menuData = ALL_MENUS[menuKey];
        if (!menuData) { console.error(`Hittade inte meny: ${menuKey}`); return; }
        currentMenuViewKey = menuKey;
        gameImage.src = menuData.image;
        
        gameImage.onload = () => {
            createUIElements(menuData); // Skapar alla element, inklusive tomma textrutor
            
            // Fyller i textrutorna EFTER att de har skapats, men INNAN de visas
            if (menuData.textOverlays && overlayState) {
                for (const overlayId in overlayState) {
                    const text = overlayState[overlayId];
                    const overlayElement = imageContainer.querySelector(`#${overlayId}`);
                    if (overlayElement) {
                        overlayElement.textContent = text;
                    }
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
        const oldOverlay = imageContainer.querySelector('.custom-dropdown-overlay');
        if (oldOverlay) oldOverlay.remove();
        const overlay = document.createElement('div');
        overlay.className = 'custom-dropdown-overlay';
        const panel = document.createElement('div');
        panel.className = `custom-dropdown-panel ${event.layout || 'radio-list'}`;
        const title = event.title || `Välj ${event.name}`;
        panel.innerHTML = `<h3>${title}</h3>`;
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        let optionsList = (typeof event.options === 'string' && event.options === 'ALL_OFFICES') ? (ALL_OFFICES || []) : (event.options || []);
        optionsList.forEach(optText => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'custom-dropdown-option';
            optionBtn.textContent = optText;
            optionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.querySelectorAll('.custom-dropdown-option').forEach(btn => btn.classList.remove('selected'));
                optionBtn.classList.add('selected');
                setTimeout(() => {
                    if (typeof onButtonClickCallback === 'function') onButtonClickCallback({ name: optText }, null);
                    if (event.updatesOverlay) {
                        const overlayToUpdate = imageContainer.querySelector(`#${event.updatesOverlay}`);
                        if (overlayToUpdate) overlayToUpdate.textContent = optText;
                    }
                    overlay.classList.add('fade-out');
                    setTimeout(() => overlay.remove(), 300);
                }, 400);
            });
            optionsContainer.appendChild(optionBtn);
        });
        panel.appendChild(optionsContainer);
        overlay.appendChild(panel);
        scaleSingleElement(overlay, event.panelCoords);
    }
    
    function createArea(coords) {
        const area = document.createElement('div');
        area.classList.add('clickable-area');
        if(coords) { area.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height]; }
        return area;
    }

    function scaleSingleElement(element, coords) {
        const menuData = ALL_MENUS[currentMenuViewKey];
        if (!gameImage.offsetWidth || !menuData || !menuData.originalWidth || !coords) return;
        const scaleRatio = gameImage.offsetWidth / menuData.originalWidth;
        element.style.top = `${coords.top * scaleRatio}px`;
        element.style.left = `${coords.left * scaleRatio}px`;
        element.style.width = `${coords.width * scaleRatio}px`;
        element.style.height = `${coords.height * scaleRatio}px`;
    }

    function scaleUIElements() {
        containerElement.querySelectorAll('.clickable-area, .text-overlay').forEach(area => {
            const coordsArray = area.dataset.originalCoords.split(',');
            if (coordsArray.length < 4) return;
            const coords = { top: coordsArray[0], left: coordsArray[1], width: coordsArray[2], height: coordsArray[3] };
            scaleSingleElement(area, coords);
        });
    }

    window.addEventListener('resize', scaleUIElements);
    
    return {
        reset: (menuKey = startMenuKey, initialOverlayState = {}) => {
            menuHistory = [];
            switchMenuView(menuKey, initialOverlayState);
        }
    };
}

