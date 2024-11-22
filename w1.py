#!/usr/bin/python
import tkinter as tk
from tkinter import scrolledtext
import markdown.inlinepatterns
from huggingface_hub import InferenceClient

# Initialize the Inference Client
client = InferenceClient(api_key="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")


def send_query(event=None):
    user_input = input_field.get()
    if user_input.strip():
        messages = [{"role": "user", "content": user_input}]
        try:
            result_box.insert(tk.END, f"\nUser: {user_input}\n", "user")
            result_box.insert(tk.END, "Bot: ", "bot")
            result_box.see(tk.END)
            input_field.delete(0, tk.END)

            stream = client.chat.completions.create(
                model="Qwen/Qwen2.5-72B-Instruct",
                messages=messages,
                max_tokens=500,
                stream=True
            )

            for chunk in stream:
                result_box.insert(tk.END, chunk.choices[0].delta.content)
                result_box.see(tk.END)
        except Exception as e:
            result_box.insert(tk.END, f"\nError: {e}\n", "error")
    else:
        result_box.insert(tk.END, "\nNo input provided.\n", "error")


# Create the main Tkinter window
root = tk.Tk()
root.title("Qwen Chatbot")

# Configure resizing behavior
root.rowconfigure(0, weight=1)
root.rowconfigure(1, weight=0)
root.columnconfigure(0, weight=1)

# Create a scrolling text box for displaying conversation
result_box = scrolledtext.ScrolledText(root, wrap=tk.WORD)
result_box.tag_config("user", foreground="blue")
result_box.tag_config("bot", foreground="green")
result_box.tag_config("error", foreground="red")
result_box.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)

# Create a frame for the input field and button
input_frame = tk.Frame(root)
input_frame.grid(row=1, column=0, sticky="ew", padx=10, pady=5)
input_frame.columnconfigure(0, weight=1)
input_frame.columnconfigure(1, weight=0)

# Create an entry box for user input
input_field = tk.Entry(input_frame)
input_field.grid(row=0, column=0, sticky="ew", padx=5, pady=5)

# Add a button to send input
send_button = tk.Button(input_frame, text="Ask", command=send_query)
send_button.grid(row=0, column=1, padx=5)

# Bind the Enter key to send messages
root.bind("<Return>", send_query)

# Start the Tkinter event loop
root.mainloop()
