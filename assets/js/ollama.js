// Ollama API endpoint
const OLLAMA_API = 'http://localhost:11434';

// DOM Elements
const modelSelect = document.getElementById('model-select');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const errorContainer = document.querySelector('.error-container');
const chatContainer = document.querySelector('.chat-container');
const loadingIndicator = document.querySelector('.loading');
const typingIndicator = document.querySelector('.typing-indicator');
const contextToggle = document.getElementById('context-toggle');
const contextContent = document.getElementById('context-content');
const contextMessages = document.getElementById('context-messages');

// State
let selectedModel = null;
let isOllamaRunning = false;
let conversationHistory = [];

// System message to help maintain consistent responses
const systemMessage = {
    role: "system",
    content: "You are a helpful AI assistant. Maintain a natural conversational style and provide accurate, relevant responses."
};

// Check if Ollama is running
async function checkOllamaStatus() {
    try {
        const response = await fetch(`${OLLAMA_API}/api/tags`);
        if (response.ok) {
            isOllamaRunning = true;
            errorContainer.classList.remove('visible');
            chatContainer.style.display = 'flex';
            loadingIndicator.classList.remove('visible');
            return true;
        }
    } catch (error) {
        console.error('Ollama is not running:', error);
    }
    isOllamaRunning = false;
    errorContainer.classList.add('visible');
    chatContainer.style.display = 'none';
    loadingIndicator.classList.remove('visible');
    return false;
}

// Load available models
async function loadModels() {
    try {
        const response = await fetch(`${OLLAMA_API}/api/tags`);
        if (!response.ok) throw new Error('Failed to fetch models');
        
        const data = await response.json();
        const models = data.models || [];
        
        // Clear existing options
        modelSelect.innerHTML = '';
        
        // Add models to select
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        
        // Select first model if available
        if (models.length > 0) {
            selectedModel = models[0].name;
            modelSelect.value = selectedModel;
            enableChat();
        }
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

// Enable chat interface
function enableChat() {
    userInput.disabled = false;
    sendButton.disabled = false;
}

// Format conversation history for the API
function formatConversationHistory() {
    let formattedHistory = systemMessage.content + "\n\n";
    conversationHistory.forEach((msg, index) => {
        if (msg.role === "user") {
            formattedHistory += "Human: " + msg.content + "\n";
        } else {
            formattedHistory += "Assistant: " + msg.content + "\n";
        }
    });
    return formattedHistory;
}

// Update context display
function updateContextDisplay() {
    if (!contextMessages) return;
    
    contextMessages.innerHTML = '';
    conversationHistory.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `context-message ${msg.role === 'user' ? 'user' : ''}`;
        msgDiv.textContent = `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`;
        contextMessages.appendChild(msgDiv);
    });
}

// Show typing indicator
function showTypingIndicator() {
    if (typingIndicator.classList.contains('visible')) return;
    
    // Remove any existing typing indicator
    const existingIndicator = document.querySelector('.typing-indicator.visible');
    if (existingIndicator) {
        existingIndicator.classList.remove('visible');
    }

    // Show the typing indicator
    typingIndicator.classList.add('visible');
    
    // Move typing indicator to the end of chat messages
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.classList.remove('visible');
    // Move typing indicator back to its original position
    chatContainer.insertBefore(typingIndicator, chatMessages.nextSibling);
}

// Add message to chat
function addMessage(content, isUser = false) {
    // Hide typing indicator before adding message
    hideTypingIndicator();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Add message to conversation history
    conversationHistory.push({
        role: isUser ? "user" : "assistant",
        content: content
    });

    // Update context display
    updateContextDisplay();
}

// Send message to Ollama
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || !selectedModel) return;

    // Disable input and button while processing
    userInput.disabled = true;
    sendButton.disabled = true;

    // Add user message to chat
    addMessage(message, true);
    userInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Check if the model is a DeepSeek model
        const isDeepSeek = selectedModel.toLowerCase().includes('deepseek');
        
        // Add a small delay for DeepSeek models to show the thinking state
        if (isDeepSeek) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const response = await fetch(`${OLLAMA_API}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: selectedModel,
                prompt: formatConversationHistory() + "\nHuman: " + message + "\nAssistant:",
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get response from Ollama');
        }

        const data = await response.json();
        
        // Clean up the response by removing think tags and their content
        const cleanResponse = data.response.replace(/<think[^>]*>[\s\S]*?<\/think>/g, '').trim();
        // Remove any extra whitespace or newlines that might be left
        const finalResponse = cleanResponse.replace(/\n\s*\n/g, '\n').trim();
        addMessage(finalResponse);
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.');
    } finally {
        // Re-enable input and button
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
modelSelect.addEventListener('change', (e) => {
    selectedModel = e.target.value;
    // Clear conversation history when model changes
    conversationHistory = [];
    // Clear chat messages
    chatMessages.innerHTML = '';
    // Add welcome message back
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <h3>Welcome to Ollama Chat!</h3>
        <p>Select a model from the dropdown above to start chatting.</p>
        <p>You can ask questions, get help with coding, or have a general conversation.</p>
    `;
    chatMessages.appendChild(welcomeDiv);
    enableChat();
});

sendButton.addEventListener('click', () => {
    sendMessage();
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

// Initialize
async function init() {
    const isRunning = await checkOllamaStatus();
    if (isRunning) {
        await loadModels();
    }

    // Add context toggle functionality
    if (contextToggle && contextContent) {
        contextToggle.addEventListener('click', () => {
            contextToggle.classList.toggle('active');
            contextContent.classList.toggle('visible');
            if (contextContent.classList.contains('visible')) {
                contextToggle.textContent = 'Hide Context';
            } else {
                contextToggle.textContent = 'Show Context';
            }
        });
    }
}

// Start the application
init(); 