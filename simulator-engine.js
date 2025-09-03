// simulator-engine.js (Korrekt version)

// KORRIGERING: Hela filens innehåll är nu inlindat i denna funktion
function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    containerElement.innerHTML = `
        <div id="image-container">
            <img src="" alt="Handdatormeny" id="game-image" style="max-width: 100%; height: auto; display: block;">
            <div id="navigation-overlay"></div>
        </div>
    `;

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
        imageContainer.querySelectorAll('.clickable-area, .custom-dropdown-overlay').forEach(el => el.remove());
        navOverlay.innerHTML = '';
        if (menuData.events) {
            menuData.events.forEach(event => {
                const area = createArea(event.coords);
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
        event.options.forEach(optText => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'custom-dropdown-option';
            optionBtn.textContent = optText;
            optionBtn.addEventListener('click', () => {
                onButtonClickCallback({ name: optText }, null);
                overlay.remove();
            });
            optionsContainer.appendChild(optionBtn);
        });
        panel.appendChild(optionsContainer);
        overlay.appendChild(panel);
        imageContainer.appendChild(overlay);
    }
    
    function createArea(coords) {
        const area = document.createElement('div');
        area.classList.add('clickable-area');
        area.dataset.originalCoords = [coords.top, coords.left, coords.width, coords.height];
        return area;
    }

    function scaleSingleElement(element, coords) {
        const menuData = ALL_MENUS[currentMenuViewKey];
        if (!gameImage.offsetWidth || !menuData || !menuData.originalWidth) return;
        const scaleRatio = gameImage.offsetWidth / menuData.originalWidth;
        element.style.top = `${coords.top * scaleRatio}px`;
        element.style.left = `${coords.left * scaleRatio}px`;
        element.style.width = `${coords.width * scaleRatio}px`;
        element.style.height = `${coords.height * scaleRatio}px`;
    }

    function scaleUIElements() {
        containerElement.querySelectorAll('.clickable-area').forEach(area => {
            const coordsArray = area.dataset.originalCoords.split(',');
            const coords = { top: coordsArray[0], left: coordsArray[1], width: coordsArray[2], height: coordsArray[3] };
            scaleSingleElement(area, coords);
        });
    }

    window.addEventListener('resize', scaleUIElements);
    
    switchMenuView(startMenuKey);

    return {
        reset: () => {
            menuHistory = [];
            switchMenuView(startMenuKey);
        }
    };
} // <-- KORRIGERING: Avslutande måsvinge för hela funktionen
