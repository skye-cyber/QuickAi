// style hljs
const hljsElements = document.querySelectorAll('.hljs');
hljsElements.forEach(element=>{
    //element.style.background = '';
    //element.classList.add('rounded-md', 'font-mono', 'bg-blue-400')
})


// Set default model to codestral-latest
const defaultModel = document.querySelector('[data-value="mistral-large-latest"]');

if (defaultModel) {  // Check if element exists
    setTimeout(()=>{
        defaultModel.click();  // Added parentheses for method call
    }, 40);
} else {
    console.error('Element with data-value="codestral-latest" not found!');
}
