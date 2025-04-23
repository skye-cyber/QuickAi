const htmlMath = `
$$
\\begin{aligned}
& \\text{Let } f(x) = \\int_{-\\infty}^\\infty e^{-t^2} \\cos(2\\pi x t) \\, dt \\\\
& \\text{Then } \\mathcal{F}\\{f(x)\\}(\\xi) = \\sqrt{\\pi} e^{-\\pi^2 \\xi^2} \\\\
& \\text{And } \\sum_{n=-\\infty}^{\\infty} e^{-\\pi n^2} = \\theta_3(0, e^{-\\pi}) = \\frac{1}{\\sqrt{\\pi}} \\sum_{n=-\\infty}^\\infty e^{-n^2} \\\\
& \\text{Bonus: } \\lim_{x \\to 0} \\frac{\\sin x}{x} = 1, \\quad \\text{and } \\oint_\\gamma f(z)\\,dz = 2\\pi i \\sum \\text{Res}(f, a_k)
\\end{aligned}
$$
`;

function KatexAddUserTestMs() {
    //console.log("Date time + text:", text)
    const userMessageId = `msg_${Math.random().toString(34).substring(3, 9)}`;
    const copyButtonId = `copy-button-${Math.random().toString(36).substring(5, 9)}`;
    const userMessage = document.createElement("div");

    userMessage.innerHTML = `
    <div data-id="${userMessageId}" class="${userMessageId} relative bg-[#566fdb] dark:bg-[#142384] text-black dark:text-white rounded-lg rounded-br-none p-2 md:p-3 shadow-md w-fit max-w-full lg:max-w-5xl">
    <p class="whitespace-pre-wrap break-words max-w-xl md:max-w-2xl lg:max-w-3xl">${htmlMath}</p>
    <button id="${copyButtonId}" class="user-copy-button absolute rounded-md px-2 py-2 right-1 bottom-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 dark:from-gray-700 dark:to-gray-900 hover:bg-indigo-200 dark:hover:bg-gray-600 text-white dark:text-gray-100 rounded-lg font-semibold border border-2 cursor-pointer opacity-40 hover:opacity-80 " onclick="CopyAll('.${userMessageId}', this)">
    Copy
    </button>
    </div>
    `;

    userMessage.classList.add("flex", "justify-end", "mb-4", "overflow-wrap");
    chatArea.appendChild(userMessage);
    chatArea.appendChild(userMessage);
    window.debounceRenderKaTeX(`.${userMessageId}`, 100, true)
}

setTimeout(() => {
    KatexAddUserTestMs();
}, 0)
