const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const sendBtn = document.querySelector("#send-btn");
const chatInput = document.querySelector("#chat-input");

// Show/Hide chatbot
chatbotToggler.addEventListener("click", () => {
    document.querySelector(".chatbot").classList.toggle("show-chatbot");
});

closeBtn.addEventListener("click", () => {
    document.querySelector(".chatbot").classList.remove("show-chatbot");
});

// Add message to chatbox
function createChatElement(message, className, isHTML = false) {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    const chatText = document.createElement("p");
    if (isHTML) {
        chatText.innerHTML = message;
    } else {
        chatText.textContent = message;
    }
    chatLi.appendChild(chatText);
    chatbox.appendChild(chatLi);
    chatbox.scrollTop = chatbox.scrollHeight;
    return chatText;
}

// Send message event
sendBtn.addEventListener("click", async () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    createChatElement(userMessage, "outgoing");
    chatInput.value = "";

    const loadingMsg = createChatElement("Typing...", "incoming");

    try {
        const response = await fetch("http://127.0.0.1:5000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        if (data.response) {
            const formatted = formatMarkdownToHTML(data.response);
            loadingMsg.innerHTML = formatted;
        } else {
            loadingMsg.textContent = "Something went wrong.";
        }
    } catch (error) {
        loadingMsg.textContent = "Oops! Error occurred.";
        console.error("Error:", error);
    }
});

// Markdown to HTML formatter
export function formatMarkdownToHTML(markdown) {
    // Convert bold and italic text
    markdown = markdown
        .replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>')  // bold + italic
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')             // bold
        .replace(/\*(.*?)\*/g, '<i>$1</i>');                // italic

    // Convert markdown table to HTML table
    const tableRegex = /\|(.+?)\|\n\|(?:[-| ]+)\|\n((?:\|.*\|\n?)*)/;
    const match = markdown.match(tableRegex);

    if (match) {
        const headers = match[1].split("|").map(h => h.trim());
        const rows = match[2].trim().split("\n").map(row =>
            row.split("|").map(cell => cell.trim())
        );

        let html = "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        html += "<thead><tr>" + headers.map(h => `<th style="padding:5px;">${h}</th>`).join("") + "</tr></thead>";
        html += "<tbody>";
        for (const row of rows) {
            html += "<tr>" + row.map(cell => `<td style="padding:5px;">${cell}</td>`).join("") + "</tr>";
        }
        html += "</tbody></table>";

        // Replace table markdown with HTML table
        markdown = markdown.replace(tableRegex, html);
    }

    // Convert newlines to <br>
    return markdown.replace(/\n/g, "<br>");
}
