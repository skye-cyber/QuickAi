import { HfInference } from "@huggingface/inference";

let h_faceKey = null; // Define h_faceKey globally

const hf_API_KEY = await window.electron.HUGGINGHUB_API_KEY()

const client = new HfInference(hf_API_KEY);

//initChat(client);

const chatArea = document.getElementById("chatArea");
const modelSelect = document.getElementById('model');
const AutoScroll = document.getElementById("AutoScroll");
let check = false;
window.check = check;

async function routeToHf(text) {
	console.log("Reached Target: hfRoute")

	const isImageRequest = text.startsWith("/image");
	const escapedText = window.escapeHTML(text);
	const Currentmodel = modelSelect.value;

	// Display user message
	const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
	const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
	const userMessage = document.createElement("div");

	const VisioModels = [
		"Qwen/Qwen2-VL-7B-Instruct",
		"meta-llama/Llama-3.2-11B-Vision-Instruct",
		"Qwen/QVQ-72B-Preview"
	]

	const provider = {
		"Qwen/Qwen2.5-Math-1.5B": "hf-inference",
		"Qwen/Qwen2-VL-7B-Instruct": "hyperbolic",
		"Qwen/Qwen2.5-Coder-7B-Instruct": "nebius",
		"Qwen/QVQ-72B-Preview": "nebius",
		"deepseek-ai/DeepSeek-R1-Distill-Qwen-32B": "together",
		"deepseek-ai/DeepSeek-R1": "together",
		"meta-llama/Llama-3.2-11B-Vision-Instruct": "hf-inference"
	}


	if (VisioModels.indexOf(Currentmodel) > -1) {
		VisionChat(text = text, null, null, Currentmodel, provider[Currentmodel])

	} else {
		//console.log(typeof(escapedText))
		userMessage.innerHTML = `
			<div data-id="${userMessageId}" class="${userMessageId} relative bg-blue-500 dark:bg-[#142384] text-black dark:text-white rounded-lg p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
			<p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${escapedText}</p>
			<button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80 " onclick="CopyAll('.${userMessageId}', this)">
			Copy
			</button>
			</div>
			`;

		userMessage.classList.add("flex", "justify-end", "mb-4", "overflow-wrap");
		chatArea.appendChild(userMessage);
		window.implementUserCopy();
		chatArea.scrollTop = chatArea.scrollHeight;

		if (isImageRequest) {
			const imageGen = new ImageGenerator(chatArea);
			imageGen.createImage(text)
		} else {
			// Add Timestamp
			text = `${text} [${window.electron.getDateTime()} UTC]`
			// Add timestamped  user prompt to history
			window.electron.addToChat({ role: "user", content: text });

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

			const aiMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
			aiMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
			chatArea.appendChild(aiMessage);
			AutoScroll.checked ? scrollToBottom(chatArea) : null;
			const foldId = `think-content-${Math.random().toString(33).substring(3, 9)}`;
			const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;

			//console.log(JSON.stringify(window.electron.getChat()), null, 4);

			const _Timer = new window.Timer;
			try {
				//console.log(typeof(window.electron.getChat()))
				const options = {
					model: Currentmodel,
					messages: window.electron.getChat(), // Add conversation in JSON format to avoid size limitation
					max_tokens: 3000
				};

				if (provider[Currentmodel]) {
					options.provider = provider[Currentmodel];
				}

				const stream = client.chatCompletionStream(options);
				//const stream = window.generateTextChunks(null, true);
				console.log("Stream set")
				let output = "";

				// change send button appearance to processing status
				window.HandleProcessingEventChanges('show')

				//start timer
				_Timer.trackTime("start");
				let thinkContent = "";
				let actualResponse = "";
				let isThinking = false;
				let fullResponse = "";
				let hasfinishedThinking = false;

				for await (const chunk of stream) {
					const choice = chunk?.choices?.[0];
					console.log(chunk)
					if (!choice?.delta?.content) continue;

					const deltaContent = choice.delta.content;
					console.log(deltaContent)
					output += deltaContent;
					fullResponse += deltaContent;

					const hasThinkTag = output.includes("<think>");
					const isDeepSeek = Currentmodel === "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";
					const shouldStartThinking = !isThinking && (hasThinkTag || isDeepSeek);
					const shouldStopThinking = isThinking && output.includes("</think>");

					if (shouldStartThinking && !hasfinishedThinking) {
						isThinking = true;
						hasfinishedThinking = false;
						output = output.replace("<think>", "");
						thinkContent = output;
					} else if (shouldStopThinking) {
						isThinking = false;
						hasfinishedThinking = true;
						thinkContent += deltaContent.replace("</think>", "");
						output = output.replace("</think>", "");
					} else if (isThinking) {
						thinkContent += deltaContent;
					} else {
						actualResponse += deltaContent;
					}

					// Update innerHTML with marked output
					aiMessage.innerHTML = `
							<section class="relative w-fit max-w-full lg:max-w-6xl mb-8 p-2">
							${isThinking || thinkContent ? `
								<div class="think-section bg-gray-200 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 pt-2 lg:max-w-6xl">
								<div class="flex items-center justify-between">
								<strong style="color: #007bff;">Thoughts:</strong>
								<button class="text-sm text-gray-600 dark:text-gray-300" onclick="window.toggleFold(event, this.parentElement.nextElementSibling.id)">
								<p class="flex">Fold
								<svg class="mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="32" height="38" class="fold-icon">
								<path class="fill-blue-400 dark:fill-yellow-400" d="M6 9h12l-6 6z"/>
								<path fill="currentColor" d="M6 15h12l-6-6z"/>
								</svg>
								</p>
								</button>
								</div>
								<div id="${foldId}" class="">
								<p style="color: #333;">${window.marked(thinkContent)}</p>
								</div>
								</div>
								` : ''}
								${thinkContent && actualResponse ? `<p class="rounded-lg border-2 border-blue-400 dark:border-orange-400"></p>` : ""}
								${actualResponse ? `
									<div class="${aiMessageUId} bg-gray-200 py-4 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pb-4">
									${actualResponse && thinkContent ? `<strong style="color: #28a745;">Response:</strong>` : ''}
									<p style="color: #333;">${window.marked(actualResponse)}</p>
									<section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
										<div class="group relative max-w-fit transition-all duration-300 hover:z-50">
											<div
												role="button"
												id="${exportId}"
												aria-expanded="false"
												onclick="window.toggleExportOptions(this);"
												aria-label="Export"
												class="relative overflow-hidden bg-[white]/80 backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
												style="border: 2px solid rgba(255,85,0,0); background-clip: padding-box, border-box; background-origin: border-box; background-image: linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%);"
											>
												<div class="flex items-center space-x-2 px-4 py-1">
												<div class="relative h-6 w-6">
													<svg
													class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
													viewBox="0 0 24 24"
													style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
													>
													<path
														d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
														class="origin-center transition-transform duration-300"
													/>
													</svg>
												</div>
												<span class="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
													Export
												</span>
												</div>

												<!-- Gradient border overlay -->
												<div class="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
											</div>

											<!-- Hover enhancement effect -->
											<div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/15"></div>
										</div>
										<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${aiMessageUId}');">
											<svg
												class="w-5 md:w-6 h-5 md:h-6 mt-1 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<defs>
													<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
														<stop offset="0%" style="stop-color: #FF4081; stop-opacity: 100" />
														<stop offset="100%" style="stop-color: #4a1dff; stop-opacity: 1" />
													</linearGradient>
												</defs>
												<g clip-path="url(#clip0)">
													<path
														fill-rule="evenodd"
														clip-rule="evenodd"
														d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
														fill="url(#gradient1)"
													/>
												</g>
											</svg>
										</div>
									</section>
									</div>
									<div id="exportOptions-${exportId}" class="hidden block absolute bottom-10 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">
									<ul class="list-none p-0">
									<li class="mb-2">
									<a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Pdf(event, '.${aiMessageUId}')">Export to PDF</a>
									</li>
									<li class="mb-2">
									<a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Jpg(event, '.${aiMessageUId}')">Export to JPG</a>
									</li>
									<li>
									<a href="" class="text-blue-500 dark:text-blue-400" onclick="HTML2Word(event, '.${aiMessageUId}')">Export to DOCX</a>
									</li>
									<li>
									<a href="" class="cursor-not-allowed text-blue-500 dark:text-blue-400 decoration-underline" onclick="">Word Export Advance</a>
									</li>
									</ul>
									</div>
									</section>`: ""}
									`;
					AutoScroll.checked ? scrollToBottom(chatArea) : null;
				}

			//stop timer
			_Timer.trackTime("stop");

			window.addCopyListeners();

			// Debounce MathJax rendering to avoid freezing
			window.debounceRenderMathJax(aiMessageUId);

			// Resent send button appearance
			window.HandleProcessingEventChanges('hide')

				if (check === false) {
					// Sending a message to the main process
					window.electron.send('toMain', { message: 'set-Utitility-Script' });
					check = true;
				}

			// Render mathjax immediately
			window.debounceRenderMathJax(aiMessageUId, 0, true);
			// Store conversation history
			//window.electron.addToChat({ role: "assistant", content: fullResponse });

		} catch (error) {
			window.handleRequestError(error, userMessage, aiMessage);

		}
	}
}

}


async function VisionChat(text, fileType, fileDataUrl = null, Vmodel = null, provider = null) {
	const _Timer = new window.Timer;

	//switch to vision model
	modelSelect.value = Vmodel ? Vmodel.split('/').slice(-1)[0] : "meta-llama/Llama-3.2-11B-Vision-Instruct";

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
			const imageContent = fileDataUrl.map(_url => ({
				type: "image_url",
				image_url: {
					url: _url,
				}
			}));

			userContent = [
				{
					type: "text",
					text: text,
				},
				...imageContent // Spread the image content objects
			];
		}

		else if (fileType == "document") {
			const documentContent = fileDataUrl.map(_url => ({
				type: "file_url",
				image_url: {
					url: _url,
				}
			}));

			userContent = [
				{
					type: "text",
					text: text,
				},
				...documentContent // Spread the document content objects
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

	const VisionMessage = document.createElement("div");
	const VisionMessageUId = `msg_${Math.random().toString(30).substring(3, 9)}`;
	VisionMessage.classList.add("flex", "justify-start", "mb-12", "overflow-wrap");
	chatArea.appendChild(VisionMessage);
	const exportId = `export-${Math.random().toString(33).substring(3, 9)}`;

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
		//console.log(window.electron.clearImages(window.electron.getVisionChat()),)
		//const visionstream = window.generateTextChunks(null, true);

		const visionstream = client.chatCompletionStream({
			model: Vmodel,
			messages: window.electron.clearImages(window.electron.getVisionChat()),
			max_tokens: 2000,
		});

		if (provider) {
			visionstream.provider = provider;
		}

		let visionMs = "";

		// change send button appearance to processing status
		window.HandleProcessingEventChanges('show')

		//start timer
		_Timer.trackTime("start");
		for await (const chunk of visionstream) {
			const choice = chunk?.choices?.[0];
			console.log(chunk)
			if (choice?.delta?.content) {
				visionMs += choice.delta.content;
				VisionMessage.innerHTML = `
					<section class="relative w-fit max-w-full lg:max-w-6xl mb-8">
					<div class="${VisionMessageUId} bg-gray-200 text-gray-800 dark:bg-[#28185a] dark:text-white rounded-lg px-4 mb-6 pt-2 pb-4 w-fit max-w-full lg:max-w-6xl">${window.marked(visionMs)}
						<section class="options absolute bottom-2 flex mt-6 space-x-4 cursor-pointer">
							<div class="group relative max-w-fit transition-all duration-300 hover:z-50">
								<div
									role="button"
									id="${exportId}"
									aria-expanded="false"
									onclick="window.toggleExportOptions(this);"
									aria-label="Export"
									class="relative overflow-hidden bg-[white]/80 backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 dark:bg-[#5500ff]/80 dark:hover:bg-[#00aa00]/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900/50 rounded-full"
									style="border: 2px solid rgba(255,85,0,0); background-clip: padding-box, border-box; background-origin: border-box; background-image: linear-gradient(to bottom right, hsl(0 0% 100% / 0.8), hsl(0 0% 100% / 0.8)), linear-gradient(135deg, rgba(255,0,255,170) 0%, rgba(0,0,255,85) 50%, rgba(0,255,255,170) 100%);"
								>
									<div class="flex items-center space-x-2 px-4 py-1">
									<div class="relative h-6 w-6">
										<svg
										class="absolute inset-0 h-full w-full fill-current text-blue-600 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110 group-hover:text-blue-500 dark:text-[#00aaff] dark:group-hover:text-sky-800"
										viewBox="0 0 24 24"
										style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
										>
										<path
											d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
											class="origin-center transition-transform duration-300"
										/>
										</svg>
									</div>
									<span class="bg-gradient-to-r from-blue-700 to-[#550000] bg-clip-text text-sm font-semibold text-transparent transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-400 dark:from-blue-600 dark:to-[#00007f] dark:group-hover:from-sky-700 dark:group-hover:to-[#984fff]">
										Export
									</span>
									</div>

									<!-- Gradient border overlay -->
									<div class="absolute inset-0 -z-10 rounded-[12px] bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-blue-400/20 opacity-60 dark:from-blue-400/15 dark:via-purple-400/10 dark:to-blue-400/15"></div>
								</div>

								<!-- Hover enhancement effect -->
								<div class="absolute -inset-2 -z-10 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-blue-400/15"></div>
							</div>
							<div class="rounded-lg p-1 cursor-pointer" aria-label="Copy" title="Copy" id="copy-all" onclick="CopyAll('.${VisionMessageUId}');">
								<svg
									class="w-5 md:w-6 h-5 md:h-6 mt-1 transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<defs>
										<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style="stop-color: #FF4081; stop-opacity: 100" />
											<stop offset="100%" style="stop-color: #4a1dff; stop-opacity: 1" />
										</linearGradient>
									</defs>
									<g clip-path="url(#clip0)">
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z"
											fill="url(#gradient1)"/>
									</g>
								</svg>
							</div>
						</section>
					</div>

					<div id="exportOptions-${exportId}" class="hidden block absolute bottom-10 left-0 bg-white dark:bg-gray-800 p-2 rounded shadow-md z-50 transition-300">

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
					<a href="" class="text-blue-500 dark:text-blue-400 decoration-underline cursor-not-allowed" onclick="">4. Word Export Advance</a>
					</li>
					</ul>
					</div>
					</section>
					`;

				AutoScroll.checked ? scrollToBottom(chatArea) : null;
				window.addCopyListeners();
				// Debounce MathJax rendering to avoid freezing
				window.debounceRenderMathJax(VisionMessageUId);
			}
		}

		//stop timer
		_Timer.trackTime("stop");

		// Reset send button appearance
		window.HandleProcessingEventChanges('hide')

		window.setutilityScriptisSet();

		// Render mathjax immediately
		window.debounceRenderMathJax(VisionMessageUId, 0, true);
		window.electron.addToVisionChat({ role: "assistant", content: [{ type: "text", text: visionMs }] });
		//console.log("Final VisionHistory:", JSON.stringify(VisionHistory, null, 2));

	} catch (error) {
		window.handleRequestError(error, userMessage, VisionMessage, ["VS", fileType, fileContainerId])
	}
}

function addUserMessage(text, fileType, fileDataUrl, fileContainerId) {
	const VisionUserMessageUId = `msg_${Math.random().toString(35).substring(2, 8)}`;
	const VisioncopyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
	const userMessage = document.createElement("div");
	userMessage.classList.add("flex", "justify-end", "mb-4");
	const messageHtml = `
		<div data-id="${VisionUserMessageUId}" class="${VisionUserMessageUId} relative bg-blue-500 dark:bg-[#142384] text-black dark:text-white rounded-lg p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
		<p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${window.escapeHTML(text)}</p>
		<button id="${VisioncopyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80" onclick="CopyAll('.${VisionUserMessageUId}', this)">
		Copy
		</button>
		</div>
		`;

	// Create files container if they exist
	if (fileDataUrl) {
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
	window.copyBMan();
	window.implementUserCopy();
	return userMessage
}


class ImageGenerator {
	constructor(chatArea) {
		this.chatArea = chatArea;
	}

	async generateImage(data, useFlux = false) {
		const url = useFlux
			? "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
			: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";

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

	createLoadingMessage(imageId) {
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
		</div>`;
		this.chatArea.appendChild(loadingMessage);
		this.chatArea.scrollTop = this.chatArea.scrollHeight;
		return loadingMessage;
	}

	async createImage(text) {
		const imageData = { inputs: text.replace("/image", "").trim() };
		const imageId = `image_${Math.random().toString(36).substring(2, 7)}`;
		const loadingMessage = this.createLoadingMessage(imageId);
		let secondsElapsed = 0;
		const timerInterval = setInterval(() => {
			secondsElapsed++;
			loadingMessage.querySelector('span').textContent = `${secondsElapsed}s`;
		}, 1000);

		const useFlux = document.getElementById('CModel').checked;
		const imageUrl = await this.generateImage(imageData, useFlux);
		clearInterval(timerInterval);

		if (imageUrl) {
			if (imageUrl && /^https?:\/\//.test(imageUrl)) {
				fetch(imageUrl, { method: "HEAD" })
					.then(response => {
						if (!response.headers.get("Content-Type")?.startsWith("image/")) {
							throw new Error("Invalid image type");
						}

						loadingMessage.innerHTML = "";
						loadingMessage.appendChild(this.createImageElement(imageUrl));
					})
					.catch(console.error);
			}
		} else {
			loadingMessage.innerHTML = `
			<div id="${imageId}" class="w-fit bg-red-400 text-gray-950 dark:bg-rose-500 rounded-lg p-2 font-normal shadow-lg dark:shadow-red-500 max-w-3xl mb-[5%]">
			<span class="text-sm text-gray-950 dark:text-black">Could not Process request!⚠️</span>
			</div>`;
		}
	}

	createImageElement(imageUrl) {
		return `
		<div class="relative mb-[5%]">
		<img src="${imageUrl}" class="rounded-lg shadow-lg mt-4 max-w-xs cursor-pointer" onclick="this.requestFullscreen()"/>
		<button class="absolute flex items-center text-white rounded-bl-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold py-2 px-4 focus:outline-none shadow-md w-fit h-fit bottom-0 left-0 opacity-60 hover:opacity-100">
		<a href="${imageUrl}" download="generated_image.png" class="flex items-center text-white no-underline">
		<span>Download</span>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-2">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M12 21C11.7348 21 11.4804 20.8946 11.2929 20.7071L4.29289 13.7071C3.90237 13.3166 3.90237 12.6834 4.29289 12.2929C4.68342 11.9024 5.31658 11.9024 5.70711 12.2929L11 17.5858V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V17.5858L18.2929 12.2929C18.6834 11.9024 19.3166 11.9024 19.7071 12.2929C20.0976 12.6834 20.0976 13.3166 19.7071 13.7071L12.7071 20.7071C12.5196 20.8946 12.2652 21 12 21Z" fill="currentColor"></path>
		</svg>
		</a>
		</button>
		</div>`;
	}
}

window.VisionChat = VisionChat;
window.routeToHf = routeToHf;
