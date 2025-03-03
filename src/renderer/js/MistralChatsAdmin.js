import { Mistral } from '@mistralai/mistralai';


const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const modelSelect = document.getElementById('model');
const AutoScroll = document.getElementById("AutoScroll");
const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

const codestral = {
	'https://codestral.mistral.ai/v1/fim/completions': 'Completion Endpoint',
	'https://codestral.mistral.ai/v1/chat/completions': 'Chat Endpoint'
}

const MSmodels = [
	"open-mistral-7b",
	"open-mixtral-8x7b",
	"open-mixtral-8x22b",
	"mistral-small-2402",
	"mistral-small-2409",
	"mistral-small-2501",
	"mistral-medium",
	"mistral-large-2402",
	"mistral-large-2407",
	"mistral-large-2411",
	"mistral-saba-2502",
	"mistral-embed",
	"codestral-2405",
	"codestral-2501",
	"codestral-mamba-2407",
	"open-mistral-nemo",
	"pixtral-12b-2409",
	"pixtral-large-2411",
	"ministral-3b-2410",
	"ministral-8b-2410",
	"mistral-moderation-2411"
]
async function MistraChat() {
	const result = await client.chat.stream({
		model: "mistral-small-latest",
		messages: [{ role: 'user', content: 'What is the best French cheese?' }],
	});

	for await (const chunk of result) {
		const streamText = chunk.data.choices[0].delta.content;
		console.log(streamText);
	}
}

async function MistraVision() {
	const chatResponse = await client.chat.complete({
		model: "pixtral-12b",
		messages: [
			{
				role: "user",
				content: [
					{ type: "text", text: "What's in this image?" },
					{
						type: "image_url",
						imageUrl: "https://tripfixers.com/wp-content/uploads/2019/11/eiffel-tower-with-snow.jpeg",
					},
				],
			},
		],
	});

	console.log("JSON:", chatResponse.choices[0].message.content);
}

function MistraController() {

}
