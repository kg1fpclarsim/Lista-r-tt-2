document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    
    // Vi behöver inte längre referenser till certifikatets HTML-element
    // eftersom vi bygger PDF:en från grunden.

    generatePdfBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name === '') {
            alert('Vänligen fyll i ditt namn.');
            return;
        }

        // Hämta dagens datum
        const today = new Date();
        const formattedDate = today.toLocaleDateString('sv-SE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Inaktivera knappen medan PDF skapas
        generatePdfBtn.disabled = true;
        generatePdfBtn.textContent = 'Genererar PDF...';

        // Använd en liten timeout för att låta webbläsaren uppdatera knappens text
        setTimeout(() => {
            // Skapa ett nytt jsPDF-dokument i liggande A4-format
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;

            // ---- Här "ritar" vi certifikatet ----

            // 1. Rita en tjock yttre ram
            doc.setLineWidth(1.5);
            doc.setDrawColor('#00407d'); // Mörkblå färg
            doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);
            
            // 2. Rita en tunn inre ram
            doc.setLineWidth(0.5);
            doc.rect(margin / 2 + 2, margin / 2 + 2, pageWidth - margin - 4, pageHeight - margin - 4);

            // 3. Lägg till huvudrubriker
            doc.setFont('times', 'normal');
            doc.setFontSize(50);
            doc.setTextColor('#00407d');
            doc.text('Certifikat', pageWidth / 2, 60, { align: 'center' });

            doc.setFontSize(20);
            doc.setTextColor('#333333');
            doc.text('Intyg om Genomförd Utbildning', pageWidth / 2, 75, { align: 'center' });

            // 4. Lägg till brödtext och namn
            doc.setFontSize(16);
            doc.text('Detta certifikat intygar att', pageWidth / 2, 105, { align: 'center' });

            doc.setFont('times', 'bolditalic');
            doc.setFontSize(30);
            doc.setTextColor('#000000');
            doc.text(name, pageWidth / 2, 125, { align: 'center' });

            doc.setFont('times', 'normal');
            doc.setFontSize(16);
            doc.setTextColor('#333333');
            doc.text('framgångsrikt har genomfört den interaktiva utbildningen för användning av handdator.', pageWidth / 2, 145, { align: 'center' });

            // 5. Lägg till datum och företagsnamn i sidfoten
            doc.setFontSize(14);
            const footerY = pageHeight - 35;
            doc.text(`Datum: ${formattedDate}`, pageWidth / 2, footerY, { align: 'center' });
            
            doc.setFont('times', 'bold');
            doc.text('Börjeskoncernen', pageWidth / 2, footerY + 10, { align: 'center' });

            // -----------------------------------------

            // Spara PDF-filen
            doc.save(`certifikat_${name.replace(/\s+/g, '_')}.pdf`);

            // Återaktivera knappen
            generatePdfBtn.disabled = false;
            generatePdfBtn.textContent = 'Generera & Ladda Ner PDF';

        }, 100);
    });
});
