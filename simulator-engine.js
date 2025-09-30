const SIMULATOR_ENGINE_VERSION = '10.0-STABLE';

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
    const selectedOfficeReadout = document.createElement('div');
    selectedOfficeReadout.id = 'selected-office-readout';
    selectedOfficeReadout.className = 'mirrored-overlay';
    containerElement.appendChild(selectedOfficeReadout);
    const gameImage = containerElement.querySelector('#game-image');
    if (!gameImage) {
        console.error("FATALT FEL: Kunde inte skapa <img>-elementet.");
        return null;
    }
    const imageContainer = containerElement.querySelector('#image-container');
    const navOverlay = containerElement.querySelector('#navigation-overlay');
    let currentMenuViewKey = startMenuKey;
    let menuHistory = [];
    let overlayState = {};
    const overlayMirrorSelectors = {};

    function applyOverlayText(overlayId, value) {
        const normalizedValue = (value === undefined || value === null) ? '' : value;
        if (normalizedValue === '') {
            delete overlayState[overlayId];
        } else {
            overlayState[overlayId] = normalizedValue;
        }
        const overlayElement = imageContainer.querySelector(`#${overlayId}`);
        if (overlayElement) {
            overlayElement.textContent = normalizedValue;
        }
        const mirrors = overlayMirrorSelectors[overlayId] || [];
        mirrors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.textContent = normalizedValue;
            });
        });
    }

    function switchMenuView(menuKey, stateToApply = overlayState) {
        return new Promise((resolve) => {
            const menuData = ALL_MENUS[menuKey];
            if (!menuData) {
                console.error(`Hittade inte meny: ${menuKey}`);
                resolve(false);
                return;
            }
            currentMenuViewKey = menuKey;
            gameImage.src = menuData.image;
            
            const onImageLoad = () => {
                createUIElements(menuData, stateToApply);
                scaleUIElements();
                resolve(true);
            };

            if (gameImage.complete && gameImage.src.endsWith(menuData.image)) {
                onImageLoad();
            } else {
                gameImage.onload = onImageLoad;
                gameImage.onerror = () => {
                    console.error(`Kunde inte ladda bild: ${menuData.image}`);
                    resolve(false);
                }
            }
        });
    }

    function createUIElements(menuData, stateToApply = overlayState) {
        imageContainer.querySelectorAll('.clickable-area, .custom-dropdown-overlay, .text-overlay').forEach(el => el.remove());
        navOverlay.innerHTML = '';
        Object.keys(overlayMirrorSelectors).forEach(key => delete overlayMirrorSelectors[key]);
        if (menuData.textOverlays) {
            menuData.textOverlays.forEach(overlayData => {
                const overlayDiv = document.createElement('div');
                overlayDiv.id = overlayData.id;
                overlayDiv.className = 'text-overlay';
                overlayDiv.dataset.originalCoords = [overlayData.coords.top, overlayData.coords.left, overlayData.coords.width, overlayData.coords.height];
                overlayMirrorSelectors[overlayData.id] = overlayData.mirrorSelectors || [];
                imageContainer.appendChild(overlayDiv);
                const initialValue = (stateToApply && Object.prototype.hasOwnProperty.call(stateToApply, overlayData.id))
                    ? stateToApply[overlayData.id]
                    : '';
                applyOverlayText(overlayData.id, initialValue);
            });
        }
        if (menuData.events) {
            menuData.events.forEach(event => {
                const triggerCoordinates = event.type === 'dropdown' ? event.triggerCoords : event.coords;
                if (!triggerCoordinates) return;
                const area = createArea(triggerCoordinates);
                area.addEventListener('click', () => {
                    if (event.type !== 'dropdown' && typeof onButtonClickCallback === 'function') {
                        onButtonClickCallback(event, area);
                    }
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
                        applyOverlayText(event.updatesOverlay, optText);
                    }
                    overlay.classList.add('fade-out');
                    setTimeout(() => overlay.remove(), 300);
                }, 400);
            });
            optionsContainer.appendChild(optionBtn);
        });
        panel.appendChild(optionsContainer);
        overlay.appendChild(panel);
        imageContainer.appendChild(overlay);
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
        reset: async (menuKey = startMenuKey, newOverlayState) => {
            menuHistory = [];
            overlayState = newOverlayState ? { ...newOverlayState } : {};
            return await switchMenuView(menuKey, overlayState);
        }
    };
}

