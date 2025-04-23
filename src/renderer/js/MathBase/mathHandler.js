import 'katex/dist/katex.min.css';
//import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';

// Make renderMathInElement globally available if needed
window.renderMathInElement = renderMathInElement;

// Function to ensure Katex renders dynamically injected content
//let renderTimeout;

function debounceRenderKaTeX(containerSelector, delay = 1000, noDelay = false) {
    //if (renderTimeout) clearTimeout(renderTimeout);

    const render = () => {
        const elements = document.querySelector(containerSelector)

        console.log('Container', containerSelector||'body')
        console.log('Rendering:', elements)
        if (window.renderMathInElement) {
            window.renderMathInElement(containerSelector? elements:document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                ],
                throwOnError: false,
            });
            console.log('KaTeX rendering complete');
        } else {
            console.error('KaTeX auto-render extension not loaded.');
        }
    };

    if (noDelay) {
        render();
    } else {
        setTimeout(render, delay);
    }
}

window.debounceRenderKaTeX = debounceRenderKaTeX
