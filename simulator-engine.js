// simulator-engine.js (version med förbättrad rullist-feedback)

function initializeSimulator(containerElement, startMenuKey, onButtonClickCallback) {
    // ... (all kod i toppen är oförändrad) ...

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

            // --- UPPDATERAD KLICK-LOGIK HÄR ---
            optionBtn.addEventListener('click', () => {
                // 1. Markera den klickade knappen visuellt
                // Ta bort 'selected' från alla andra knappar först
                panel.querySelectorAll('.custom-dropdown-option').forEach(btn => btn.classList.remove('selected'));
                optionBtn.classList.add('selected');

                // 2. Skicka iväg valet till spellogiken direkt
                onButtonClickCallback({ name: optText }, null);
                
                // 3. Vänta en kort stund innan panelen tas bort
                setTimeout(() => {
                    overlay.classList.add('fade-out'); // Tona ut snyggt
                    // Ta bort elementet helt efter att animationen är klar
                    setTimeout(() => overlay.remove(), 300);
                }, 400); // Visa markeringen i 0.4 sekunder
            });
            optionsContainer.appendChild(optionBtn);
        });

        panel.appendChild(optionsContainer);
        overlay.appendChild(panel);
        imageContainer.appendChild(overlay);
    }
    
    // ... (resten av filen: createUIElements, switchMenuView, etc. är oförändrad) ...
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
}
