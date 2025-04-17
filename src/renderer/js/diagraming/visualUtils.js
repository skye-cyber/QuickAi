const diagView = document.getElementById('diagViewModal');
const diagToggle= document.getElementById('diagToggle');

function opendiagViewModal(){
    console.log('Open DiagView')
    diagView.classList.remove('opacity-0', 'translate-x-full');
    diagView.classList.add('opacity-100', 'translate-x-0')
}

function closediagViewModal() {
    console.log('Close DiagView')
    diagView.classList.remove('opacity-100', 'translate-x-0')
    diagView.classList.add('translate-x-full');
    setTimeout(()=>{
        diagView.classList.add('opacity-0');
    },1000)
}

diagToggle.addEventListener('click', ()=>{
    opendiagViewModal();
})
//opendiagViewModal();
window.opendiagViewModal=opendiagViewModal;
window.closediagViewModal = closediagViewModal;
