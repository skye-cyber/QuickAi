import { HfInference } from "@huggingface/inference";
import { marked } from "marked";
import hljs from 'highlight.js';
//import { get_key } from './Pcrypto.js';

let h_faceKey = null; // Define h_faceKey globally

window.electron.getEnv().then(env => {
    const encryptedOBJ = {
        iv: env.IV,
        encryptedData: env.API_OBJ
    };

    const SKEY = env.SKEY;
    const keyObject = window.electron.get_key(encryptedOBJ, SKEY);

    keyObject.then(result => {
        h_faceKey = result;
        const client = new HfInference(h_faceKey);
        initChat(client);
    }).catch(error => {
        console.error("Error:", error);
    });
});

function initChat(client) {
    const chatArea = document.getElementById("chatArea");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const modeSelect = document.getElementById('mode');
    const AutoScroll = document.getElementById("AutoScroll");
    let check = false;
    window.check = check;

    // Initialize highlight.js
    hljs.configure({ ignoreUnescapedHTML: true });

    // Custom renderer for syntax highlighting
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
        // Handle case where `code` is an object
        const validLanguage = code.lang || 'plaintext';
        //console.log(`Language: ${validLanguage}`);
        if (typeof code === "object" && code.text !== undefined) {
            code = code.text; // Extract the actual code
        }

        if (typeof code !== "string" || code.trim() === "") {
            console.warn("Empty or invalid code provided:", code);
            code = "// No code provided"; // Default fallback for empty code

        }

        // Highlight the code
        let highlighted;
        try {
            highlighted = hljs.highlight(code, { language: validLanguage }).value;
        } catch (error) {
            if (error.message === "Unknown language"){
                console.log("Undetermined language")
            }
            else{
                console.error("Highlighting error:", error.name);
                highlighted = hljs.highlightAuto(code).value; // Fallback to auto-detection
            }
        }

        // Generate unique ID for the copy button
        const copyButtonId = `copy-button-${Math.random().toString(36).substring(2, 9)}`;
        //const bg = validLanguage && ['css', 'html'].includes(validLanguage) ? 'dark:bg-[#000000]' : 'dark:bg-[#161420]';

        return `
        <div class="my-2 block bg-gray-200 dark:bg-zinc-800  rounded-md">
        <section class="flex justify-between top-1 p-1 w-full bg-gray-300 rounded-t-md dark:bg-slate-700 box-border">
        <!-- Language -->
        <p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">
        ${validLanguage}
        </p>
        <!-- Copy button -->
        <button id="${copyButtonId}" class="copy-button flex justify-end rounded-md p-1 bg-gradient-to-r from-sky-800 to-purple-600 hover:to-green-400 text-sm text-white cursor-pointer">
        <svg class="mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <p id="BtText">copy</p>
        </button>
        </section>
        <div class="p-2 border border-gray-300 dark:border-none w-full bg-white dark:bg-[#14121e] rounded-md rounded-t-none overflow-auto scrollbar-hide">
        <code class="p-2 hljs ${validLanguage} block whitespace-pre bg-white dark:bg-[#14121e]">${highlighted}</code>
        </div>
        </div>
        `;
    };

    // Configure marked.js
    marked.setOptions({
        renderer: renderer,
        highlight: function (code, lang) {
            // Handle case where `code` is an object
            const validLanguage = code.lang || 'plaintext';
            if (typeof code === "object" && code.text !== undefined) {
                code = code.text; // Extract the actual code
            }

            if (typeof code !== "string" || code.trim() === "") {
                console.warn("Empty or invalid code provided:", code);
                code = "// No code provided"; // Default fallback for empty code
            }

            try {
                return hljs.highlight(code, { language: validLanguage }).value;
            } catch (error) {
                console.error("Highlighting error:", error);
                return hljs.highlightAuto(code).value; // Fallback to auto-detection
            }
        },
        breaks: true,
    });

    //avail markde to the other scripts
    window.marked = marked;

    function addCopyListeners() {
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', async function() {
                const codeBlock = this.parentNode.nextElementSibling.querySelector('code');
                const textToCopy = codeBlock.innerText;
                const button = document.getElementById(this.id);
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    button.children[1].textContent = 'copied!';
                    setTimeout(() => {
                        button.children[1].textContent = 'copy';
                    }, 2000);
                    showCopyModal();
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
            });
        });
    }

    async function generateImage(data, useFlux = false) {
        const url = useFlux ? "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev" :
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";
        //console.log(url);
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${h_faceKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            });
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("Image generation error:", error);
            return null;
        }
    }

    function escapeHTML(unsafe) {
        if (typeof unsafe !== 'string') {
            return '';
        }
        return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    async function classifyText(text) {
        const isImageRequest = text.startsWith("/image");
        const escapedText = escapeHTML(text);
        const mode = modeSelect.value;

        // Display user message
        const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
        const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
        const userMessage = document.createElement("div");
        if (mode === "vision"){
            VisionChat(text=text)

        } else {
            //console.log(typeof(escapedText))
            userMessage.innerHTML = `
            <div data-id="${userMessageId}" class="${userMessageId} relative bg-blue-500 dark:bg-[#142384] text-black dark:text-white rounded-lg p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
            <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${(escapedText)}</p>
            <button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80" onclick="CopyAll('.${userMessageId}', this)">
            Copy
            </button>
            </div>
            `;

            // Add Timestamp
            text = `${text} [${window.electron.getDateTime()} UTC]`

            userMessage.classList.add("flex", "justify-end", "mb-4", "overflow-wrap");
            chatArea.appendChild(userMessage);
            implementUserCopy();
            chatArea.scrollTop = chatArea.scrollHeight;
            if (!isImageRequest) {
                window.electron.addToChat({ role: "user", content: text });
            }

            if (isImageRequest) {
                const imageData = { inputs: text.replace("/image", "").trim() };
                const imageId = `image_${Math.random().toString(36).substring(2, 7)}`;
                const loadingMessage = document.createElement("div");
                loadingMessage.innerHTML = `
                <div id="${imageId}" class="w-fit dark:text-gray-100 rounded-lg font-normal bg-gray-50 dark:bg-zinc-900 max-w-3xl mb-[7%] lg:mb-[5%]">
                    <div class="space-x-1 flex">
                        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="transform scale-75">
                            <circle cx="12" cy="24" r="4" class="fill-green-500">
                                <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                                <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="24" cy="24" r="4" class="fill-blue-500">
                                <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                                <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                            </circle>
                            <circle cx="36" cy="24" r="4" class="fill-yellow-500">
                                <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                                <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                            </circle>
                        </svg>
                        <span class="text-sm mt-3 text-gray-700 dark:text-gray-200">0s</span>
                    </div>
                </div>
                `;
                chatArea.appendChild(loadingMessage);
                chatArea.scrollTop = chatArea.scrollHeight;
                let secondsElapsed = 0;
                const timerInterval = setInterval(() => {
                    secondsElapsed++;
                    loadingMessage.querySelector('span').textContent = `${secondsElapsed}s`;
                }, 1000);

                const useFlux = document.getElementById('CModel').checked;
                const imageUrl = await generateImage(imageData, useFlux);
                clearInterval(timerInterval);

                if (imageUrl) {
                    const imageContainer = document.createElement("div");
                    imageContainer.classList.add("relative", "mb-[5%]")
                    const imageElement = document.createElement("img");
                    imageElement.src = imageUrl;
                    imageElement.classList.add("rounded-lg", "shadow-lg", "mt-4", "max-w-xs", "cursor-pointer");
                    imageElement.addEventListener("click", () => {
                        if (imageElement.requestFullscreen) {
                            imageElement.requestFullscreen();
                        } else if (imageElement.webkitRequestFullscreen) {
                            imageElement.webkitRequestFullscreen();
                        } else if (imageElement.msRequestFullscreen) {
                            imageElement.msRequestFullscreen();
                        }
                    });

                    const downloadButtonContainer = document.createElement("button");
                    downloadButtonContainer.classList.add("absolute", "flex", "items-center", "text-white", "rounded-bl-md", "bg-gradient-to-r", "from-blue-500", "to-purple-500", "hover:from-blue-600", "hover:to-purple-600", "font-semibold", "py-2", "px-4", "focus:outline-none", "shadow-md", "w-fit", "h-fit", "bottom-0", "left-0", "opacity-60", "hover:opacity-100");

                    const downloadButton = document.createElement("a");
                    downloadButton.classList.add("flex", "items-center", "text-white", "no-underline");
                    downloadButton.href = imageUrl;
                    downloadButton.download = "generated_image.png";
                    downloadButton.innerHTML = `
                    <div class="flex items-center">
                    <span>Download</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-2">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path>
                    </svg>
                    </div>
                    `;

                    downloadButtonContainer.appendChild(downloadButton);
                    document.body.appendChild(downloadButtonContainer);

                    downloadButtonContainer.appendChild(downloadButton);
                    imageContainer.appendChild(imageElement);
                    imageContainer.appendChild(downloadButtonContainer);

                    loadingMessage.innerHTML = '';
                    loadingMessage.appendChild(imageContainer);
                } else {
                    loadingMessage.innerHTML = `
                    <div id="${imageId}" class="w-fit bg-red-400 text-gray-950 dark:bg-rose-500 rounded-lg p-2 font-normal shadow-lg dark:shadow-red-500 max-w-3xl mb-[5%]">
                    <span class="text-sm text-gray-950 dark:text-black">Could not Process request!⚠️</span>
                    </div>
                    `;
                }
            } else {
                let model = "Qwen/Qwen2.5-72B-Instruct";
                if (mode === 'coding') {
                    model = "Qwen/Qwen2.5-Coder-32B-Instruct";
                }

                const aiMessage = document.createElement("div");
                aiMessage.innerHTML = `
                <div id="loader-parent">
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="transform scale-75">
                        <circle cx="12" cy="24" r="4" class="fill-green-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="24" cy="24" r="4" class="fill-blue-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                        </circle>
                        <circle cx="36" cy="24" r="4" class="fill-yellow-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                        </circle>
                    </svg>
                </div>
                `;

                const aiMessageUId = `msg_${Math.random().toString(30).substring(3,9)}`;
                aiMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
                chatArea.appendChild(aiMessage);
                AutoScroll.checked ? scrollToBottom(chatArea) : null;
                //console.log(JSON.stringify(window.electron.getChat()), null, 4);

                const _Timer = new Timer();

                try {
                    console.log(typeof(window.electron.getChat()))
                    const stream = client.chatCompletionStream({
                        model: model,
                        messages: window.electron.getChat(), //Add conversation in json format to avoid size limitation
                        max_tokens:3000
                    });
                    let output = "";
                    window.processing = true;
                    // change send button appearance to processing status
                    HandleProcessingEventChanges()
                    //start timer
                    _Timer.trackTime("start");
                    for await (const chunk of stream) {
                        const choice = chunk?.choices?.[0];
                        if (choice?.delta?.content) {
                            output += choice.delta.content;
                            // Update innerHTML with marked output
                            aiMessage.innerHTML = `
                            <section class="relative w-fit max-w-full lg:max-w-6xl mb-8">
                                <div class="${aiMessageUId} bg-gray-200 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pt-2 pb-4 w-fit max-w-full lg:max-w-6xl">${marked(output)}
                                </div>
                                <section class="options flex absolute bottom-0 left-0 space-x-4 cursor-pointer">
                                    <div class="opacity-70 hover:opacity-100 p-1 border-none" id="exportButton" onclick="toggleExportOptions(this);" title="Export">
                                        <svg class="fill-rose-700 dark:fill-gray-700 text-gray-600 bg-white w-6 h-6 rounded-full" viewBox="0 0 24 24">
                                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                        </svg>
                                    </div>
                                    <div class="rounded-lg p-1 opacity-70 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${aiMessageUId}');">
                                        <svg class="w-5 md:w-6 h-5 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path class="fill-black dark:fill-pink-300" fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15    19V10C15 9.44772 14.5523 9 14 9H5Z"></path>
                                        </svg>
                                    </div>
                                </section>

                                <div id="exportOptions" class="hidden block absolute bottom-6 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">

                                    <ul class="list-none p-0">
                                        <li class="mb-2">
                                        <a href=""  class="text-blue-500 dark:text-blue-400" onclick="HTML2Pdf(event, '.${aiMessageUId}')">1. Export to PDF</svg></a>
                                        </li>
                                        <li class="mb-2">
                                            <a href=""  class="text-blue-500 dark:text-blue-400" onclick="HTML2Jpg(event, '.${aiMessageUId}')">2. Export to JPG</a>
                                        </li>
                                        <li>
                                            <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Word(event, '.${aiMessageUId}')">3. Export to DOCX</a>
                                        </li>
                                        <li>
                                            <a href="" class="text-blue-500 dark:text-blue-400 decoration-underline" onclick="SuperHTML2Word(event, '.${aiMessageUId}')">4. Word Export Advance</a>
                                        </li>
                                    </ul>
                                </div>
                            </section>
                            `;
                            AutoScroll.checked ? scrollToBottom(chatArea) : null;
                            addCopyListeners(); // Assuming this function adds copy functionality to code blocks
                            // Debounce MathJax rendering to avoid freezing
                            debounceRenderMathJax(aiMessageUId);
                        }
                    }

                    //stop timer
                    _Timer.trackTime("stop");

                    // Resent send button appearance
                    window.processing = false;
                    HandleProcessingEventChanges()

                    if (check === false) {
                        // Sending a message to the main process
                        window.electron.send('toMain', { message: 'set-Utitility-Script' });
                        check = true;
                    }

                    // Render mathjax immediately
                    debounceRenderMathJax(aiMessageUId, 0, true);
                    // Store conversation history
                    window.electron.addToChat({ role: "assistant", content: output });

                } catch (error) {
                    handleRequestError(error, userMessage, aiMessage);

                }
            }
        }

    }

    // Listen for the imageLoaded event
    document.addEventListener('imageLoaded', function(event) {
        const fileDataUrl = event.detail.fileDataUrl;
        const text = event.detail.text;
        const fileType = event.detail.fileType
        VisionChat(text, fileType, fileDataUrl);
    });


    async function VisionChat(text, fileType, fileDataUrl = null) {
        const _Timer = new Timer();

        //console.log("Initial VisionHistory:", JSON.stringify(VisionHistory, null, 2));
        //switch to vission model
        modeSelect.value = "Vision"

        const fileContainerId = `FCont_${Math.random().toString(35).substring(2, 8)}`;
        // Add user message to chat
        const userMessage = addUserMessage(text, fileType, fileDataUrl, fileContainerId);

        //Add Timestamp
        text = `${text} [${window.electron.getDateTime()} UTC]`
        //console.log(text)
        // Determine the content based on fileDataUrl
        let userContent;
        if (fileDataUrl) {
            //console.log("Image url present");
            if (fileType == "image") {
                userContent = [
                    {
                        type: "text",
                        text: text,
                    },
                    {
                        type: "image_url",
                        images: fileDataUrl.map(_url => ({
                            url: _url,
                        }))
                    }
                ];
            }

            else if (fileType == "document") {
                userContent = [
                    {
                        type: "text",
                        text: text,
                    },
                    {
                        type: "file_url",
                        files: fileDataUrl.map(_url => ({
                                url: _url,
                        }))
                    },
                ];
            }
        } else {
            //console.log("Url not found");
            userContent = [
                {
                    type: "text",
                    text: text,
                },
            ];
        }

        // Add user message to VisionHistory
        window.electron.addToVisionChat({
            role: "user",
            content: userContent,
        });

        // Store the last message for retry purposes
        //const lastMessage = userContent;

        const VisionMessage = document.createElement("div");
        const VisionMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
        VisionMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
        chatArea.appendChild(VisionMessage);

        // Add loading animation
        VisionMessage.innerHTML = `
        <div id="loader-parent">
                    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="transform scale-75">
                        <circle cx="12" cy="24" r="4" class="fill-green-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="24" cy="24" r="4" class="fill-blue-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.4s" />
                        </circle>
                        <circle cx="36" cy="24" r="4" class="fill-yellow-500">
                            <animate attributeName="cy" values="24;10;24;38;24" keyTimes="0;0.2;0.5;0.8;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                            <animate attributeName="fill-opacity" values="1;.2;1" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="-0.8s" />
                        </circle>
                    </svg>
                </div>
        `;

        try {
            const visionstream = client.chatCompletionStream({
                model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
                messages: window.electron.getVisionChat(),
                max_tokens: 2000,
                //temperature: window.electron.temperature(),
            });

            let visionMs = "";
            window.processing = true;
            // change send button appearance to processing status
            HandleProcessingEventChanges()
            //start timer
            _Timer.trackTime("start");
            for await (const chunk of visionstream) {
                const choice = chunk?.choices?.[0];
                if (choice?.delta?.content) {
                    visionMs += choice.delta.content;
                    VisionMessage.innerHTML = `
                    <section class="relative w-fit max-w-full lg:max-w-6xl mb-8">
                        <div class="${VisionMessageUId} bg-gray-200 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pt-2 pb-4 w-fit max-w-full lg:max-w-6xl">${marked(visionMs)}
                        </div>
                        <section class="options flex absolute bottom-0 left-0 space-x-4 cursor-pointer">
                            <div class="opacity-70 hover:opacity-100 p-1 border-none" id="exportButton" onclick="toggleExportOptions(this);" title="Export">
                                <svg class="fill-rose-700 dark:fill-gray-700 text-gray-600 bg-white w-6 h-6 rounded-full" viewBox="0 0 24 24">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                </svg>
                            </div>
                            <div class="rounded-lg p-1 opacity-70 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${VisionMessageUId}');">
                                <svg class="w-5 md:w-6 h-5 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path class="fill-black dark:fill-pink-300" fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"></path>
                                </svg>
                            </div>
                        </section>

                        <div id="exportOptions" class="hidden block absolute bottom-6 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">

                            <ul class="list-none p-0">
                                <li class="mb-2">
                                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Pdf(event, '.${VisionMessageUId}')">1. Export to PDF</a>
                                </li>
                                <li class="mb-2">
                                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Jpg(event, '.${VisionMessageUId}')">2. Export to JPG</a>
                                </li>
                                <li>
                                    <a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Word(event, '.${VisionMessageUId}')">3. Export to DOCX</a>
                                </li>
                                <li>
                                    <a href="" class="text-blue-500 dark:text-blue-400 decoration-underline" onclick="SuperHTML2Word(event, '.${VisionMessageUId}')">4. Word Export Advance</a>
                                </li>
                            </ul>
                        </div>
                    </section>
                    `;

                    AutoScroll.checked ? scrollToBottom(chatArea) : null;
                    addCopyListeners();
                    // Debounce MathJax rendering to avoid freezing
                    debounceRenderMathJax(VisionMessageUId);
                }
            }

            //stop timer
            _Timer.trackTime("stop");

            window.processing = false;
            // Resent send button appearance
            HandleProcessingEventChanges()

            if (check === false) {
                window.electron.send('ready_4_utility');
                check = true;
            }
            // Render mathjax immediately
            debounceRenderMathJax(VisionMessageUId, 0, true);
            window.electron.addToVisionChat({ role: "assistant", content: [{ type: "text", text: visionMs }] });
            //console.log("Final VisionHistory:", JSON.stringify(VisionHistory, null, 2));

        } catch (error) {
        handleRequestError(error, userMessage, VisionMessage, ["VS", fileType, fileContainerId])
        }
    }

    function addUserMessage(text, fileType, fileDataUrl, fileContainerId) {
        const VisionUserMessageUId = `msg_${Math.random().toString(35).substring(2, 8)}`;
        const VisioncopyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
        const userMessage = document.createElement("div");
        userMessage.classList.add("flex", "justify-end", "mb-4");
        const messageHtml = `
        <div data-id="${VisionUserMessageUId}" class="${VisionUserMessageUId} relative bg-blue-500 dark:bg-[#142384] text-black dark:text-white rounded-lg p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
            <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${escapeHTML(text)}</p>
            <button id="${VisioncopyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80" onclick="CopyAll('.${VisionUserMessageUId}', this)">
            Copy
            </button>
        </div>
        `;

        // Create files container if they exist
        if (fileDataUrl){
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
        scrollToBottom(chatArea)
        copyBMan();
        implementUserCopy();
        return userMessage
    }


    // Function to ensure MathJax renders dynamically injected content
    let renderTimeout;

    function debounceRenderMathJax(_currentclass, delay = 700, noDelay = false) {
        if (renderTimeout) clearTimeout(renderTimeout);

        if (noDelay) {
            if (window.MathJax) {
                MathJax.typesetPromise(Array.from(document.querySelectorAll('[class^="msg_"], [class*=" msg_"]')))
                .then(() => console.log("MathJax rendering complete"))
                .catch((err) => console.error("MathJax rendering error:", err.message));
            } else {
                console.error("MathJax is not loaded or available.");
            }
        } else {
            renderTimeout = setTimeout(() => {
                if (window.MathJax) {
                    MathJax.typesetPromise(Array.from(document.querySelectorAll('[class^="msg_"], [class*=" msg_"]')))
                    .then(() => console.log("MathJax rendering complete"))
                    .catch((err) => console.error("MathJax rendering error:", err.message));
                } else {
                    console.error("MathJax is not loaded or available.");
                }
            }, delay);
        }
    }

    function handleRequestError(error, userMessage, aiMessage, VS_url=null) {
        try {
            //start timer
            const _Timer = new Timer();
            _Timer.trackTime("interrupt");
            window.processing = false;
            // change send button appearance to processing status
            HandleProcessingEventChanges()
            const conversationHistory = VS_url ? window.electron.getVisionChat() : window.electron.getChat()
            if (!error.message === "Failed to fetch" && !error.message === "network error") {
                console.log("History length:", conversationHistory.length);
                console.log('Error:', JSON.stringify(error, null, 2));
            } else {
                if (error.message === "[object Object]"){
                    console.log('Error:', error);
                    removeFirstConversationPairs(conversationHistory);
                }
                console.log(`Intercepted '${error}'`);
                console.log("History length:", conversationHistory.length);
                const errorContainer = document.getElementById('errorContainer');
                const errorArea = document.getElementById('errorArea');
                const closeModal = document.getElementById('closeEModal');
                const retry = document.getElementById('retryBt');
                let lastMessage = conversationHistory.slice(-1); // Safely access the last message
                //console.log(lastMessage)

                function HideLoaderUserAiMs(all=false){
                    //Remove loading animation if present
                    if (aiMessage){
                        if (aiMessage.firstElementChild.id === "loader-parent"){
                            if (all){
                                userMessage.remove();
                            } else{
                                aiMessage.remove();
                            }
                        }
                    }
                }

                HideLoaderUserAiMs();
                // Clone the retry button and replace the original one
                const clonedRetry = retry.cloneNode(true);
                retry.replaceWith(clonedRetry);

                // Remove all event listeners from the cloned button
                const newRetry = document.getElementById('retryBt');
                //console.log(newRetry);
                newRetry.removeEventListener('click', retryHandler);

                // Re-attach the click event listener
                newRetry.addEventListener('click', function() {
                    //console.log("Clicked");
                    retryHandler();
                });

                closeModal.addEventListener('click', (event) => {
                    event.stopPropagation();
                    HideErrorModal();
                    HideLoaderUserAiMs(true);
                    if (VS_url[1]) {
                        const fileContainer = document.getElementById(VS_url[2])
                        fileContainer.remove();
                    }
                });

                function showError() {
                    setTimeout(() => {
                        errorContainer.classList.remove("hidden");
                        errorContainer.classList.add('left-1/2', 'opacity-100', 'pointer-events-auto');
                    }, 200); // 0.3 second delay
                    let ErrorMs = error.message === "Failed to fetch" ? "Connection Error: Check your Internet!" : error.message;
                    if (error.message === "[object Object]"){
                        ErrorMs = "This model is unreachabble: It might be overloaded!"
                    }
                    errorArea.textContent = ErrorMs;
                    window.electron.popFromChat(); // Remove the last conversation entry
                }

                async function HideErrorModal() {
                    // Slide modal to the left and fade out
                    setTimeout(() => {
                        errorContainer.classList.remove('left-1/2', '-translate-x-1/2');
                        errorContainer.classList.add('-translate-x-full', 'opacity-0', 'pointer-events-none');
                    }, 0);

                    // Reset transform after fully fading out and moving off-screen
                    setTimeout(() => {
                        errorContainer.classList.remove('opacity-100', '-translate-x-full');
                        errorContainer.classList.add('hidden', '-translate-x-1/2');
                    }, 0); // 1 second for reset
                }
                // Remove existing event listeners before adding a new one
                async function retryHandler(){
                    await HideErrorModal()

                    if (VS_url) {

                        try{
                            var text = lastMessage[0].content[0].text;
                            var fileDataUrl = [];

                            if (VS_url[1] === "image") {
                                const imageItem = lastMessage.find(item => item.type === "image_url");
                                if (imageItem && imageItem.images) {
                                    fileDataUrl.push(...imageItem.images.map(image => image.url));
                                }

                            } else if (VS_url[1] === "image") {
                                const imageItem = lastMessage.find(item => item.type === "file_url");
                                if (imageItem && imageItem.images) {
                                    fileDataUrl.push(...imageItem.files.map(file => file.url));
                                }
                            }
                        } catch (error) {
                            if (error.name === "TypeError") {
                                console.log('No file attachment!');
                            } else {
                                console.error("Error determining file type:", error);
                            }
                        }

                        text = text.slice(-1)===']' ? text.slice(0, text.length - 22) : text;
                        fileDataUrl = fileDataUrl.length !== 0 ? fileDataUrl : null;
                        VisionChat(text, VS_url[1], fileDataUrl);
                    } else {

                    // Strip date && time from user message
                    lastMessage = lastMessage[0].content.slice(-1)===']' ? lastMessage[0].content.slice(0, lastMessage[0].content.length - 22) : lastMessage[0].content;
                    // Retry action
                    classifyText(lastMessage.trim());
                    }

                    if (aiMessage) aiMessage.remove();
                    if (userMessage) userMessage.remove();
                };
                showError();
            }
        } catch (err) {
            console.error('Error handling request error:', err);
        }
    }

    function implementUserCopy() {
        document.querySelectorAll('.user-copy-button').forEach(button => {
            const buttonParent = button.parentElement;
            const textBlock = buttonParent.querySelector('p');

            if (textBlock && textBlock.innerHTML.length < 50) {
                button.style.display = 'none';
            }

            button.addEventListener('click', async function() {
                const textToCopy = textBlock.innerText;

                if (textToCopy.length >= 50) {
                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        this.textContent = 'Copied!';
                        setTimeout(() => {
                            this.textContent = 'Copy';
                        }, 3000);
                    } catch (err) {
                        console.error('Failed to copy: ', err);
                    }
                }
            });
        });
    }

    // Copy function for the whole text block/aiMessage
    function CopyAll(UId, bt = null) {
        //console.log(UId)
        const textBlock = document.querySelector(UId);
        //console.log(textBlock)
        if (!textBlock) {
            console.error('Element not found: ', UId);
            return;
        }

        const textToCopy = textBlock.innerText;
        //console.log(textToCopy)

        if (textToCopy.length >= 50) {
            try {
                 navigator.clipboard.writeText(textToCopy);
                 if (bt){
                   bt.textContent = 'Copied!';
                setTimeout(() => {
                    bt.textContent = 'Copy';
                }, 3000)
                 }
                 showCopyModal()
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        } else {
            console.log('Text is too short to copy: ', textToCopy);
        }
    }

    // Function to show the modal
    function showCopyModal(_color=null, text="Text copied") {
        const modal = document.getElementById('copyModal');
        const txtSpace = document.getElementById("text-space")
        txtSpace.textContent = text;
        addRmColor();
        function addRmColor(task="add"){
            if (_color){
                if (task==="add"){
                    txtSpace.classList.add(_color);
                    console.log("Added", _color)
                    }
                else {
                    txtSpace.classList.remove(_color);
                    console.log("Removed", _color)
                }
            }
        }
        // Slide modal to 20% height and make it visible after 1 second
        setTimeout(() => {
            modal.classList.add('top-1/5', 'opacity-100', 'pointer-events-auto');
        }, 300); // 1 second delay

        // Slide modal to the left and fade out after 5 seconds
        setTimeout(() => {
            modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
            modal.classList.add('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');

        }, 2000); // 5 seconds for staying in the middle plus 1 second delay

        // Reset transform after fully fading out and moving off-screen
        setTimeout(() => {
            modal.classList.remove('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');
            modal.classList.add('top-0', 'left-1/2', '-translate-x-1/2', 'pointer-events-none');
        }, 1000); // 0.5s for fade out
        addRmColor("rm")
    }


    // Function to remove the first conversation pairs to maintain conversation size limit
    function removeFirstConversationPairs(conversationHistory, count = 2) {
        let removed = 0;
        while (removed < count && conversationHistory.length > 0) {
            const firstPair = conversationHistory[0];
            if (firstPair.role !== "system") {
                conversationHistory.shift();
                removed++;
                console.log("New conversation:", conversationHistory)
            } else {
                // Skip system instructions
                break;
            }
        }
    }

    sendBtn.addEventListener("click", () => {
        const inputText = userInput.value.trim();
        if (inputText) {
            userInput.value = "";
            classifyText(inputText);
            document.getElementById('suggestions').classList.add('hidden')
        }
    });


    userInput.addEventListener("keydown", (e) => {
        if (!window.processing === true && e.key === "Enter" && !e.shiftKey) {
            const inputText = userInput.value.trim();
            if (inputText) {
                userInput.value = "";
                classifyText(inputText);
                document.getElementById('suggestions') ? document.getElementById('suggestions').classList.add('hidden') : "";
            }
        }
        });
    function copyBMan(){
        document.querySelectorAll(".Vision-user-copy-button").forEach(button => {
            //console.log("Adding copy control")
            // Get the next sibling of the current element
            const nextSibling = button.nextElementSibling;

            // Check if the next sibling exists
            if (nextSibling) {
                // Get the first child of the next sibling
                const userTextChild = nextSibling.firstElementChild;

            if (userTextChild.innerHTML.length < 50) {
                button.classList.toggle('hidden');
            } else {
                console.log("userTextChild not found")
            }
            }
        });
    }


    window.escapeHTML = escapeHTML;
    window.CopyAll = CopyAll;
    window.copyBMan =copyBMan;
    window.implementUserCopy = implementUserCopy;
    window.addCopyListeners = addCopyListeners;
    window.showDeletionStatus = showCopyModal;
}

function HandleProcessingEventChanges(){
    const sendBtn = document.getElementById("sendBtn");
    const normalSend = document.getElementById("normalSend"); //initially displayed
    const spinningSquares = document.getElementById("spinningSquares"); //inirially hidden
    const status = window.processing;
    if (status === true){
        normalSend.classList.add('hidden')
        spinningSquares.classList.remove('hidden')
        //Disable the send button
        sendBtn.disabled = true;
        // Add Cursor prohibited/disabled cursor class
        sendBtn.classList.add('cursor-disable');
    } else if (status === false){
        spinningSquares.classList.add('hidden')
        normalSend.classList.remove('hidden')
        //re-enable the send button
        sendBtn.disabled = false;
        // Remove Cursor prohibited/disabled cursor class
        sendBtn.classList.remove('cursor-disable');
    }
}

class Timer {
    constructor() {
        this.startTime = undefined;
    }

    trackTime(action) {
        // Store the start time
        if (action === 'start') {
            this.startTime = performance.now();
            console.log('Timer started.');
        }
        // Calculate the elapsed time
        else if (action === 'stop') {
            if (this.startTime === undefined) {
                console.log('Timer was not started.');
                return null;
            }
            const endTime = performance.now();
            const timeTaken = endTime - this.startTime;
            console.log(`Time taken: ${timeTaken} milliseconds`);
            delete this.startTime; // Clean up

            // Ensure window.Notify is defined before calling it
            if (typeof window.Notify === 'function') {
                const seconds = Math.floor(timeTaken / 1000) % 60;
                const milliseconds = Math.floor(timeTaken % 1000);
                window.Notify(null, `${seconds} seconds and ${milliseconds} milliseconds`);
            } else {
                console.error('window.Notify is not defined.');
            }

            return timeTaken;
        }
        // Interrupt the timer
        else if (action === 'interrupt') {
            delete this.startTime;
        }
        // Invalid action
        else {
            console.log('Invalid action. Use "start" to start the timer and "stop" to stop the timer.');
            return null;
        }
    }
}
