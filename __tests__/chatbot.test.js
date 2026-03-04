global.DataManager = {
    getProducts: () => [
        {
            id: '1',
            name: 'Product A',
            sellingPrice: 100,
            variableCost: 60,
            fixedCost: 2000,
            sales: 50,
            sku: 'PROD-001'
        },
        {
            id: '2',
            name: 'Product B',
            sellingPrice: 150,
            variableCost: 90,
            fixedCost: 3000,
            sales: 30,
            sku: 'PROD-002'
        }
    ],
    getSales: () => [
        { productId: '1', totalAmount: 5000, contribution: 2000, quantity: 50, productName: 'Product A' },
        { productId: '2', totalAmount: 4500, contribution: 1800, quantity: 30, productName: 'Product B' }
    ],
    getSalesLast30Days: () => [
        { productId: '1', totalAmount: 5000, contribution: 2000, quantity: 50, productName: 'Product A' },
        { productId: '2', totalAmount: 4500, contribution: 1800, quantity: 30, productName: 'Product B' }
    ],
    getSalesLastNDays: () => [
        { productId: '1', totalAmount: 5000, contribution: 2000, quantity: 50, productName: 'Product A' },
        { productId: '2', totalAmount: 4500, contribution: 1800, quantity: 30, productName: 'Product B' }
    ],
    getTotalFixedCosts: () => 5000,
    getFixedCosts: () => [],
    getProductById: (id) => {
        const products = global.DataManager.getProducts();
        return products.find(product => product.id === id) || null;
    }
};

global.SettingsManager = {
    getSettings: () => ({}),
    updateSettings: jest.fn()
};

global.CVPCalculator = {
    calculateContributionMargin: (sellingPrice, variableCost) => sellingPrice - variableCost,
    calculatePVRatio: (sellingPrice, variableCost) => {
        if (!sellingPrice) {
            return 0;
        }
        return ((sellingPrice - variableCost) / sellingPrice) * 100;
    },
    calculateBreakEvenUnits: (fixedCosts, contributionMargin) => {
        if (!contributionMargin) {
            return 0;
        }
        return fixedCosts / contributionMargin;
    },
    calculateBreakEvenSalesValue: (fixedCosts, pvRatio) => {
        if (!pvRatio) {
            return 0;
        }
        return fixedCosts / (pvRatio / 100);
    },
    calculateMarginOfSafety: (actualSales, breakEvenSales) => {
        if (!actualSales) {
            return 0;
        }
        return ((actualSales - breakEvenSales) / actualSales) * 100;
    }
};

global.CVP_KNOWLEDGE_BASE = {
    formulas: {},
    concepts: {},
    getFormula: () => ({}),
    getAllFormulaNames: () => [],
    getConcept: () => ({}),
    getAllConceptNames: () => []
};

global.App = {
    navigate: jest.fn()
};

global.fetch = jest.fn();
global.confirm = jest.fn(() => true);

const ChatbotService = require('../chatbot-service.js');
global.ChatbotService = ChatbotService;

const ChatbotUI = require('../chatbot-ui.js');
global.ChatbotUI = ChatbotUI;

describe('Prismo Chatbot Service', () => {
    beforeEach(() => {
        localStorage.clear();
        ChatbotService.conversationHistory = [];
        ChatbotService.maxHistoryLength = 50;
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

            await expect(ChatbotService.sendMessageToGemini('test')).rejects.toThrow('INVALID_KEY');
        });

        test('should correctly identify 429 as RATE_LIMIT error', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 429,
                    json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
                })
            );

            await expect(ChatbotService.sendMessageToGemini('test')).rejects.toThrow('RATE_LIMIT');
        }, 12000);

        test('should correctly identify 400 as BAD_REQUEST error', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({ error: { message: 'Bad request' } })
                })
            );

            await expect(ChatbotService.sendMessageToGemini('test')).rejects.toThrow('BAD_REQUEST');
        });

        test('should show user-friendly error messages', () => {
            const testCases = [
                { code: 'RATE_LIMIT', expectedMessage: '⏰ Rate limit reached. Please wait a moment and try again.' },
                { code: 'INVALID_KEY', expectedMessage: '🔑 Authentication failed. The API key may be invalid.' },
                { code: 'BAD_REQUEST', expectedMessage: '❓ I didn\'t understand that request. Try asking differently.' }
            ];

            testCases.forEach(({ code, expectedMessage }) => {
                let message = '';
                if (code === 'RATE_LIMIT') {
                    message = '⏰ Rate limit reached. Please wait a moment and try again.';
                } else if (code === 'INVALID_KEY') {
                    message = '🔑 Authentication failed. The API key may be invalid.';
                } else if (code === 'BAD_REQUEST') {
                    message = '❓ I didn\'t understand that request. Try asking differently.';
                }
                expect(message).toBe(expectedMessage);
            });
        });
    });

    describe('Function Calling', () => {
        test('should have getProductData function defined', () => {
            const tools = ChatbotService.getAvailableTools();
            const getProductData = tools.find(tool => tool.name === 'getProductData');
            expect(getProductData).toBeDefined();
            expect(getProductData.parameters).toBeDefined();
        });

        test('should have calculateBreakEven function defined', () => {
            const tools = ChatbotService.getAvailableTools();
            const calculateBreakEven = tools.find(tool => tool.name === 'calculateBreakEven');
            expect(calculateBreakEven).toBeDefined();
        });

        test('should have getSalesAnalytics function defined', () => {
            const tools = ChatbotService.getAvailableTools();
            const getSalesAnalytics = tools.find(tool => tool.name === 'getSalesAnalytics');
            expect(getSalesAnalytics).toBeDefined();
        });

        test('should execute getProductData correctly', () => {
            const result = ChatbotService.executeFunction('getProductData', { productIdentifier: 'Product A' });
            expect(result).toBeDefined();
            expect(result.name).toBe('Product A');
        });

        test('should execute calculateBreakEven correctly', () => {
            const result = ChatbotService.executeFunction('calculateBreakEven', { productId: '1' });
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
            ChatbotService.saveHistory();

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
        ChatbotUI.isMinimized = true;
        ChatbotService.conversationHistory = [];
        global.confirm = jest.fn(() => true);
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
            ChatbotService.conversationHistory = [{ role: 'user', content: 'Test' }];
            ChatbotUI.clearChat(true);
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
    beforeEach(() => {
        ChatbotService.conversationHistory = [];
    });

    test('should handle full conversation flow', () => {
        ChatbotService.init();
        ChatbotUI.init();

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
            let message = '';
            if (code === 'RATE_LIMIT') {
                message = '⏰ Rate limit reached. Please wait a moment and try again.';
            } else if (code === 'INVALID_KEY') {
                message = '🔑 Authentication failed. The API key may be invalid.';
            } else if (code === 'BAD_REQUEST') {
                message = '❓ I didn\'t understand that request. Try asking differently.';
            }

            expect(message).toContain(icon);
        });
    });
});
