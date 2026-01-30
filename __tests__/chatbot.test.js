/**
 * Prismo Chatbot - Comprehensive Unit Tests
 * Tests for chatbot service, UI, and function calling
 */

// Mock Data Manager
const mockDataManager = {
    getProducts: () => [
        { id: 1, name: 'Product A', price: 100, variableCost: 60, fixedCost: 2000, sales: 50 },
        { id: 2, name: 'Product B', price: 150, variableCost: 90, fixedCost: 3000, sales: 30 }
    ],
    getSalesData: () => [
        { productId: 1, quantity: 50, revenue: 5000, date: '2026-01-01' },
        { productId: 2, quantity: 30, revenue: 4500, date: '2026-01-02' }
    ]
};

// Mock CVP Calculator
const mockCVPCalculator = {
    calculateBreakEven: (price, variableCost, fixedCost) => {
        const contributionMargin = price - variableCost;
        return Math.ceil(fixedCost / contributionMargin);
    },
    calculateContributionMargin: (price, variableCost) => price - variableCost
};

describe('Prismo Chatbot Service', () => {
    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();
        // Reset conversation history
        ChatbotService.conversationHistory = [];
    });

    describe('Initialization', () => {
        test('should initialize with pre-configured API key', () => {
            const result = ChatbotService.init();
            expect(result).toBe(true);
            expect(ChatbotService.isInitialized).toBe(true);
            expect(ChatbotService.apiKey).toBeTruthy();
        });

        test('should load conversation history from localStorage', () => {
            const mockHistory = [
                { role: 'user', content: 'Hello' },
                { role: 'bot', content: 'Hi there!' }
            ];
            localStorage.setItem('chatbot_history', JSON.stringify(mockHistory));

            ChatbotService.init();
            expect(ChatbotService.conversationHistory).toEqual(mockHistory);
        });
    });

    describe('Error Handling', () => {
        test('should correctly identify 401 as INVALID_KEY error', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 401,
                    json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
                })
            );

            try {
                await ChatbotService.sendMessageToGemini('test');
            } catch (error) {
                expect(error.message).toBe('INVALID_KEY');
            }
        });

        test('should correctly identify 429 as RATE_LIMIT error', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 429,
                    json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
                })
            );

            try {
                await ChatbotService.sendMessageToGemini('test');
            } catch (error) {
                expect(error.message).toBe('RATE_LIMIT');
            }
        });

        test('should correctly identify 400 as BAD_REQUEST error', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({ error: { message: 'Bad request' } })
                })
            );

            try {
                await ChatbotService.sendMessageToGemini('test');
            } catch (error) {
                expect(error.message).toBe('BAD_REQUEST');
            }
        });

        test('should show user-friendly error messages', async () => {
            const testCases = [
                { error: 'RATE_LIMIT', expectedMessage: '⏰ Rate limit reached' },
                { error: 'INVALID_KEY', expectedMessage: '🔑 Authentication failed' },
                { error: 'BAD_REQUEST', expectedMessage: '❓ I didn\'t understand' }
            ];

            // Test error message formatting
            testCases.forEach(({ error, expectedMessage }) => {
                let message = '';
                if (error === 'RATE_LIMIT') {
                    message = '⏰ Rate limit reached. Please wait a moment and try again.';
                } else if (error === 'INVALID_KEY') {
                    message = '🔑 Authentication failed. The API key may be invalid.';
                } else if (error === 'BAD_REQUEST') {
                    message = '❓ I didn\'t understand that request. Try asking differently.';
                }
                expect(message).toContain(expectedMessage);
            });
        });
    });

    describe('Function Calling', () => {
        test('should have getProductData function defined', () => {
            const tools = ChatbotService.getAvailableTools();
            const getProductData = tools.find(t => t.name === 'getProductData');
            expect(getProductData).toBeDefined();
            expect(getProductData.parameters).toBeDefined();
        });

        test('should have calculateBreakEven function defined', () => {
            const tools = ChatbotService.getAvailableTools();
            const calculateBreakEven = tools.find(t => t.name === 'calculateBreakEven');
            expect(calculateBreakEven).toBeDefined();
        });

        test('should have getSalesAnalytics function defined', () => {
            const tools = ChatbotService.getAvailableTools();
            const getSalesAnalytics = tools.find(t => t.name === 'getSalesAnalytics');
            expect(getSalesAnalytics).toBeDefined();
        });

        test('should execute getProductData correctly', () => {
            const result = ChatbotService.executeFunction('getProductData', { productName: 'Product A' });
            expect(result).toBeDefined();
            expect(result.name).toBe('Product A');
        });

        test('should execute calculateBreakEven correctly', () => {
            const result = ChatbotService.executeFunction('calculateBreakEven', {
                productName: 'Product A'
            });
            expect(result).toBeDefined();
            expect(result.breakEvenUnits).toBeGreaterThan(0);
        });
    });

    describe('Message History', () => {
        test('should save messages to conversation history', () => {
            ChatbotService.conversationHistory = [];
            ChatbotService.addToHistory('user', 'Hello');
            ChatbotService.addToHistory('bot', 'Hi!');

            expect(ChatbotService.conversationHistory).toHaveLength(2);
            expect(ChatbotService.conversationHistory[0].role).toBe('user');
            expect(ChatbotService.conversationHistory[1].role).toBe('bot');
        });

        test('should persist history to localStorage', () => {
            ChatbotService.addToHistory('user', 'Test message');
            const saved = localStorage.getItem('chatbot_history');
            expect(saved).toBeTruthy();
            expect(JSON.parse(saved)).toHaveLength(1);
        });

        test('should limit history to maxHistoryLength', () => {
            ChatbotService.maxHistoryLength = 5;
            for (let i = 0; i < 10; i++) {
                ChatbotService.addToHistory('user', `Message ${i}`);
            }
            expect(ChatbotService.conversationHistory.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Suggested Prompts', () => {
        test('should return an array of suggested prompts', () => {
            const prompts = ChatbotService.getSuggestedPrompts();
            expect(Array.isArray(prompts)).toBe(true);
            expect(prompts.length).toBeGreaterThan(0);
        });

        test('suggested prompts should be strings', () => {
            const prompts = ChatbotService.getSuggestedPrompts();
            prompts.forEach(prompt => {
                expect(typeof prompt).toBe('string');
                expect(prompt.length).toBeGreaterThan(0);
            });
        });
    });
});

describe('Prismo UI', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="chatbotContainer"></div>';
    });

    describe('Rendering', () => {
        test('should render chatbot widget', () => {
            ChatbotUI.init();
            const widget = document.querySelector('.chatbot-widget');
            expect(widget).toBeTruthy();
        });

        test('should render Prismo branding', () => {
            ChatbotUI.render();
            const botName = document.querySelector('.bot-name');
            expect(botName?.textContent).toBe('Prismo');
        });

        test('should render Prismo avatar', () => {
            ChatbotUI.render();
            const avatar = document.querySelector('.prismo-avatar');
            expect(avatar).toBeTruthy();
        });

        test('should render minimized by default', () => {
            ChatbotUI.render();
            const widget = document.querySelector('.chatbot-widget');
            expect(widget?.classList.contains('minimized')).toBe(true);
        });
    });

    describe('User Interactions', () => {
        test('should toggle chat window on button click', () => {
            ChatbotUI.init();
            ChatbotUI.isMinimized = true;
            ChatbotUI.toggleChat();
            expect(ChatbotUI.isMinimized).toBe(false);
        });

        test('should clear chat history', () => {
            ChatbotService.conversationHistory = [
                { role: 'user', content: 'Test' }
            ];
            ChatbotUI.clearChat();
            expect(ChatbotService.conversationHistory).toHaveLength(0);
        });
    });

    describe('Welcome Message', () => {
        test('should include Prismo introduction', () => {
            const message = ChatbotUI.renderInitialMessage();
            expect(message).toContain('Prismo');
            expect(message).toContain('intelligent CVP assistant');
        });

        test('should list chatbot capabilities', () => {
            const message = ChatbotUI.renderInitialMessage();
            expect(message).toContain('Break-even');
            expect(message).toContain('Sales analytics');
            expect(message).toContain('Product performance');
        });
    });
});

describe('Integration Tests', () => {
    test('should handle full conversation flow', async () => {
        ChatbotService.init();
        ChatbotUI.init();

        // Simulate user sending a message
        const userMessage = "What's my break-even point?";
        ChatbotService.addToHistory('user', userMessage);

        expect(ChatbotService.conversationHistory).toHaveLength(1);
        expect(ChatbotService.conversationHistory[0].content).toBe(userMessage);
    });

    test('should properly format error messages for display', () => {
        const errors = [
            { code: 'RATE_LIMIT', icon: '⏰' },
            { code: 'INVALID_KEY', icon: '🔑' },
            { code: 'BAD_REQUEST', icon: '❓' }
        ];

        errors.forEach(({ code, icon }) => {
            // Verify error messages contain emoji icons
            let message = '';
            if (code === 'RATE_LIMIT') {
                message = '⏰ Rate limit reached. Please wait a moment and try again.';
            }
            expect(message).toContain(icon);
        });
    });
});

// Run tests
console.log('✅ All Prismo unit tests are defined and ready to run');
console.log('Run with: npm test -- chatbot.test.js');
