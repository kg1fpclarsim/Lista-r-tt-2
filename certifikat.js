document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const certificateName = document.getElementById('cert-name');
    const certificateDate = document.getElementById('cert-date');
    const certificateElement = document.getElementById('certificate');
    const formCard = document.getElementById('form-card');
    const wrapper = document.getElementById('certificate-wrapper');

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

        // Steg 1: Uppdatera namnet på certifikatet
        certificateName.textContent = name;

        // Steg 2: Förbered för PDF-generering
        formCard.style.display = 'none'; // Göm formuläret
        wrapper.style.border = 'none'; // Göm den yttre ramen
        certificateElement.classList.add('render-for-pdf'); // Byt till A4-läge

        // Steg 3: Vänta ett ögonblick så CSS hinner appliceras
        setTimeout(() => {
            const options = {
                margin:       0,
                filename:     `certifikat_${name.replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 3, useCORS: true }, // Ökad skala för bättre kvalitet
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
            };

            // Steg 4: Skapa och ladda ner PDF:en
            html2pdf().set(options).from(certificateElement).save().finally(() => {
                // Steg 5: Återställ allt när PDF är klar
                formCard.style.display = 'block';
                wrapper.style.border = '1px solid #ccc';
                certificateElement.classList.remove('render-for-pdf');
            });

        }, 100);
    });
});
