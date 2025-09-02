document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const certificateName = document.getElementById('cert-name');
    const certificateDate = document.getElementById('cert-date');
    const certificateElement = document.getElementById('certificate');
    const formCard = document.getElementById('form-card');

    // Sätt dagens datum direkt
    const today = new Date();
    const formattedDate = today.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    certificateDate.textContent = formattedDate;

    // Lyssna på generera-knappen
    generatePdfBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name === '') {
            alert('Vänligen fyll i ditt namn.');
            return;
        }

        // Uppdatera namnet på certifikatet på sidan
        certificateName.textContent = name;

        // Dölj formuläret och gör certifikatet redo för "fotografering"
        formCard.style.display = 'none';

        // Använd en mikropaus för att säkerställa att sidan har ritats om
        setTimeout(() => {
            const options = {
                margin:       [0, 0, 0, 0], // Inga marginaler, då vi har det i CSS
                filename:     `certifikat_${name.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };

            // Skapa och ladda ner PDF:en
            html2pdf().set(options).from(certificateElement).save().then(() => {
                // Visa formuläret igen när PDF:en är klar
                formCard.style.display = 'block';
            });

        }, 100);
    });
});
