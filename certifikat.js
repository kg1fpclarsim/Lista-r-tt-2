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

        // Uppdatera namnet på certifikatet
        certificateName.textContent = name;

        // Använd html2pdf-biblioteket för att skapa PDF
        const options = {
            margin:       0,
            filename:     `certifikat_${name.replace(' ', '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        // Skapa och ladda ner PDF:en från certifikat-elementet
        html2pdf().set(options).from(certificateElement).save();
    });
});
