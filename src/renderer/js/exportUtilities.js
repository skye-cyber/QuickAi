//window.global = window; // This makes 'global' refer to 'window'
import htmlToDocx from 'html-to-docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
//import htmlDocx from 'html-docx-js';
//import { toPng, toJpeg, toBlob, toCanvas, toPixelData, toSvg, getFontEmbedCSS } from 'html-to-image';

function HTML2Word(event, selector) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const par = getParents(event);
    toggleExportOptions(par, true, true); // Hide export options
    const element = document.querySelector(selector);
    if (element) {
        console.log('Exporting to Word...');

        // Convert HTML to DOCX
        htmlToDocx(element.outerHTML)
        .then((docx) => {
            // Save the DOCX file
            saveAs(docx, 'output.docx');
        })
        .catch((err) => {
            console.error('Error creating Word document:', err);
        });
    } else {
        console.error('Element not found for the given selector:', selector);
    }
}

/*function SuperHTML2Word(event, selector) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const par = getParents(event);
    toggleExportOptions(par, true, true); // Hide export options
    const element = document.querySelector(selector);
    if (element) {
        console.log('Exporting to Word...');

        // Convert HTML to DOCX
        htmlDocx.asBlob(element.outerHTML, { orientation: 'portrait' })
        .then((docx) => {
            // Save the DOCX file
            saveAs(docx, 'output-Super.docx');
        })
        .catch((err) => {
            console.error('Error creating Word document:', err);
        });

    } else {
        console.error('Element not found for the given selector:', selector);
    }
}*/

function HTML2Pdf(event, selector) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const par = getParents(event);
    toggleExportOptions(par, true, true); // Hide export options
    const element = document.querySelector(selector);
    if (element) {
        console.log('Exporting to PDF...');

        html2canvas(element).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);

            // Provide default margin values
            const defaultMargin = 0; // Default margin in mm
            const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * defaultMargin;
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            const pageHeight = pdf.internal.pageSize.getHeight() - 2 * defaultMargin;

            // Calculate the total number of pages needed
            const totalPages = Math.ceil(imgHeight / pageHeight);

            for (let i = 0; i < totalPages; i++) {
                // Add a new page if it's not the first one
                if (i > 0) {
                    pdf.addPage();
                }

                // Calculate the y position for the current page
                const posY = -i * pageHeight;

                // Add image with margins
                pdf.addImage(imgData, 'JPEG', defaultMargin, posY, pdfWidth, imgHeight);
            }

            pdf.save('output.pdf');
        }).catch((err) => {
            console.error('Error creating PDF:', err);
        });
    } else {
        console.error('Element not found for the given selector:', selector);
    }
}

function HTML2Jpg(event, selector) {
    event.preventDefault(); // Prevent the default action of the anchor tag
    const par = getParents(event);
    toggleExportOptions(par, true, true); // Hide export options
    const element = document.querySelector(selector);

    if (element) {
        console.log('Exporting to JPG...');

        // Calculate the dimensions based on the element's size
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        toJpeg(element, { width, height })
        .then((dataUrl) => {
            const downloadsPath = window.electron.getDownloadsPath();
            window.electron.saveAndOpenImage(downloadsPath, dataUrl);
        })
        .catch((error) => {
            console.error('Error creating image:', error);
        });
    } else {
        console.error('Element not found for the given selector:', selector);
    }
}

// Export the functions for use in the HTML file
window.HTML2Word = HTML2Word;
//window.SuperHTML2Word = SuperHTML2Word;
window.HTML2Pdf = HTML2Pdf;
window.HTML2Jpg = HTML2Jpg;

function getParents(event, levels = 3) {
    let current = event.target;
    for (let i = 1; i <= levels; i++) {
        if (current.parentNode) {
            current = current.parentNode;
            //console.log(`Level ${i} Parent:`, current);
        } else {
            //console.log(`No more parents at level ${i}`);
            break;
        }
    }
    return current;
}


function toggleExportOptions(button, _current = false, pass = false,) {
    const menu = button.parentNode.nextElementSibling;
    const handleClickOutside = (event) => {
        if (menu && !menu.contains(event.target)) {
            menu.classList.toggle('hidden');
            removeMenuClickListener();
        }
    };

    const removeMenuClickListener = () => {
        menu.removeEventListener('click', handleClickOutside);
        document.removeEventListener('click', handleClickOutside);
    };

    if (_current === true) {// Toggle provided element
        button.classList.toggle('hidden');
    } else {// toggle next sibling for provided element parentNode
        const exportOptions = button.parentNode.nextElementSibling;
        if (exportOptions) {
            exportOptions.classList.toggle('hidden');
        }
        if (pass===false){
            //addMenuClickListener();
        }
    }
}


window.toggleExportOptions = toggleExportOptions;

