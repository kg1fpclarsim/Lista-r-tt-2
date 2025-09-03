// simulator-engine.js

function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    containerElement.innerHTML = `
        <div id="image-container">
            <img src="" alt="Handdator skärmbild" id="game-image" style="max-width: 100%; height: auto; display: block;">
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
        if (!menuData) {
            console.error(`Kunde inte hitta en meny med nyckeln: ${menuKey}`);
            return;
        }
        currentMenuViewKey = menuKey;
        gameImage.src = menuData.image;
        gameImage.onload = () => {
            createUIElements(menuData);
            scaleUIElements();
        };
        if (gameImage.complete) { gameImage.onload(); }
    }

    function createUIElements(menuData) {
        imageContainer.querySelectorAll('.clickable-area').forEach(el => el.remove());
        const oldSelect = imageContainer.querySelector('.dynamic-select');
        if(oldSelect) oldSelect.remove();
        navOverlay.innerHTML = '';

        if (menuData.events) {
            menuData.events.forEach(event => {
                const area = createArea(event.coords);
                area.addEventListener('click', () => {
                    onButtonClickCallback(event);
                    if (event.submenu) {
                        menuHistory.push(currentMenuViewKey);
                        switchMenuView(event.submenu);
                    } else if (event.type === 'dropdown') {
                        handleDropdown(event, area);
                    }
                });
                imageContainer.appendChild(area);
            });
        }

        if (menuData.backButtonCoords) {
            const backArea = createArea(menuData.backButtonCoords);
            backArea.addEventListener('click', () => {
                if (menuHistory.length > 0) {
                    onButtonClickCallback({ name: 'Tillbaka' });
                    const previousMenuKey = menuHistory.pop();
                    switchMenuView(previousMenuKey);
                }
            });
            navOverlay.appendChild(backArea);
        }
    }

    function handleDropdown(event, area) {
        const oldSelect = imageContainer.querySelector('.dynamic-select');
        if(oldSelect) oldSelect.remove();
        const selectEl = document.createElement('select');
        selectEl.className = 'dynamic-select';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = `Välj ${event.name}...`;
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectEl.appendChild(defaultOption);
        event.options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt;
            optionEl.textContent = opt;
            selectEl.appendChild(optionEl);
        });
        selectEl.addEventListener('change', () => {
            onButtonClickCallback({ name: selectEl.value });
            selectEl.remove();
        });
        imageContainer.appendChild(selectEl);
        scaleSingleElement(selectEl, event.coords);
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
        const allAreas = containerElement.querySelectorAll('.clickable-area');
        allAreas.forEach(area => {
            const coordsArray = area.dataset.originalCoords.split(',');
            const coords = { top: coordsArray[0], left: coordsArray[1], width: coordsArray[2], height: coordsArray[3] };
            scaleSingleElement(area, coords);
        });
    }

    window.addEventListener('resize', scaleUIElements);
    switchMenuView(startMenuKey);
}
