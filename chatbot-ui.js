// ========================================
// Prismo UI - AI Assistant Chat Interface
// ========================================

const ChatbotUI = {
    isOpen: false,
    isMinimized: true,
    isTyping: false,

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        if (!ChatbotService.init()) {
            console.log('⚠️ Chatbot not initialized - API key required');
        }

        this.render();
        this.attachEventListeners();
        console.log('💬 Chatbot UI initialized');
    },

    // ============================================
    // RENDER
    // ============================================
    render() {
        const container = document.getElementById('chatbotContainer') || this.createContainer();

        container.innerHTML = `
            <div class="chatbot-widget ${this.isMinimized ? 'minimized' : ''}">
                <!-- Minimized chat button -->
                <button class="chatbot-toggle-btn" id="chatbotToggle" title="Chat with Prismo - AI Assistant">
                </button>

                <!-- Expanded chat window -->
                <div class="chatbot-window" id="chatbotWindow">
                    <!-- Header -->
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <div class="prismo-avatar"></div>
                            <div>
                                <div class="bot-name">Prismo</div>
                                <div class="bot-status">AI-Powered CVP Assistant</div>
                            </div>
                        </div>
                        <div class="chatbot-actions">
                            <button class="chatbot-action-btn" id="chatbotMinimize" title="Minimize">
                                <span>−</span>
                            </button>
                            <button class="chatbot-action-btn" id="chatbotClear" title="Clear Chat">
                                <span>🗑️</span>
                            </button>
                        </div>
                    </div>

                    <!-- Messages area -->
                    <div class="chatbot-messages" id="chatbotMessages">
                        ${this.renderInitialMessage()}
                        ${this.renderHistory()}
                    </div>

                    <!-- Suggested prompts -->
                    <div class="chatbot-suggestions" id="chatbotSuggestions">
                        ${this.renderSuggestedPrompts()}
                    </div>

                    <!-- Input area -->
                    <div class="chatbot-input-area">
                        <textarea 
                            class="chatbot-input" 
                            id="chatbotInput" 
                            placeholder="Ask me about your CVP data..."
                            rows="1"
                        ></textarea>
                        <button class="chatbot-send-btn" id="chatbotSend" title="Send message">
                            <span>→</span>
                        </button>
                    </div>

                    <!-- API Key Setup (shown if not configured) -->
                    ${!ChatbotService.isInitialized ? this.renderAPIKeySetup() : ''}
                </div>
            </div>
        `;
    },

    createContainer() {
        console.log('📦 Creating chatbot container...');
        let container = document.getElementById('chatbotContainer');

        if (!container) {
            container = document.createElement('div');
            container.id = 'chatbotContainer';
            // Ensure the container is visible and positioned correctly
            container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 9999; pointer-events: none;';
            document.body.appendChild(container);
            console.log('✅ Chatbot container created and added to body');
        } else {
            console.log('ℹ️ Chatbot container already exists');
            // Ensure proper styling even if it exists
            container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 9999; pointer-events: none;';
        }

        return container;
    },

    renderInitialMessage() {
        return `
            <div class="chatbot-message bot-message">
                <div class="message-avatar prismo-avatar-small"></div>
                <div class="message-content">
                    <p><strong>👋 Hi! I'm Prismo, your intelligent CVP assistant.</strong> I can help you with:</p>
                    <ul>
                        <li>Break-even calculations</li>
                        <li>Sales analytics</li>
                        <li>Product performance</li>
                        <li>CVP formulas & concepts</li>
                    </ul>
                    <p>Ask me anything about your business data!</p>
                </div>
            </div>
        `;
    },

    renderHistory() {
        const history = ChatbotService.getHistory();
        if (history.length === 0) return '';

        return history.map(msg => {
            const isUser = msg.role === 'user';
            return `
                <div class="chatbot-message ${isUser ? 'user-message' : 'bot-message'}">
                    <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
                    <div class="message-content">
                        ${this.formatMessage(msg.content)}
                    </div>
                </div>
            `;
        }).join('');
    },

    renderSuggestedPrompts() {
        const prompts = ChatbotService.getSuggestedPrompts();
        return prompts.map(prompt => `
            <button class="suggestion-btn" data-prompt="${prompt}">
                ${prompt}
            </button>
        `).join('');
    },

    renderAPIKeySetup() {
        return `
            <div class="chatbot-setup-overlay">
                <div class="setup-message">
                    <p>⚠️ <strong>API Key Required</strong></p>
                    <p>Please configure your Google Gemini API key in Settings to use the AI assistant.</p>
                    <button class="btn-primary" onclick="App.navigate('settings')">Go to Settings</button>
                </div>
            </div>
        `;
    },

    formatMessage(content) {
        // Simple markdown-like formatting
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        return formatted;
    },

    // ============================================
    // EVENT LISTENERS
    // ============================================
    attachEventListeners() {
        // Toggle button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#chatbotToggle')) {
                this.toggle();
            }
        });

        // Minimize button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#chatbotMinimize')) {
                this.minimize();
            }
        });

        // Clear chat button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#chatbotClear')) {
                this.clearChat();
            }
        });

        // Send button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#chatbotSend')) {
                this.sendMessage();
            }
        });

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            const suggestionBtn = e.target.closest('.suggestion-btn');
            if (suggestionBtn) {
                const prompt = suggestionBtn.getAttribute('data-prompt');
                this.sendMessage(prompt);
            }
        });

        // Input enter key
        document.addEventListener('keydown', (e) => {
            const input = document.getElementById('chatbotInput');
            if (e.target === input && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.addEventListener('input', (e) => {
            if (e.target.id === 'chatbotInput') {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }
        });
    },

    // ============================================
    // ACTIONS
    // ============================================
    toggle() {
        if (this.isMinimized) {
            this.maximize();
        } else {
            this.minimize();
        }
    },

    minimize() {
        this.isMinimized = true;
        const widget = document.querySelector('.chatbot-widget');
        if (widget) {
            widget.classList.add('minimized');
        }
    },

    maximize() {
        this.isMinimized = false;
        const widget = document.querySelector('.chatbot-widget');
        if (widget) {
            widget.classList.remove('minimized');
        }

        // Focus input
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        }, 300);

        // Scroll to bottom
        this.scrollToBottom();
    },

    async sendMessage(messageText = null) {
        const input = document.getElementById('chatbotInput');
        const message = messageText || input.value.trim();

        if (!message) return;

        if (!ChatbotService.isInitialized) {
            this.showError('Please configure your API key in Settings first.');
            return;
        }

        // Clear input
        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }

        // Add user message to UI
        this.addMessage(message, true);

        // Hide suggestions
        const suggestions = document.getElementById('chatbotSuggestions');
        if (suggestions) suggestions.style.display = 'none';

        // Show typing indicator
        this.showTyping();

        try {
            // Send to chatbot service
            const response = await ChatbotService.sendMessage(message);

            // Hide typing indicator
            this.hideTyping();

            if (response.success) {
                // Add AI response
                this.addMessage(response.message, false);
            } else {
                this.showError(response.message);
            }
        } catch (error) {
            this.hideTyping();
            this.showError('Sorry, something went wrong. Please try again.');
            console.error('Chat error:', error);
        }

        this.scrollToBottom();
    },

    addMessage(content, isUser) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.innerHTML = `
            <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
            <div class="message-content">
                ${this.formatMessage(content)}
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    },

    showTyping() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    },

    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },

    showError(message) {
        this.addMessage(`⚠️ ${message}`, false);
    },

    clearChat() {
        if (confirm('Clear all chat history?')) {
            ChatbotService.clearHistory();
            this.render();
            this.attachEventListeners();
        }
    },

    scrollToBottom() {
        setTimeout(() => {
            const messagesContainer = document.getElementById('chatbotMessages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    },

    // ============================================
    // PUBLIC API
    // ============================================
    updateAPIKey(apiKey) {
        ChatbotService.setApiKey(apiKey);
        this.render();
        this.attachEventListeners();
    },

    refresh() {
        this.render();
        this.attachEventListeners();
    },

    // Force show the chatbot (debugging/troubleshooting)
    forceShow() {
        console.log('🔧 Force showing chatbot...');
        this.isMinimized = true;
        const container = document.getElementById('chatbotContainer');
        if (!container) {
            console.log('Creating missing container...');
            this.createContainer();
        }
        this.render();
        this.attachEventListeners();

        // Ensure visibility
        const widget = document.querySelector('.chatbot-widget');
        if (widget) {
            widget.style.display = 'block';
            widget.style.visibility = 'visible';
            console.log('✅ Chatbot forced to show');
        } else {
            console.error('❌ Chatbot widget still not found after force show');
        }
    }
};
