import { marked } from "marked";
import hljs from 'highlight.js';
// Initialize highlight.js
hljs.configure({ ignoreUnescapedHTML: true });

// Custom renderer for syntax highlighting
const renderer = new marked.Renderer();
renderer.code = function(code) {
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
		if (error.message === "Unknown language") {
			console.log("Undetermined language")
		}
		else {
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
	highlight: function(code) {
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
