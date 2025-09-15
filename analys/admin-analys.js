// admin-analys.js (Korrekt och komplett version)
document.addEventListener('DOMContentLoaded', () => {
    const paletteContainer = document.getElementById('palette-container');
    const canvasContainer = document.getElementById('canvas-container');
    const addGroupBtn = document.getElementById('add-group-btn');
    const saveBtn = document.getElementById('save-btn');
    const jsonOutput = document.getElementById('json-output');
    const answerEditor = document.getElementById('answer-editor');
    const answerDetails = document.getElementById('answer-details');

    let activeGroup = null;
    let currentAnswer = { type: 'correct' };

    function buildPalette() { /* ... oförändrad ... */ }
    function addGroupBlock() { /* ... oförändrad ... */ }
    function addEventToActiveGroup(eventDef) { /* ... oförändrad ... */ }
    
    // --- NY OCH FÖRBÄTTRAD FACIT-LOGIK ---

    function exitAnswerEditMode() {
        // Ta bort klasser från alla block
        canvasContainer.querySelectorAll('.canvas-block-wrapper').forEach(el => {
            el.classList.remove('selectable-to-edit', 'selected-as-answer');
        });
        
        // Ta bort alla tillfälliga klick-lyssnare. Detta är det nya, säkra sättet.
        // Vi klonar varje block för att ta bort lyssnare, men sparar och återställer värdet i rullistan.
        canvasContainer.querySelectorAll('.canvas-block-wrapper').forEach(block => {
            const select = block.querySelector('.office-select');
            const selectedValue = select ? select.value : null;

            const newBlock = block.cloneNode(true);
            block.parentNode.replaceChild(newBlock, block);

            if (selectedValue) {
                const newSelect = newBlock.querySelector('.office-select');
                if (newSelect) newSelect.value = selectedValue;
            }
        });
    }

    function enterRemoveMode() {
        exitAnswerEditMode();
        answerDetails.innerHTML = `<p class="instruction-text">Redigeringsläge: Klicka på det händelseblock i arbetsytan som ska tas bort.</p>`;
        
        let overallIndex = 0;
        canvasContainer.querySelectorAll('.group-card-admin').forEach((group, groupIndex) => {
            group.querySelectorAll('.canvas-block-wrapper').forEach((block, eventIndex) => {
                const currentIndex = overallIndex; // Spara indexet för detta block
                block.classList.add('selectable-to-edit');
                
                const clickHandler = (e) => {
                    e.stopPropagation();
                    currentAnswer = { 
                        type: 'remove', 
                        location: { groupIndex: groupIndex, eventIndex: eventIndex }
                    };
                    answerDetails.innerHTML = `<p class="instruction-text">OK! Block ${currentIndex + 1} kommer att markeras som fel.</p>`;
                    // Ta bort highlight från alla, lägg till på den klickade
                    canvasContainer.querySelectorAll('.canvas-block-wrapper').forEach(b => b.classList.remove('selected-as-answer'));
                    block.classList.add('selected-as-answer');
                    exitAnswerEditMode();
                };
                
                block.addEventListener('click', clickHandler, { once: true });
                overallIndex++;
            });
        });
    }
    
    answerEditor.querySelectorAll('input[name="answerType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const answerType = radio.value;
            currentAnswer = { type: answerType };
            exitAnswerEditMode();

            if (answerType === 'remove') {
                enterRemoveMode();
            } else if (answerType === 'correct') {
                answerDetails.innerHTML = `<p class="instruction-text">Kedjan kommer att bedömas som korrekt.</p>`;
            } else {
                answerDetails.innerHTML = `<p class="instruction-text">Denna funktion är inte fullt implementerad än.</p>`;
            }
        });
    });

    // ... (Spara-funktion och initiering)
    saveBtn.addEventListener('click', () => { /* ... */ });
    buildPalette();
    addGroupBtn.addEventListener('click', addGroupBlock);
    addGroupBlock();
});
