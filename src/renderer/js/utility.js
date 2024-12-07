import htmlToDocx from 'html-to-docx';
import htmlToPdf from 'html-to-pdf';
import htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';

const htmlContent = `
<h1>Heading 1</h1>
<p>This is a paragraph.</p>
`;

function HTML2Word() {
    const input = document.getElementById('content');
    const docx = htmlToDocx(input, { filename: 'output.docx' });
    saveAs(docx, 'output.docx');
}

function HTML2Pdf() {
    const input = document.getElementById('content');
    const options = {
        filename: 'output.pdf',
        jsPDF: { format: 'a4' }
    };
    htmlToPdf(input, options).then((pdf) => {
        saveAs(pdf, 'output.pdf');
    }).catch((err) => {
        console.error('Error creating PDF:', err);
    });
}

function HTML2Png() {
    htmlToImage.toPng(document.getElementById('content'), { width: 800, height: 600 })
    .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'output.png';
        link.href = dataUrl;
        link.click();
    })
    .catch((error) => {
        console.error('Error creating image:', error);
    });
}

// Export the functions for use in the HTML file
window.HTML2Word = HTML2Word;
window.HTML2Pdf = HTML2Pdf;
window.HTML2Png = HTML2Png;
