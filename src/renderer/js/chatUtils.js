import { marked } from "marked";
import hljs from 'highlight.js';

// Initialize highlight.js
hljs.configure({ ignoreUnescapedHTML: true });

// Custom renderer for syntax highlighting
const renderer = new marked.Renderer();
renderer.code = function(code) {
	// Handle case where `code` is an object
	let validLanguage = code.lang || 'plaintext';
	//console.log(`Language: ${validLanguage}`);
	if (typeof code === "object" && code.text !== undefined) {
		code = code.text; // Extract the actual code
	}

	if (typeof code !== "string" || code.trim() === "") {
		console.warn("Empty or invalid code provided:", code);
		code = "// No code provided"; // Default fallback for empty code

	}

	let jsonLang = (validLanguage.endsWith('-draw') || validLanguage === 'dot') ? validLanguage : null;
	validLanguage = jsonLang ? validLanguage.slice(0, -5) : validLanguage;

	//console.log('jsonLang:', jsonLang, 'validLang:', validLanguage);

	// Highlight the code
	let highlighted;
	try {

		highlighted = hljs.highlight(code, { language: validLanguage }).value;

	} catch (error) {
		if (error.message === "Unknown language") {
			console.log("Undetermined language")
		}
		else {
			console.error("Highlighting error:", error.name);
			highlighted = hljs.highlightAuto(code).value; // Fallback to auto-detection
		}
	}

	// Reset language to json-draw
	validLanguage = jsonLang ? jsonLang : validLanguage

	// Generate unique ID for the copy button
	const copyButtonId = `copy-button-${Math.random().toString(36).substring(2, 9)}`;
	const renderButtonId = `render-button-${Math.random().toString(36).substring(2, 9)}`;

	function render(instance) {
		if (validLanguage === 'html') {
			console.log('html')
			window.renderHtml(instance);
		} else {
			console.log("rest")
			window.handleDiagrams(instance, validLanguage === 'dot' ? 'dot' : 'json', true);
		}
	}

	return `
		<div class="my-2 block bg-blue-300 dark:bg-[#002f42]  rounded-md transition-colors duration-100">
		<section class="flex justify-between top-1 p-1 w-full bg-sky-300 rounded-t-md dark:bg-[#001922] box-border transition-colors duration-700">
		<!-- Language -->
		<p class="code-language p-1 justify-start rounded-md text-slate-950 dark:text-white rounded-lg font-normal text-sm cursor-pointer opacity-80 hover:opacity-50">
		${validLanguage}
		</p>
		<div class="flex justify-between space-x-3"
		${(jsonLang) ? `
			<!-- Render Button -->
			<button
			id="${renderButtonId}"
			onclick="window.handleDiagrams(this, '${validLanguage === 'dot' ? 'dot' : 'json'}', isPlainCode=true, trigger='click')"
			class="render-button flex items-center gap-1 rounded-md p-1 bg-gradient-to-r from-[#00aaff] to-purple-700 hover:to-[#55ff00] text-sm text-white cursor-pointer transform transition-all duration-700"
			>
			<!-- Network / Diagram Icon -->
			<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="5" r="2" />
			<circle cx="5" cy="19" r="2" />
			<circle cx="19" cy="19" r="2" />
			<line x1="12" y1="7" x2="5" y2="17" />
			<line x1="12" y1="7" x2="19" y2="17" />
			</svg>
			<p id="BtText">Render</p>
			</button>
			` : ''}

			<div class="flex justify-between space-x-3"
			${(['html', 'svg'].includes(validLanguage)) ? `
				<!-- Render html+svg -->
				<button
				id="${renderButtonId}"
				onclick="window.renderHtml(this);"
				class="render-button flex items-center gap-1 rounded-md p-1 bg-gradient-to-r from-[#00aaff] to-purple-700 hover:to-[#55ff00] text-sm text-white cursor-pointer transform transition-all duration-700"
				>
				<!-- Network / Diagram Icon -->
				<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="5" r="2" />
				<circle cx="5" cy="19" r="2" />
				<circle cx="19" cy="19" r="2" />
				<line x1="12" y1="7" x2="5" y2="17" />
				<line x1="12" y1="7" x2="19" y2="17" />
				</svg>
				<p id="BtText">Render</p>
				</button>
				` : ''}

			<!-- Copy button -->
			<button id="${copyButtonId}" onclick="window.handleCodeCopy(this, '${renderButtonId}');" class="copy-button flex items-center rounded-md p-1 bg-gradient-to-r from-sky-800 to-purple-600 hover:to-green-400 dark:from-[#00a5ce] dark:to-[#5500ff] dark:hover:from-[#00557f] dark:hover:to-[#006ea1] text-sm text-white cursor-pointer transform transition-all duration-700">
			<svg class="mt-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy mr-1">
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
			</svg>
			<p id="BtText">copy</p>
			</button>
		</div>
		</section>
		<div class="p-2 border border-[#00aaff] dark:border-[#00a5ce] w-full bg-cyan-100 dark:bg-[#001c24] rounded-md rounded-t-none overflow-auto scrollbar-hide transition-colors duration-700">
		<code data-value=${renderButtonId} class="p-2 hljs ${validLanguage} block whitespace-pre rounded-md bg-cyan-100 dark:bg-[#001c24] font-mono transition-colors duration-700 overflow-x-auto">${highlighted}</code>
		</div>
		</div>
		`;
};

// Configure marked.js white
marked.setOptions({
	renderer: renderer,
	breaks: true,
});


function addCopyListeners() {
	document.querySelectorAll('.copy-button').forEach(button => {
		button.addEventListener('click', async function() {
			const codeBlock = this.parentNode.parentNode.nextElementSibling.querySelector('code');
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

async function handleCodeCopy(element, id = null) {
	console.log(id)
	const codeBlock = document.querySelector(`[data-value="${id}"]`);
	console.log(codeBlock)
	const textToCopy = codeBlock.innerText;
	const button = document.getElementById(element.id);
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
}


function handleRequestError(error, userMessage, aiMessage, VS_url = null) {
	try {
		//start timer
		const _Timer = new Timer();
		_Timer.trackTime("interrupt");

		// change send button appearance to processing status
		HandleProcessingEventChanges('hide')
		const conversationHistory = VS_url ? window.electron.getVisionChat() : window.electron.getChat()
		if (!error.message === "Failed to fetch" && !error.message === "network error") {
			console.log("History length:", conversationHistory.length);
			console.log('Error:', JSON.stringify(error, null, 2));
		} else {
			if (error.message === "[object Object]") {
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

			function HideLoaderUserAiMs(all = false) {
				//Remove loading animation if present
				if (aiMessage) {
					if (aiMessage.firstElementChild.id === "loader-parent") {
						if (all) {
							userMessage.remove();
						} else {
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
				retryHandler();
			});

			closeModal.addEventListener('click', (event) => {
				event.stopPropagation();
				HideErrorModal();
				HideLoaderUserAiMs(true);
				if (VS_url && VS_url[1]) {
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
				if (error.message === "[object Object]") {
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
			async function retryHandler() {
				await HideErrorModal()

				if (VS_url) {

					try {
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

					text = text.slice(-1) === ']' ? text.slice(0, text.length - 22) : text;
					fileDataUrl = fileDataUrl.length !== 0 ? fileDataUrl : null;
					window.VisionChat(text, VS_url[1], fileDataUrl);
				} else {

					// Strip date && time from user message
					lastMessage = lastMessage[0].content.slice(-1) === ']' ? lastMessage[0].content.slice(0, lastMessage[0].content.length - 22) : lastMessage[0].content;

					// Retry action
					window.requestRouter(lastMessage.trim());
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
			if (bt) {
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
function showCopyModal(_color = null, text = "Text copied") {
	const modal = document.getElementById('copyModal');
	const txtSpace = document.getElementById("text-space")
	txtSpace.textContent = text;
	addRmColor();
	function addRmColor(task = "add") {
		if (_color) {
			if (task === "add") {
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
	}, 500); // 1 second delay

	// Slide modal to the left and fade out after 5 seconds
	setTimeout(() => {
		modal.classList.remove('top-1/5', 'left-1/2', '-translate-x-1/2');
		modal.classList.add('left-0', '-translate-x-full', 'opacity-0', 'pointer-events-none');

	}, 4000); // 5 seconds for staying in the middle plus 1 second delay

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


function copyBMan() {
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


function smartEscapeMathPreserve(text) {
	return text.replace(/\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\)/gs, (match) => {
		// Math block detected — return as is
		return match;
	}).replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}



function HandleProcessingEventChanges(status) {
	const sendBtn = document.getElementById("sendBtn");
	const normalSend = document.getElementById("normalSend"); //initially displayed
	const spinningSquares = document.getElementById("spinningSquares"); //inirially hidden
	if (status === 'show') {
		normalSend.classList.add('hidden')
		spinningSquares.classList.remove('hidden')
		//Disable the send button
		sendBtn.disabled = true;
		// Add Cursor prohibited/disabled cursor class
		sendBtn.classList.add('cursor-disable');
	} else if (status === 'hide') {
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
		this.startTime = null;
	}

	trackTime(action) {
		// Store the start time
		if (action === 'start') {
			if (this.startTime !== null) {
				console.log('Timer has already been started. Restarting');
				//return null;
			}
			this.startTime = performance.now();
			console.log('Timer started at:', this.startTime);
		}
		// Calculate the elapsed time
		else if (action === 'stop') {
			if (this.startTime === null) {
				console.log('Timer was not started.');
				return null;
			}
			const endTime = performance.now();
			const timeTaken = endTime - this.startTime;
			console.log(`Time taken: ${timeTaken} milliseconds.`);
			console.log('Stop time:', endTime)
			this.startTime = null; // Clean up

			// Ensure window.Notify is defined before calling it
			if (typeof window.Notify === 'function') {
				const seconds = Math.floor(timeTaken / 1000) % 60;
				const milliseconds = Math.floor(timeTaken % 1000);
				window.Notify(null, `${seconds} seconds and ${milliseconds} ms`);
				// Call app systewide notify
				window.electron.send('Notify', { message: timeTaken });
			} else {
				console.error('window.Notify is not defined.');
			}

			return timeTaken;
		}
		// Interrupt the timer
		else if (action === 'interrupt') {
			console.log("Timer Interrupted")
			this.startTime = null;
		}
		// Invalid action
		else {
			console.log('Invalid action. Use "start" to start the timer and "stop" to stop the timer.');
			return null;
		}
	}
}


// Grab the button element
const previewBtn = document.getElementById('previewBtn');

previewBtn.addEventListener('click', function() {
	// Determine current state from the aria-pressed attribute
	const isActive = this.getAttribute('aria-pressed');

	// Toggle the state
	this.setAttribute('aria-pressed', (isActive === 'false') ? "true" : "false");
	//console.log(this.getAttribute('aria-pressed'))

	//update system instructions
	window.electron.updateSysInit()

	if (isActive !== "true") {
		// When activated: switch to vibrant green theme
		this.classList.remove('border-sky-900', 'bg-blue-300', 'hover:bg-blue-400', 'dark:border-red-400', 'dark:bg-red-700', 'dark:hover:bg-red-600');
		this.classList.add('border-green-500', 'bg-green-300', 'hover:bg-green-400', 'dark:border-green-400', 'dark:bg-green-700', 'dark:hover:bg-green-600');
	} else {
		// When deactivated: revert to vibrant red theme
		this.classList.remove('border-green-500', 'bg-green-300', 'hover:bg-green-400', 'dark:border-green-400', 'dark:bg-green-700', 'dark:hover:bg-green-600');
		this.classList.add('border-sky-900', 'bg-blue-300', 'hover:bg-blue-400', 'dark:border-red-400', 'dark:bg-red-700', 'dark:hover:bg-red-600');
	}
});

function setutilityScriptisSet() {
	const scripts = document.getElementsByTagName('script');
	let exists = false;
	for (let script of scripts) {
		if (script.src.includes('packed_utility.js')) {
			console.log("Utility script already exits. Not adding"); // Logs the matching script element
			exists = true
			return exists
		}
	}
	console.log("Utility missing. Adding");
	// Sending a message to the main process if script does not exist already
	window.electron.send('toMain', { message: 'set-Utitility-Script' })
	return exists
}

function normalizeMathDelimiters(text) {
	return text
	// 1) convert [ … ] → $$ … $$, but only if it contains math operators or \commands
	.replace(
		/\[([^\[\]]*?(?:\\|[\d\^+\-*/])[^\[\]]*?)\]/g,
			 (_, expr) => `$$${expr.trim()}$$`
	)

	// 2) merge stray newlines in $$…$$—but only $$ blocks that look like math
	.replace(
		/\$\$(?=[\s\S]*?(?:\\|[\d\^+\-*/]))([\s\S]*?)\$\$/g,
			 (_, expr) => `$$${expr.replace(/\n/g, ' ').trim()}$$`
	);
}




//avail marked to the other scripts
window.Timer = Timer
window.marked = marked;
window.CopyAll = CopyAll
window.copyBMan = copyBMan
window.escapeHTML = smartEscapeMathPreserve
window.showCopyModal = showCopyModal
window.handleCodeCopy = handleCodeCopy;
window.showDeletionStatus = showCopyModal
//window.addCopyListeners = addCopyListeners
window.implementUserCopy = implementUserCopy
window.handleRequestError = handleRequestError
window.setutilityScriptisSet = setutilityScriptisSet
window.normalizeMathDelimiters = normalizeMathDelimiters
window.removeFirstConversationPairs = removeFirstConversationPairs
window.HandleProcessingEventChanges = HandleProcessingEventChanges;
