// simulator-engine.js (Version med separata trigger- och panel-ytor)
function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    const gameImage = containerElement.querySelector('#game-image');
    const imageContainer = containerElement.querySelector('#image-container');
    const navOverlay = containerElement.querySelector('#navigation-overlay');
    let currentMenuViewKey = startMenuKey;
    let menuHistory = [];

    function switchMenuView(menuKey) {
        const menuData = ALL_MENUS[menuKey];
        if (!menuData) { console.error(`Hittade inte meny: ${menuKey}`); return; }
        currentMenuViewKey = menuKey;
        gameImage.src = menuData.image;
        gameImage.onload = () => { createUIElements(menuData); scaleUIElements(); };
        if (gameImage.complete) { gameImage.onload(); }
    }

    function createUIElements(menuData) {
        imageContainer.querySelectorAll('.clickable-area, .custom-dropdown-overlay, .text-overlay').forEach(el => el.remove());
        navOverlay.innerHTML = '';
        if (menuData.textOverlays) { /* ... (oförändrad) ... */ }

        if (menuData.events) {
            menuData.events.forEach(event => {
                // KORRIGERING: Använd triggerCoords för dropdowns, annars vanliga coords
                const triggerCoordinates = event.type === 'dropdown' ? event.triggerCoords : event.coords;
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
        if (menuData.backButtonCoords) { /* ... (oförändrad) ... */ }
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
        let optionsList = (typeof event.options === 'string' && event.options === 'ALL_OFFICES') ? ALL_OFFICES || [] : event.options || [];
        
        optionsList.forEach(optText => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'custom-dropdown-option';
            optionBtn.textContent = optText;
            optionBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                panel.querySelectorAll('.custom-dropdown-option').forEach(btn => btn.classList.remove('selected'));
                optionBtn.classList.add('selected');
                setTimeout(() => {
                    onButtonClickCallback({ name: optText }, null);
                    overlay.classList.add('fade-out');
                    setTimeout(() => overlay.remove(), 300);
                }, 400);
            });
            optionsContainer.appendChild(optionBtn);
        });

        panel.appendChild(optionsContainer);
        overlay.appendChild(panel);
        imageContainer.appendChild(overlay);

        // KORRIGERING: Använd panelCoords för att positionera och skala panelen
        scaleSingleElement(overlay, event.panelCoords);
    }
    
    function createArea(coords) {
        const area = document.createElement('div');
        area.classList.add('clickable-area');
        area.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height];
        return area;
    }

    function scaleSingleElement(element, coords) {
        // ... (denna funktion är oförändrad) ...
    }

    function scaleUIElements() {
        // ... (denna funktion är oförändrad) ...
    }

    window.addEventListener('resize', scaleUIElements);
    switchMenuView(startMenuKey);
    return {
        reset: () => {
            menuHistory = [];
            switchMenuView(startMenuKey);
        }
    };
}
