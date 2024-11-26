document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('settings').addEventListener('click', () => {
        modal = document.getElementById("settingsModal");
        modal.classList.remove('hidden');
    });

    const themeSwitch = document.getElementById("themeSwitch");
    const rootElement = document.documentElement;

    //Hide settings modal on save click
    document.getElementById('saveSettings').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    //Hide settings modal on closeModal click
    document.getElementById("closeModal").addEventListener('click', () =>{
        modal.classList.add('hidden');
    });

    // Initialize theme based on user's previous preference or system preference
    const userTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = userTheme || systemTheme;

    // Set the initial theme
    setTheme(currentTheme);

    // Add click event listener to the theme switch button
    themeSwitch.addEventListener("click", () => {
            const newTheme = rootElement.classList.contains("dark") ? "light" : "dark";
            setTheme(newTheme);
    });

    // Function to set the theme
    function setTheme(theme) {
        if (theme === "dark") {
            rootElement.classList.add("dark");
            themeSwitch.checked = true;
        } else {
            rootElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }
});

