const storagePath = window.electron.joinPath(window.electron.home_dir(), '.quickai.store');
const chatArea = document.getElementById('chatArea');
const conversationsPanel = document.getElementById('conversations');
escapeHTML = window.escapeHTML;
const modal = document.getElementById('renameModal');
const modalTitle = document.getElementById('modalTitle');
const newNameInput = document.getElementById('newName');
const renameButton = document.getElementById('renameButton');
const cancelButton = document.getElementById('cancelButton');
let activeItem;

async function checkAndCreateDirectory() {
    if (storagePath) {
        try {
            // Check if the directory exists
            const exists = await window.electron.mkdir(storagePath);
            if (!exists) {
                console.log("Error creating directory", storagePath)
            } else {
                //console.log('Directory exists');
            }
        } catch (error) {
            console.error('Error checking or creating directory:', error);
        }
    }
}


class ConversationManager {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  // Save conversation to a JSON file
  async saveConversation(conversationData, conversationId) {
    const filePath = `${this.storagePath}/${conversationId}.json`;
    //console.log(JSON.stringify(conversationData))
    try {
      //console.log("Saving: " + conversationId + filePath)
      await window.electron.write(filePath, conversationData);
    } catch (err) {
      console.error('Error saving conversation:', err);
    }
  }

  // Load conversation from a JSON file
  async loadConversation(conversationId) {
    const filePath = `${this.storagePath}/${conversationId}.json`;
    try {
      if (window.electron.stat(filePath)) {
        const model = conversationId.startsWith('V') ? "Vision" : "text";
        const data = await window.electron.read(filePath, model);
        return [data, model]
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
    return null;
  }

  // Add a message to the conversation history
  addMessage(role, content, type = "text", fileDataUrl = null, fileType = null) {
    let messageContent = [];
    if (type === "vision") {
      if (fileDataUrl){
        messageContent = [
          { type: "text", text: content },
          { type: fileType, [fileType]: { url: fileDataUrl } }
        ];
      } else {
        messageContent = [
          { type: "text", text: content }
        ];
      }
      window.electron.addToVisionChat({ role, content: messageContent });
  } else {
      messageContent = [{ type: "text", text: content }];
      window.electron.addToChat({ role, content: messageContent });
    }
  }

  // Render the conversation in the web interface
  renderConversation(conversationData, model = "text") {
    chatArea.innerHTML = '';
    if (model === 'Vision'){
      document.getElementById('mode').value = 'Vision';
    } else{
      document.getElementById('mode').value = 'Basic mode';
    }
    conversationData.forEach(message => {
      if (message.role === "user") {
        //console.log(message.content[0]);
        this.renderUserMessage(message.content, model);
      } else if (message.role === "assistant") {
        if (model.toLocaleLowerCase() === "vision") { //this.getMessageType(message.content)
          this.renderVisionAssistantMessage(message.content);
        } else {
          this.renderTextAssistantMessage(message.content);
        }
      }
      window.electron.CreateNew(conversationData, model)
    });

    window.implementUserCopy();
    window.copyBMan();
    window.addCopyListeners();

    if (check === false) {
      // Sending a message to the main process
      window.electron.send('toMain', { message: 'set-Utitility-Script' });
      check = true;
    }
  }

  // Get file type from message content
  getFileType(content) {
    try {
      const fileDict = {
        "image_url": "image",
        "file_url": "document"
      };

      // Find the item with type "image_url" or "file_url"
      const fileTypeItem = content.find(item => item.type === "image_url" || item.type === "file_url");

      // Log the type of the found item
      console.log(fileTypeItem?.type);

      // Check if the found item exists and has a valid type
      if (fileTypeItem && fileDict[fileTypeItem.type]) {
        return fileDict[fileTypeItem.type];
      }

      // If no valid file type is found, log and return null
      console.log('No file attachment!');
      return null;

    } catch (error) {
      if (error.name === "TypeError") {
        console.log('No file attachment!');
      } else {
        console.error("Error determining file type:", error.name);
      }
      return null;
    }
  }

getFileUrl(content) {
  try {
    // Find the item with type "image_url"
    const fileMessage = content.find(item => item.type === "image_url");

    // Check if the item exists and has an images array
    if (fileMessage && fileMessage.images) {
      // Extract all URLs from the images array
      return fileMessage.images.map(image => image.url);
    }

    return [];
  } catch (error) {
    console.error("Error extracting file URL:", error);
    return [];
  }
}

  // Get message type (text or vision) from message content
  getMessageType(content) {
    const fileMessage = content.find(item => item.type === "image_url" || item.type === "file_url");
    return fileMessage ? "vision" : "text";
  }

  // Render user message
  renderUserMessage(content, model='text') {
    const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
    const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
    const fileType = this.getFileType(content);
    var fileDataUrl = null;
    var userText = null;
    //console.log(fileType)
    if (fileType){
      fileDataUrl = this.getFileUrl(content);
    }
    const userMessage = document.createElement("div");
    userMessage.className = "flex justify-end mb-4";

    if (model.toLocaleLowerCase() === 'vision'){
      // Exclude timestamp when rendering user messages
      userText = content[0].text.slice(-1)===']' ? content[0].text.substring(0, content[0].text.length - 22) : content[0].text
    } else{
      userText = content.slice(-1) === ']' ? content.substring(0, content.length - 22) : content
    }
    const messageHtml =`
        <div data-id="${userMessageId}" class="${userMessageId} relative bg-blue-500 dark:bg-[#142384] text-black dark:text-white rounded-lg p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
            <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${escapeHTML(userText)}</p>
            <button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80" onclick="CopyAll('.${userMessageId}', this)">
            Copy
            </button>
        </div>
        `;

    // Create files container if they exist
    if (fileDataUrl){
      const fileContainerId = `FCont_${Math.random().toString(35).substring(2, 8)}`;
      const fileHtml = `
      <div id="${fileContainerId}" class="flex justify-end">
        <article class="flex flex-rows-1 md:flex-rows-3 bg-cyan-100 w-fit p-1 rounded-lg">
        ${fileDataUrl && fileType === "image" ? fileDataUrl.map(url => `<img src="${url}" alt="Uploaded Image" class="rounded-md w-14 h-14 my-auto mx-1" />`).join('') : fileType === "document" ? fileDataUrl.map(url => `<div class="inline-flex items-center"><svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16V4a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2zm1-1h4v10h-4V4z"/></svg><span>${url}</span></div>`).join('') : ""}
        </article>
      </div>
      `;
      const filesContainer = document.createElement("div");
      filesContainer.className = "flex justify-end";
      filesContainer.innerHTML = fileHtml;
      chatArea.appendChild(filesContainer);
    }

    // Append the user text to the page
    userMessage.innerHTML = messageHtml;
    chatArea.appendChild(userMessage);
  }

  // Render text-based assistant message
  renderTextAssistantMessage(content) {
    const aiMessageId = `msg_${Math.random().toString(30).substring(3, 9)}`;
    const aiMessage = document.createElement('div');
    aiMessage.classList.add('flex', 'justify-start', 'mb-12', 'overflow-wrap');
    chatArea.appendChild(aiMessage);
    //console.log(content)
    aiMessage.innerHTML = `
    <section class="relative w-fit max-w-full lg:max-w-6xl mb-8">
        <div class="${aiMessageId} bg-gray-200 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pt-2 pb-4 w-fit max-w-full lg:max-w-6xl">${window.marked(content)}
        </div>
        <section class="options flex absolute bottom-0 left-0 space-x-4 cursor-pointer">
            <div class="opacity-70 hover:opacity-100 p-1 border-none" id="exportButton" onclick="toggleExportOptions(this);" title="Export">
                <svg class="fill-rose-700 dark:fill-gray-700 text-gray-600 bg-white w-6 h-6 rounded-full" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </div>
            <div class="rounded-lg p-1 opacity-70 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${aiMessageId}');">
            <svg id="copy-svg-${aiMessageId}" class="w-5 md:w-6 h-5 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path class="fill-black dark:fill-pink-300" fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"></path>
            </svg>
            </div>
        </section>

        <div id="exportOptions" class="hidden block absolute bottom-6 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">

            <ul class="list-none p-0">
                <li class="mb-2">
                <a href=""  class="text-blue-500 dark:text-blue-400" onclick="HTML2Pdf(event, '.${aiMessageId}')">1. Export to PDF</svg></a>
                </li>
                <li class="mb-2">
                    <a href=""  class="text-blue-500 dark:text-blue-400" onclick="HTML2Jpg(event, '.${aiMessageId}')">2. Export to JPG</a>
                </li>
                <li>
                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Word(event, '.${aiMessageId}')">3. Export to DOCX</a>
                </li>
                <li>
                    <a href="" class="text-blue-500 dark:text-blue-400 decoration-underline" onclick="SuperHTML2Word(event, '.${aiMessageId}')">4. Word Export Advance</a>
                </li>
            </ul>
        </div>
    </section>
    `;
  }

  // Render vision-based assistant message
  renderVisionAssistantMessage(content) {
    const visionMessageId = `msg_${Math.random().toString(30).substring(3, 9)}`;
    const visionMessage = document.createElement('div');
    visionMessage.classList.add('flex', 'justify-start', 'mb-12', 'overflow-wrap');
    chatArea.appendChild(visionMessage);

    //const fileType = this.getFileType(content);
    //const fileDataUrl = this.getFileUrl(content);
   visionMessage.innerHTML = `
        <section class="relative w-fit max-w-full lg:max-w-6xl mb-8">
          <div class="${visionMessageId} bg-gray-200 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pt-2 pb-4 w-fit max-w-full lg:max-w-6xl">${marked(content[0].text)}</p>
          </div>
          <section class="options flex absolute bottom-0 left-0 space-x-4 cursor-pointer">
            <div class="opacity-70 hover:opacity-100 p-1" id="exportButton" onclick="toggleExportOptions(this);" title="Export">
              <svg class="fill-rose-700 dark:fill-gray-700 text-gray-600 bg-white w-6 h-6 rounded-full" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div class="rounded-lg p-1 opacity-70 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${visionMessageId}');">
              <svg id="copy-svg-${visionMessageId}"
                class="w-5 md:w-6 h-5 md:h-6 cursor-pointer"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <!-- path content remains the same -->
                <path
                  class="fill-black dark:fill-pink-300 transition duration-300 ease-in-out fill-opacity-40 hover:fill-opacity-100"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
                />
                <!-- Circle for visual feedback -->
                <circle class="h-2 w-2 absolute -top-2 -left-2 bg-blue-500 opacity-0 fill-opacity-0" r="1" />
              </svg>
            </div>
          </section>
          <div id="exportOptions" class="hidden block absolute bottom-6 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">

            <ul class="list-none p-0">
                <li class="mb-2">
                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Pdf(event, '.${visionMessageId}')">1. Export to PDF</a>
                </li>
                <li class="mb-2">
                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Jpg(event, '.${visionMessageId}')">2. Export to JPG</a>
                </li>
                <li>
                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Word(event, '.${visionMessageId}')">3. Export to DOCX</a>
                </li>
                <li>
                    <a href="" class="text-blue-500 dark:text-blue-400 decoration-underline" onclick="SuperHTML2Word(event, '.${visionMessageId}')">4. Word Export Advance</a>
                </li>
            </ul>
          </div>
          </section>`;
          /*
          ${(fileDataUrl && fileType) ? `<div class="mt-2">${fileType === "image_url" ? `<img src="${fileDataUrl}" alt="Uploaded Image" class="rounded-md my-auto" />` : `<svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2H14a2 2 0 0 0 2 2V6a2 2 0 0 0-2-2zM14 2H10a2 2 0 0 1 2v10a2 2 0 0 1 2 2V14z"/>
              </svg>`}</div>` : ""}
        </section>
          */
        }
}
const conversationManager = new ConversationManager(storagePath);

// Function to fetch conversation files and display their IDs
async function fetchConversations() {
  conversationsPanel.innerHTML = `<div class="justify-center items-center">
  <p class="text-center text-rose-400 dark:text-slate-400 text-md font-semibold">Empty!</p>
  </div>
  `;// Clear previous entries

  try {
    const files = await window.electron.readDir(storagePath);

    if (files.length > 0) {
      conversationsPanel.innerHTML = ''; // Clear the pane if conversations exist
      // Define the colors you want to cycle through
      const colors = ['bg-amber-500', 'bg-rose-900', 'bg-teal-700', 'bg-red-500', 'bg-blue-500', 'bg-green-600', 'bg-yellow-800', 'bg-purple-500','bg-fuchsia-500'];
      for (let [index, file] of files.entries()) {
        if (window.electron.getExt(file) === '.json') {
          const conversationId = window.electron.getBasename(file, '.json');
          const conversationItem = document.createElement('div');
          const color = (index <= colors.length-1) ? colors[index] : colors[Math.floor(Math.random() * colors.length)]
          conversationItem.classList.add('p-2', color, 'transition-transform', "text-black", 'tranform', 'hover:scale-105', 'transition', 'duration-600', 'ease-in-out', 'scale-100', 'infinite', 'hover:bg-blue-800', 'decoration-underline', 'decoration-pink-400', 'dark:decoration-fuchsia-500', 'dark:hover:bg-cyan-700', 'cursor-pointer', 'rounded-lg', "space-y-2","w-full", "sm:w-[90%]", "md:w-[80%]", "lg:w-[90%]", "whitespace-nowrap", "max-w-full", "overflow-auto", "scrollbar-hide");
          conversationItem.setAttribute('data-text', conversationId);

          conversationItem.textContent = conversationId;
          conversationItem.onclick = () => renderConversationFromFile(conversationItem, conversationId);
          conversationsPanel.appendChild(conversationItem);

          //Chat Options
          conversationItem.addEventListener('contextmenu', (event) => {

            // Prevent the default context menu
            event.preventDefault();

            const ChatOpts = document.getElementById('chatOptions-overlay');
            const renameBt = document.getElementById('renameBt');
            ChatOpts.classList.remove('hidden');
            document.getElementById('CornfirmDelete').addEventListener('click', () => {
              const _delete = window.electron.deleteChat(storagePath, conversationId)
              if (_delete){
                  window.showDeletionStatus("text-red-400", `Deleted ${conversationId}`)
                  console.log(`Deleted ${conversationId}`);
              } else{

              }
              document.getElementById('chatOptions-overlay').classList.add('hidden');
              document.getElementById('confirm-modal').classList.add('hidden');
              fetchConversations();
            });
            renameBt.addEventListener('click', () =>{
              ChatOpts.classList.add('hidden'); //Hide the chat options as they are nolonger needed
              selectedItem = event;
              modalTitle.textContent = `Rename ${conversationItem.getAttribute('data-text')}`;
              modal.classList.remove('hidden');

              renameButton.addEventListener('click', () => {
                try{
                  const newName = `${conversationId[0]}-${newNameInput.value.trim()}`;
                  if (conversationItem && newNameInput.value.trim() !== '') {
                    const rename = window.electron.Rename(storagePath, conversationId, newName)
                    if (rename){
                      conversationItem.textContent = newName;
                      conversationItem.setAttribute('data-text', newName);
                      modal.classList.add('hidden');
                    }
                  }
                  fetchConversations();
                }catch (err){
                  console.log("Failed to rename file", err)
                }
              });

              cancelButton.addEventListener('click', () => {
                modal.classList.add('hidden');
              });

              //Hide modal once clicked outside
              modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                  modal.classList.add('hidden');
                }
              });

              newNameInput.addEventListener('keypress', (event) => {
                event.preventDefault()
                event.stopPropagation()
                if (event.key === 'Enter') {
                  renameButton.click();
                }
              });

            });
          });
        }

    }
    } else {
      console.log("No conversations saved!")
    }
  } catch (err) {
    console.error('Error reading conversation files:', err);
  }
}

// Function to render a conversation from a file
async function renderConversationFromFile(item, conversationId) {
  // Remove animation from previous item as it active item is changing
  if (activeItem){
    activeItem.classList.remove('animate-heartpulse');
  }
  activeItem = item;
  item.classList.add('animate-heartpulse');
  const [conversationData, model] = await conversationManager.loadConversation(conversationId);
  //console.log(conversationData, model)
  if (conversationData) {
    window.electron.setSuperCId(conversationId);  //Set global conversation id to the current conversation id
    //console.log(conversationData)
    conversationManager.renderConversation(conversationData, model);
  } else {
    alert(`Conversation ${conversationId} not found.`);
  }
}

// Listen for updates messages from ipc for Chat models and update the history files
window.electron.receive('fromMain-ToChat', (data) => {
  let Chat = data
  try {
    let conversationId = window.electron.getSuperCId() || window.electron.getNewChatUUId();
    console.log('ChatUpdated::');
    if (Chat.length > 1) {
      conversationManager.saveConversation(Chat, conversationId);
      console.log("Saved conversation, size:", Chat.length);
    }
    } catch (err) {
      console.log("Outer loop error:", err);
  }

});


// Listen for updates messages from ipc for Vision models and update the history files
window.electron.receive('fromMain-ToVision', (data) => {
  console.log("Vision")
  try {
    let VChat = data
    //console.log(JSON.stringify(VChat));
    let VconversationId = window.electron.getSuperCId() || window.electron.getNewVisionUUId()
    console.log("VChatUpdated::");
    if (VChat && VChat.length > 1) {
      conversationManager.saveConversation(VChat, VconversationId);
      console.log("Saved V conversation, size:", VChat.length);
    } else if (typeof VChat === 'object' && Object.keys(VChat).length > 1) {
      conversationManager.saveConversation(VChat, VconversationId);
      //console.log("Saved V conversation, size length", VChat.length);
    } else {
      console.log("VChat is not an array or object with more than one entry.");
    }
  } catch (err) {
    console.error("Error in VChatUpdated handler:", err);
  }
});

checkAndCreateDirectory();
// Fetch and display conversations on page load
fetchConversations();
//AutoChatHistSync();
document.addEventListener('NewConversationOpened', function() {
  fetchConversations();
})
