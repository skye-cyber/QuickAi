function normaliZeMathDisplay(selector, space=true) {
    let items = null
    if (selector) {
        const target = document.querySelector(selector)
        items = target.querySelectorAll('.katex-display')
    } else {
        items = document.querySelectorAll('.katex-display')
    }
    if (items) {
        items.forEach(item => {
            item.classList.remove('katex-display')
            item.classList.add('p-2', 'space-y-2')
        });
    }
    if (space){
        normalizeMathSpacing();
    }
}


function normalizeMathSpacing() {
    const items = document.querySelectorAll('.katex');
    if (items) {
        items.forEach(item => {
            const parItem = item.parentNode.parentNode.parentElement;
            parItem.classList.add('p-4');
        })
    }
}
