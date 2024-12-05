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

    const scrollButton = document.getElementById("scroll-bottom");
    const chatArea = document.getElementById("chatArea");

    // Function to check if the content is scrollable or not at the bottom
    function updateScrollButtonVisibility() {
        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        if (isScrollable && !isAtBottom) {
            scrollButton.classList.remove('hidden'); // Show button
        } else {
            scrollButton.classList.add('hidden'); // Hide button
        }
    }

    // Attach a scroll event listener to the chatArea to track the scroll position
    chatArea.addEventListener("scroll", updateScrollButtonVisibility);
    // Attach a scroll event listener to the chatArea to track the window size
    chatArea.addEventListener("resize", updateScrollButtonVisibility);

    // Initial check when the content is loaded or dynamically updated
    updateScrollButtonVisibility();

    // Scroll to the bottom when the button is clicked
    scrollButton.addEventListener("click", () => {
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth",
        });
    });

    const inputArea = document.getElementById("userInput")
    const advice = document.getElementById("get-advice");
    const summarize = document.getElementById("summarize");
    const createImage = document.getElementById("create-image");
    const suprise = document.getElementById("suprise");
    const more = document.getElementById("more");
    const code = document.getElementById("code");
    const analyzeImages = document.getElementById("analyze-images");
    const helpWrite = document.getElementById("help-me-write");

    const queryMap = {
        "get-advice": "Give me advice on financial literacy",
        "summarize": "Summarize the book Rich Dad Poor Dad in one page",
        "create-image": "/image Create an image of an eagle diving a supersonic speed to catch its prey",
        "suprise": "Analyze the following data...",
        "code": "Help me learn python",
        "analyze-images": "Analyze the following images/translate the text in these images",
        "help-me-write": "Help me write a cover letter .."
    }

    const buttons = [
        advice,
        summarize,
        createImage,
        suprise,
        code,
        analyzeImages,
        helpWrite
    ]

    // Show hidden elements when "more" is clicked
    more.addEventListener('click', () => {
        // Correct the selector for elements with the "extra" class
        const extras = document.querySelectorAll(".extra");
        extras.forEach(item => {
            item.classList.remove('hidden');
        });

        // Hide the "more" button
        more.classList.add('hidden');
    });

    // Add event listeners to buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Use the button's id as the key to access the value in the queryMap
            const queryKey = button.id;  // Use id or name or any other attribute of the button
            if (queryMap[queryKey]) {
                inputArea.value = queryMap[queryKey];
                inputArea.focus();
            } else {
                console.warn(`No query found for key: ${queryKey}`);
            }
        });
    });


});

