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
    const gameImage = containerElement.querySelector('#game-image');
    if (!gameImage) {
        console.error("FATALT FEL: Kunde inte skapa <img>-elementet.");
        return null;
    }
    const imageContainer = containerElement.querySelector('#image-container');
    const selectedOfficeReadout = document.createElement('div');
    selectedOfficeReadout.id = 'selected-office-readout';
    selectedOfficeReadout.className = 'text-overlay mirrored-overlay';
    imageContainer.appendChild(selectedOfficeReadout);
    const navOverlay = containerElement.querySelector('#navigation-overlay');
    let currentMenuViewKey = startMenuKey;
    let menuHistory = [];
    let overlayState = {};
    const overlayMirrorSelectors = {};

        function clearOverlaysAndMirrors() {
        imageContainer.querySelectorAll('.clickable-area, .custom-dropdown-overlay, .text-overlay:not(.mirrored-overlay)')
            .forEach(el => el.remove());
        navOverlay.innerHTML = '';

        Object.values(overlayMirrorSelectors).forEach(selectors => {
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(element => {
                    element.textContent = '';
                    element.removeAttribute('data-original-coords');
                });
            });
        });
        imageContainer.querySelectorAll('.mirrored-overlay').forEach(element => {
            element.textContent = '';
            element.removeAttribute('data-original-coords');
        });

        Object.keys(overlayMirrorSelectors).forEach(key => delete overlayMirrorSelectors[key]);
    }

    function applyOverlayText(overlayId, value) {
        const normalizedValue = (value === undefined || value === null) ? '' : value;
        if (normalizedValue === '') {
            delete overlayState[overlayId];
        } else {
            overlayState[overlayId] = normalizedValue;
        }
        const overlayElements = imageContainer.querySelectorAll(`.text-overlay[data-overlay-key="${overlayId}"]`);
        overlayElements.forEach(overlayElement => {
            overlayElement.textContent = normalizedValue;
        });
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
 
            clearOverlaysAndMirrors();
            
            const onImageLoad = () => {
                createUIElements(menuData, stateToApply);
                scaleUIElements();
                resolve(true);
            };

            const handleImageLoad = () => {
                gameImage.onload = null;
                gameImage.onerror = null;
             onImageLoad();
            };

            const handleImageError = () => {
                console.error(`Kunde inte ladda bild: ${menuData.image}`);
                gameImage.onload = null;
                gameImage.onerror = null;
                resolve(false);
            };

            gameImage.onload = handleImageLoad;
            gameImage.onerror = handleImageError;

            gameImage.src = menuData.image;

             if (gameImage.complete && gameImage.src.endsWith(menuData.image)) {
                if (gameImage.naturalWidth > 0) {
                    handleImageLoad();
                } else {
                    handleImageError();
                }
            }
        });
    }

    function createUIElements(menuData, stateToApply = overlayState) {
        if (menuData.textOverlays) {
            menuData.textOverlays.forEach((overlayData, index) => {
                const originalCoords = [overlayData.coords.top, overlayData.coords.left, overlayData.coords.width, overlayData.coords.height].join(',');
                const mirrorSelectors = overlayData.mirrorSelectors || [];
                   const shouldRenderOverlayElement = !(mirrorSelectors.length > 0 && overlayData.mirrorOnly);
                let overlayDiv = null;

                if (shouldRenderOverlayElement) {
                    overlayDiv = document.createElement('div');
                    overlayDiv.id = `${overlayData.id}-${index}`;
                    overlayDiv.className = 'text-overlay';
                    overlayDiv.dataset.overlayKey = overlayData.id;
                    overlayDiv.dataset.originalCoords = originalCoords;
                }
                const existingSelectors = overlayMirrorSelectors[overlayData.id] || [];
                const combinedSelectors = [...existingSelectors];
                mirrorSelectors.forEach(selector => {
                    if (!combinedSelectors.includes(selector)) {
                        combinedSelectors.push(selector);
                    }
                });
                overlayMirrorSelectors[overlayData.id] = combinedSelectors;
                mirrorSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(mirrorElement => {
                        mirrorElement.dataset.originalCoords = originalCoords;
                    });
                });
                if (overlayDiv) {
                    imageContainer.appendChild(overlayDiv);
                }
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
            const originalCoords = area.dataset.originalCoords;
            if (!originalCoords) return;
            const coordsArray = originalCoords.split(',');
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

