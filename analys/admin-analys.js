document.addEventListener('DOMContentLoaded', () => {
    // ... (alla referenser och globala variabler är oförändrade) ...
    const answerEditor = document.getElementById('answer-editor');
    const answerDetails = document.getElementById('answer-details');

    // ... (buildPalette, addGroupBlock, addEventToActiveGroup är oförändrade) ...
    
    // NYTT: Logik för att hantera val i Facit-sektionen
    answerEditor.querySelectorAll('input[name="answerType"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const answerType = radio.value;
            // Återställ eventuella tidigare redigeringslägen
            canvasContainer.querySelectorAll('.canvas-block-wrapper').forEach(el => el.classList.remove('selectable-to-edit', 'selected-as-answer'));
            
            // Visa rätt instruktionstext
            switch (answerType) {
                case 'remove':
                    answerDetails.innerHTML = `<p class="instruction-text">Redigeringsläge aktivt: Klicka på det händelseblock i arbetsytan som ska tas bort.</p>`;
                    break;
                case 'add':
                    answerDetails.innerHTML = `<p class="instruction-text">Redigeringsläge aktivt: Klicka på ett '+' i arbetsytan där händelsen saknas.</p>`;
                    break;
                case 'correct_office':
                    answerDetails.innerHTML = `<p class="instruction-text">Redigeringsläge aktivt: Klicka på det händelseblock i arbetsytan vars kontor är felaktigt.</p>`;
                    break;
                case 'correct':
                default:
                    answerDetails.innerHTML = `<p class="instruction-text">Kedjan kommer att bedömas som korrekt.</p>`;
                    break;
            }
        });
    });

    // ... (resten av filen: saveBtn listener, etc.) ...
});
