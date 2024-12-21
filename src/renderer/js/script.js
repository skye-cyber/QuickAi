document.addEventListener('DOMContentLoaded', function() {
    //for (const item of ['_chatStore']) {
        addScripts('_chatStore');
    //}
    const modal = document.getElementById("settingsModal");
    const themeSwitch = document.getElementById("themeSwitch");
    const rootElement = document.documentElement;
    const scrollButton = document.getElementById("scroll-bottom");
    const chatArea = document.getElementById("chatArea");
    const inputArea = document.getElementById("userInput");
    const moreButton = document.getElementById("more");
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const dropZoneModal = document.getElementById('dropZoneModal');
    const dropZoneText = document.getElementById('dropZoneText');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    const userInput = document.getElementById("userInput");
    const mode = document.getElementById('mode');
    let preValue = mode.value;
    const modelChange = new CustomEvent('ModelChange');

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

    function addScripts(_script) {
        const script = document.createElement('script');
        script.src = `src/renderer/js/${_script}.js`;
        script.async = true; // Optional: load the script asynchronously
        document.body.appendChild(script);
        console.log(`Added ${_script} script`);
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
        //console.log("Scrollable")
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
        dropZoneModal.classList.remove('hidden')
    }

    function CloseFileModal() {
        dropZoneModal.classList.add('hidden');
        // Clear file input and prompt
        fileInput.value = "";
        document.getElementById("imagePrompt").value = "";
        uploadedFilesContainer.innerHTML = "";
        dropZoneText.textContent = "Drag and drop files here or click to select";
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
         if (event.target.id === "dropZone") {
            fileInput.click();
         }
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
         console.log("Handling files");

         for (let i = 0; i < files.length; i++) {
             const file = files[i];
             console.log('File uploaded:', file.name, file.type, file.size);

             // Determine if the file is an image or a document
             const isImage = file.type.startsWith('image/');
             const fileType = isImage ? 'image' : 'document';
             window.fileType = fileType;
             // Create a list item for the file
             const fileElement = document.createElement('div');
             fileElement.classList.add('flex', 'items-center', 'mb-2', 'text-gray-700');
             fileElement.innerHTML = `
             <span class="mr-2">${file.name}</span>
             <span class="text-sm text-gray-500">(${(file.size / 1024).toFixed(2)} kb) - ${fileType}</span>
             `;
             document.getElementById("uploadedFiles").appendChild(fileElement);

             // Convert the file to a data URL if it's an image
             if (isImage) {
               const reader = new FileReader();
               reader.onload = (e) => {
                   const imageDataUrl = e.target.result;
                    // Store the image data URL in the global window object
                    window.fileDataUrl = imageDataUrl;
                };
                reader.readAsDataURL(file);
            } else {
                alert("Sorry, Cannot process this file type quiet yet")
            }
         }

         // Update the drop zone text if files are uploaded
         if (files.length > 0) {
             document.getElementById("dropZoneText").textContent = 'Files uploaded successfully';
         }
     }

     function submitImageAndText() {
         const imageDataUrl = window.fileDataUrl;
         const fileType = window.fileType;
         const text = document.getElementById("imagePrompt").value;
         if (imageDataUrl && text) {
             // Dispatch an event with the image data URL and text
             const event = new CustomEvent('imageLoaded', { detail: { fileDataUrl: fileDataUrl, text: text, fileType:fileType } });
             document.dispatchEvent(event);
             CloseFileModal();
             document.getElementById('suggestions').classList.add('hidden');
         } else {
             alert("Please upload an image and enter a prompt.");
         }
     }

     function scrollToBottom(element) {
         // Use setTimeout to ensure the scroll happens after the DOM has updated
         setTimeout(() => {
             element.scrollTop = element.scrollHeight;
         }, 0);
     }

     // Ensure the textarea is empty initially
     userInput.value = userInput.value.trim();
     // Trigger input event to adjust height
     userInput.dispatchEvent(new Event('input'));

     document.addEventListener('keydown', (event) => {
         if (event.ctrlKey && event.key === 'S' || event.ctrlKey && event.key === 's') {
             event.preventDefault(); // Prevent the default Save action in browsers
             modal.classList.toggle('hidden');
         } else if (event.key === 'Escape') {
             event.preventDefault();
            modal.classList.add('hidden');
         } else if (event.ctrlKey && event.key === 'P' || event.ctrlKey && event.key === 'p') {
             event.preventDefault(); // Prevent any default action
             document.getElementById("togglePane").click()
         } else if (event.ctrlKey && event.key === 'N' || event.ctrlKey && event.key === 'n') {
            NewConversation(event);
         }
     });

     // handle new conversation logic
     function NewConversation(event){
        event.stopPropagation();
        event.preventDefault(); // Prevent any default action
        const ConversationEvent = new CustomEvent('NewConversationOpened');
        ClearChatArea()
        document.dispatchEvent(ConversationEvent)
     }

    // Handle new conversation button click
    document.getElementById('new-chat').addEventListener('click', function (event) {
        NewConversation(event);
    })

     window.scrollToBottom = scrollToBottom;
     window.submitImageAndText = submitImageAndText;
     window.CloseFileModal = CloseFileModal;

     // Set up the event listener
     window.electron.receive('fromMain', (data) => {
         //console.log(data)
         if (data.message === "set-Utitility-Script"){
            console.log('Message received:', data.message);
            try {
                window.electron.addUtilityScript();
                console.log("Utility script added successfully");
            } catch (err) {
                console.error("Error adding utility script:", err);
            }
         }
     });


     function ClearChatArea(){
         Array.from(chatArea.children).forEach((child) => {
             if (child.id !== 'suggestions') {
                 child.remove();
             }
             //console.log('opened new conversation')
             document.getElementById('suggestions') ? document.getElementById('suggestions').classList.remove('hidden') : "";
        });
     }


     mode.addEventListener('change', function() {
         const arr = [preValue, mode.value];
         const validPairs = [['Basic mode', 'Coding mode'], ['Coding mode', 'Basic mode']];

         // Check if arr is one of the valid pairs
         const isValid = validPairs.some(pair =>
         arr[0] === pair[0] && arr[1] === pair[1]
         );

         if (!isValid) {
             console.log(preValue, mode.value);
             document.dispatchEvent(modelChange);
             ClearChatArea();
         }
         SetTitle(mode.value);
         //currentValue = mode.value;
     });

    function SetTitle(value){
        if (value.toLowerCase() == "vision"){
            document.title = "QuickAi - Vision"
        }
        else if (value.toLowerCase() == "coding mode"){
            document.title = "QuickAi - Coder"
        }
    }

});
