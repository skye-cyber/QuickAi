const settingsmodal = document.getElementById("settingsModal");
// shortcut implementations
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'S' || event.ctrlKey && event.key === 's') {
        event.preventDefault(); // Prevent the default Save action in browsers
        settingsmodal.classList.toggle('hidden');
    } else if (event.key === 'Escape') {
        event.preventDefault();
        settingsmodal.classList.add('hidden');
    } else if (event.ctrlKey && event.key === 'P' || event.ctrlKey && event.key === 'p') {
        event.preventDefault(); // Prevent any default action
        document.getElementById("togglePane").click()
    } else if (event.ctrlKey && event.key === 'N' || event.ctrlKey && event.key === 'n') {
        NewConversation(event);
    } else if (event.ctrlKey && event.key === 'f' || event.ctrlKey && event.key === 'F') {
        event.preventDefault(); // Prevent any default action
        attachFiles.click();
    } else if (event.altKey && event.key === 'a' || event.altKey && event.key === 'A') {
        event.preventDefault(); // Prevent any default action
        document.getElementById('AutoScroll').click();
    }
});
