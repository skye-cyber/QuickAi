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
    const attachFiles = document.getElementById("AttachFiles");

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
        //console.log(`Added ${_script} script`);
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
    //Set code these styleSheet
    window.electron.addCodeThemeSheet(currentTheme);

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
        window.electron.addCodeThemeSheet(newTheme);
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

    attachFiles.addEventListener("click", OpenFileModal);

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
        const previewContainer = document.getElementById('uploadedFiles');
        let Uploaded = 0
        //Create a list to hold file urls
        let fileUrls = []
        for (let i = 0; i < files.length; i++) {
           const file = files[i];

           // Determine if the file is an image or a document
           const isImage = file.type.startsWith('image/');
           const fileType = isImage ? 'image' : 'document';
           window.fileType = fileType;

           // Convert the file to a data URL if it's an image
           if (isImage) {
               Uploaded += 1;
              // Create a list item for the file
              console.log('File uploaded:', file.name, file.type, file.size);
              // Hide svgbefore displaying files
              document.getElementById('dropZoneSVG').classList.add('hidden')
              const previewItem = document.createElement('div');
                  previewItem.className = 'flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg';
                  previewItem.innerHTML = `
                      <div class="flex items-center overflow-auto scrollbar-hide">
                          <svg class="fill-current h-6 w-6 text-gray-500 mr-1" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h2v4a2 2 0 002 2h2a2 2 0 002-2v-4h2a2 2 0 002-2V4a2 2 0 00-2-2H9z"></path>
                          </svg>
                          <p class="flex text-gray-800 dark:text-stone-300 w-full text-ellipsis whitespace-nowrap">${file.name}</p>
                      </div>
                      <span class="p-1 border-l border-bg-stone-400 rounded-md bg-blue-400 dark:bg-stone-300 text-gray-700 dark:text-zinc-950">${((file.size / (1024 * 1024)).toFixed(2))} MB</span>
                  `;
              previewContainer.appendChild(previewItem);
              const reader = new FileReader();

              const AllfileTypes = "image";
              window.AllfileTypes = AllfileTypes
              reader.onload = (e) => {
                  const imageDataUrl = e.target.result;
                  fileUrls.push(imageDataUrl);
                  };
                  reader.readAsDataURL(file);
          } else {
              Notify(null, "Unsupported files were ignored!")
          }
         }
         // Store the image data URL in the global window object
         window.fileDataUrl = fileUrls;

         // Update the drop zone text if files are uploaded
         if (Uploaded > 0) {
             document.getElementById("dropZoneText").textContent = `${Uploaded} File(s) uploaded successfully`;
         }
     }

     function submitImageAndText() {
         const imageDataUrl = window.fileDataUrl;
         const fileType = window.AllfileTypes;
         const text = document.getElementById("imagePrompt").value;
         if (imageDataUrl && text) {
             // Dispatch an event with the image data URL and text
             const event = new CustomEvent('imageLoaded', { detail: { fileDataUrl: fileDataUrl, text: text, fileType:fileType } });
             document.dispatchEvent(event);
             document.getElementById('dropZoneSVG').classList.remove('hidden')
             CloseFileModal();
             document.getElementById('suggestions').classList.add('hidden');
         } else {
             if (!imageDataUrl){
                 Notify(null, "Please select a file!")
             }else if (!text){
                 Notify(null, "Please Enter a prompt relating to the upload")
             }
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

    // shortcut implementations
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
         } else if (event.ctrlKey && event.key === 'f' || event.ctrlKey && event.key === 'F') {
             event.preventDefault(); // Prevent any default action
             attachFiles.click();
         } else if (event.altKey && event.key === 'a' || event.altKey && event.key === 'A') {
             event.preventDefault(); // Prevent any default action
             document.getElementById('AutoScroll').click();
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


// ------Implement user preference handling ------
const prefContent= document.getElementById('pref-content');
const prefInput =document.getElementById('pref-input');
const prefPrevSection = document.getElementById('pref-section');
const prefEdit = document.getElementById('pref-edit');
const prefDelete = document.getElementById('pref-delete');
const prefSubmit = document.getElementById('pref-submit');
const prefInputSection = document.getElementById('pref-inputSection');

// Always hide input section when prefContent has value
if (prefContent.innerText){
    prefInputSection.classList.add('hidden');
} else if (!prefContent.innerText){
    prefPrevSection.classList.add('hidden');
}
//Add event listener for Pref submission
//-------------Button---------------
prefSubmit.addEventListener("click", () => {
    const inputText = prefInput.value.trim();
    if (inputText && inputText.length > 10) {
        prefInput.value = "";
        // Dispatch Save event
        window.electron.savePreference(inputText)
        prefInputSection.classList.add('hidden'); //hide input section
        prefContent.innerText = inputText; //Update preference content
        prefPrevSection.classList.remove('hidden');
    }
});

//-------------Enter key---------------
prefInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        const inputText = prefInput.value.trim();
        if (inputText && inputText.length > 10) {
            prefInput.value = "";
            // Dispatch Save event
            window.electron.savePreference(inputText)
            prefInputSection.classList.add('hidden'); //hide input section
            prefContent.innerText = inputText; //Update preference content
            prefPrevSection.classList.remove('hidden');
        }
    }
});

//Add event listener for edit
prefEdit.addEventListener('click', function() {
    prefInputSection.classList.remove('hidden'); //Show input section
    prefInput.value = prefContent.innerText;
    prefEdit.focus() //Focus text area for editing
    prefPrevSection.classList.add('hidden'); //Hide preference display block
})

//Add event listener for Delete
prefDelete.addEventListener('click', function() {
    prefEdit.focus() //Focus text area for editing
    DeletePref();
})

async function DeletePref(){
    if (await window.electron.deletePreference()){
        prefPrevSection.classList.add('hidden'); //Hide preference display block
        prefInputSection.classList.remove('hidden'); //Show input section
        prefInput.value = "";
    }else{
        const errorContainer = document.getElementById('errorContainer');
        const errorArea = document.getElementById('errorArea');
        errorArea.textContent = "Failed to delete preferences!"
        errorContainer.classList.remove('hidden');
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 3000)
    }
}
// Retrieve preferences
async function displayPref(){
    const pref = await window.electron.getPreferences()

    if (pref){
        prefContent.innerText = pref;
        prefPrevSection.classList.remove('hidden'); //Hide preference display block
        prefInputSection.classList.add('hidden'); //Show input section
    }
}

//Ensure that the imag prompt is initially empty
document.getElementById('imagePrompt').value = "";
//Load preferences
displayPref();
//Notify();
});

// Function to show the modal
function Notify(_color=null, time=null, text="") {
    const modal = document.getElementById('quickaiNotify');
    const message = document.getElementById('messageContent');
    const timeTaken = document.getElementById('timeTaken');
    if (text){
        message.innerText = text;
    } else if(time){
        timeTaken.innerText = time;
    }
    // Slide modal to 20% height and make it visible after 1 second
    setTimeout(() => {
        modal.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
    }, 200); // 1 second delay

    // Slide modal to the left and fade out after 5 seconds
    setTimeout(() => {
        modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
        modal.classList.add('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');

    }, 5000); // 4 seconds for staying in the middle

    // Reset transform after fully fading out and moving off-screen
    setTimeout(() => {
        modal.classList.remove('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');
        modal.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
    }, 1000); // 0.5s for fade out
}


//Store Notify to window
window.Notify = Notify;
//Handle custom model selection
document.addEventListener('DOMContentLoaded', function() {
    const modeButton = document.getElementById('modeButton');
    const modeDropdown = document.getElementById('modeDropdown');
    const modeItems = document.querySelectorAll('[data-value]');
    const selectedModeText = document.getElementById('selectedModeText');
    const modeSelect = document.getElementById('mode');

    // Function to toggle dropdown visibility
    function toggleDropdown() {
        modeDropdown.classList.toggle('hidden');
    }

    // Function to select a mode
    function selectMode(value) {
        modeItems.forEach(item => {
            const isSelected = item.getAttribute('data-value') === value;
            item.classList.toggle('dark:bg-stone-900', isSelected);
            item.classList.toggle('bg-green-200', isSelected);
        });

        selectedModeText.innerText = modeSelect.options[modeSelect.selectedIndex].innerText;
        modeDropdown.classList.add('hidden');
    }

    // Event listener for button click to toggle dropdown
    modeButton.addEventListener('click', toggleDropdown);

    // Event listener for clicking outside the dropdown to close it
    document.addEventListener('click', function(event) {
        if (!modeButton.contains(event.target) && !modeDropdown.contains(event.target)) {
            modeDropdown.classList.add('hidden');
        }
    });

    // Event listener for selecting a mode
    modeItems.forEach(item => {
        item.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            modeSelect.value = value;
            selectMode(value);
        });
    });

    // Initial selection based on the select element's default value
    selectMode(modeSelect.value);
});

// Function to toggle the fold/unfold of the think section
function toggleFold(event, selector) {
    console.log(selector)
    const content = document.getElementById(selector);
    console.log(content)
    if (content) {
        content.classList.toggle('hidden');
    }
}
// Make toggleFold available to the window
window.toggleFold = toggleFold;
