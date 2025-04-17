async function loadDiagramView(filePath="../../visualizer.html") {
    console.log('Loading', filePath)
    try {
        const res = await fetch(filePath);
        const html = await res.text();
        document.getElementById('modal-content').innerHTML = html;
        console.log('Load succeeded!')
    } catch (err) {
        console.log('Error loadin giagView', err)
    }
}

function opendiagViewModal(){
    const diagView = document.getElementById('diagViewModal');
}

function closediagViewModal() {
    console.log('Close DiagView')
    const diagView = document.getElementById('diagViewModal');
}
