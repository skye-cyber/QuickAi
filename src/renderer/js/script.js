document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("settingsModal");
    const themeSwitch = document.getElementById("themeSwitch");
    const rootElement = document.documentElement;
    const scrollButton = document.getElementById("scroll-bottom");
    const chatArea = document.getElementById("chatArea");
    const inputArea = document.getElementById("userInput");
    const moreButton = document.getElementById("more");

    // Query map for button actions
    const queryMap = {
        "get-advice": "Give me advice on financial literacy",
        "summarize": "Summarize the book Rich Dad Poor Dad in one page",
        "create-image": "/image Create an image of an eagle diving at supersonic speed to catch its prey",
        "suprise": "Surprise me with a story about yourself",
        "code": "Help me learn Python",
        "analyze-images": "Analyze the following images/translate the text in these images",
        "help-me-write": "Help me write a cover letter .."
    };

    // Function to hide the modal
    function hideModal() {
        modal.classList.add('hidden');
    }

    // Show settings modal when settings button is clicked
    document.getElementById('settings').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // Event listeners for hiding the modal
    document.getElementById('saveSettings').addEventListener('click', hideModal);
    document.getElementById("closeModal").addEventListener('click', hideModal);

    // Initialize theme based on user's previous preference or system preference
    const userTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = userTheme || systemTheme;

    // Set the initial theme
    setTheme(currentTheme);

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

    // Toggle theme on switch click
    themeSwitch.addEventListener("click", () => {
        const newTheme = rootElement.classList.contains("dark") ? "light" : "dark";
        setTheme(newTheme);
    });

    // Function to check if the content is scrollable or not at the bottom
    function updateScrollButtonVisibility() {
        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        scrollButton.classList.toggle('hidden', !(isScrollable && !isAtBottom));
    }

    // Attach scroll event listener to chatArea
    chatArea.addEventListener("scroll", updateScrollButtonVisibility);

    // Initial check when content is loaded or dynamically updated
    updateScrollButtonVisibility();

    // Scroll to the bottom when the button is clicked
    scrollButton.addEventListener("click", () => {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth",
        });
    });

    // Show hidden elements when "more" is clicked
    moreButton.addEventListener('click', () => {
        document.querySelectorAll(".extra").forEach(item => item.classList.remove('hidden'));
        moreButton.classList.add('hidden');
    });

    // Add event listeners to buttons using delegation
    document.getElementById('SQ-UL').addEventListener('click', (event) => {

        const target = event.target.closest('.SG'); // Find closest button clicked
        console.log(target)
        if (target) { // If a button was clicked
            const queryKey = target.id; // Get the ID of the button
            if (queryMap[queryKey]) {
                inputArea.value = queryMap[queryKey]; // Set input area value based on queryMap
                inputArea.focus(); // Focus on input area
            } else {
                console.warn(`No query found for key: ${queryKey}`);
            }
        }
    });
});
