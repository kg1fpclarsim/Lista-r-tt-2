document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const certificateName = document.getElementById('cert-name');
    const certificateDate = document.getElementById('cert-date');
    const certificateElement = document.getElementById('certificate');

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

        // Steg 1: Uppdatera namnet på certifikatet på sidan
        certificateName.textContent = name;

        // Inaktivera knappen för att förhindra dubbelklick
        generatePdfBtn.disabled = true;
        generatePdfBtn.textContent = 'Genererar PDF...';

        // Steg 2: Vänta ett kort ögonblick för att säkerställa att sidan har ritats om
        setTimeout(() => {
            const options = {
                margin:       0,
                filename:     `certifikat_${name.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { 
                    scale: 2, 
                    useCORS: true,
                    // Försöker lösa problem med rendering genom att ge lite mer tid
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: certificateElement.scrollWidth,
                    windowHeight: certificateElement.scrollHeight
                },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };

            // Steg 3: Skapa och ladda ner PDF:en från certifikat-elementet
            html2pdf().set(options).from(certificateElement).save().then(() => {
                // Återaktivera knappen när PDF:en är klar
                generatePdfBtn.disabled = false;
                generatePdfBtn.textContent = 'Generera & Ladda Ner PDF';
            });

        }, 100); // En liten fördröjning på 100ms räcker oftast
    });
});
