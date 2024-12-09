document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("settingsModal");
    const themeSwitch = document.getElementById("themeSwitch");
    const rootElement = document.documentElement;
    const scrollButton = document.getElementById("scroll-bottom");
    const chatArea = document.getElementById("chatArea");
    const inputArea = document.getElementById("userInput");
    const moreButton = document.getElementById("more");
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const dropZoneText = document.getElementById('dropZoneText');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');

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

    // Function to update scroll button visibility
    function updateScrollButtonVisibility() {
        const isScrollable = chatArea.scrollHeight > chatArea.clientHeight;
        const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight;

        scrollButton.classList.toggle('hidden', !(isScrollable && !isAtBottom));
    }

    // Attach scroll event listener to chatArea
    chatArea.addEventListener("scroll", updateScrollButtonVisibility);
    window.addEventListener("resize", updateScrollButtonVisibility);

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

    document.getElementById("AttachFiles").addEventListener("click", OpenFileModal);

    const FileModalClose = document.getElementById("closeFileEModal");
    FileModalClose.addEventListener("click", (e) => {
        e.stopPropagation();
        CloseFileModal();
    });

    function OpenFileModal(){
        dropZone.classList.remove('hidden')
    }

    function CloseFileModal(){
        dropZone.classList.add('hidden')
    }

     // Handle file selection
     fileInput.addEventListener('change', handleFileSelect);

     // Handle drag and drop
     dropZone.addEventListener('dragover', handleDragOver, false);
     dropZone.addEventListener('drop', handleFileDrop, false);

     // Handle click on drop zone to trigger file input
     dropZone.addEventListener('click', function(event) {
         // Prevent the default click behavior
         event.stopPropagation();
         event.preventDefault();
        fileInput.click();
     });

     function handleFileSelect(event) {
         const files = event.target.files;
         handleFiles(files);
     }

     function handleDragOver(event) {
         event.stopPropagation();
         event.preventDefault();
         event.dataTransfer.dropEffect = 'copy';
     }

     function handleFileDrop(event) {
         event.stopPropagation();
         event.preventDefault();
         const files = event.dataTransfer.files;
        handleFiles(files);
     }

     function handleFiles(files) {
         console.log("Handling files")

         for (let i = 0; i < files.length; i++) {
             const file = files[i];
             console.log('File uploaded:', file.name, file.type, file.size);

             // Create a list item for the file
             const fileElement = document.createElement('div');
             fileElement.classList.add('flex', 'items-center', 'mb-2', 'text-gray-700');
             fileElement.innerHTML = `
             <span class="mr-2">${file.name}</span>
             <span class="text-sm text-gray-500">(${file.size} bytes)</span>
             `;
             uploadedFilesContainer.appendChild(fileElement);
         }

         // Update the drop zone text if files are uploaded
         if (files.length > 0) {
             dropZoneText.textContent = 'Files uploaded successfully';
         }
     }

     /* Fix The heading verriding by <p> tag wrap
     // Find all p elements in the document
     const paragraphs = document.querySelectorAll('p');

     paragraphs.forEach(p => {
         // Check if the p element contains a heading (h1 to h6)
         const heading = p.querySelector('h1, h2, h3, h4, h5, h6');
         if (heading) {
             // Move the heading out of the p element
             p.parentNode.insertBefore(heading, p);

             // Remove the p element if it is now empty
             if (p.innerHTML.trim() === '') {
                 p.remove();
             }
         }
     });*/
});
