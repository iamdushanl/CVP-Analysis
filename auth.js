// ========================================
// Authentication Manager - Enhanced with IndexedDB
// ========================================

const AuthManager = {
    /**
     * Hash password using SHA-256
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Hashed password
     */
    async hashPassword(password) {
        try {
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Error hashing password:', error);
            // Fallback to simple hash if crypto API fails
            return this.simpleHash(password);
        }
    },

    /**
     * Simple fallback hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },

    /**
     * Generate unique session token
     */
    generateToken() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const user = this.getCurrentUser();
        return user !== null && user.id;
    },

    /**
     * Get current logged-in user
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('cvp_current_user');
        if (!userStr) {
            return null;
        }
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    },

    /**
     * Login user with hashed password (IndexedDB)
     */
    async login(email, password, rememberMe = false) {
        // ... (existing code stays same)
    },

    /**
     * Handle login via Firebase (Social or after external sync)
     */
    async loginWithFirebase(fbUser) {
        try {
            // Check local database for this user
            const localUser = await DBService.getUserByEmail(fbUser.email);

            let user;
            if (!localUser) {
                // Create local record if it doesn't exist
                user = {
                    id: fbUser.uid,
                    name: fbUser.displayName || fbUser.email.split('@')[0],
                    email: fbUser.email,
                    role: 'Admin',
                    preferences: {
                        currency: 'LKR',
                        dark_mode: false,
                        date_format: 'DD-MM-YYYY',
                        timezone: 'Asia/Colombo'
                    },
                    created_at: new Date().toISOString(),
                    last_login: new Date().toISOString()
                };
                await DBService.addUser(user);
            } else {
                user = localUser;
                user.last_login = new Date().toISOString();
                await DBService.updateUser(user);
            }

            // Store current user session
            localStorage.setItem('cvp_current_user', JSON.stringify(user));

            // Sync data from cloud
            this.syncDataFromCloud();

            return { success: true, user };
        } catch (error) {
            console.error('❌ loginWithFirebase error:', error);
            throw error;
        }
    },

    /**
     * Fallback login with localStorage
     */
    async loginWithLocalStorage(email, password, rememberMe) {
        const users = this.getAllUsersFromLocalStorage();
        const hashedPassword = await this.hashPassword(password);
        const user = users.find(u => u.email === email && u.passwordHash === hashedPassword);

        if (user) {
            const { passwordHash, ...userWithoutPassword } = user;
            localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

            if (rememberMe) {
                localStorage.setItem('cvp_remember_me', 'true');
            }

            return { success: true, user: userWithoutPassword };
        }

        return { success: false, error: 'Invalid email or password' };
    },

    /**
     * Register new user (IndexedDB)
     */
    async register(userData) {
        const { name, email, password, timezone, currency } = userData;

        // Validation
        if (!name || !email || !password) {
            return { success: false, error: 'All fields are required' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        try {
            // 1. Try Firebase Registration
            let firebaseUser = null;
            if (FirebaseService.isInitialized) {
                try {
                    const fbResult = await FirebaseService.signUp(email, password, name);
                    firebaseUser = fbResult.user;
                } catch (fbError) {
                    console.error('⚠️ Firebase registration failed:', fbError);
                    return { success: false, error: 'Cloud registration failed: ' + fbError.message };
                }
            }

            // 2. Local Registration (IndexedDB)
            if (!DBService.isReady()) {
                console.warn('⚠️ Database not ready, falling back to localStorage');
                return this.registerWithLocalStorage(userData);
            }

            // Check if email already exists locally
            const existingUser = await DBService.getUserByEmail(email);
            if (existingUser) {
                return { success: false, error: 'Email already registered' };
            }

            // Hash password
            const passwordHash = await this.hashPassword(password);

            // Create new user
            const newUser = {
                id: firebaseUser ? firebaseUser.uid : DataManager.generateUniqueId(),
                name,
                email,
                passwordHash,
                role: 'Admin',
                avatar_url: null,
                preferences: {
                    currency: currency || 'LKR',
                    dark_mode: false,
                    date_format: 'DD-MM-YYYY',
                    timezone: timezone || 'Asia/Colombo'
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                failed_login_attempts: 0,
                account_locked: false
            };

            await DBService.addUser(newUser);

            // Auto-login after registration
            const { passwordHash: _, ...userWithoutPassword } = newUser;
            localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

            return { success: true, user: userWithoutPassword };

        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: 'An error occurred during registration' };
        }
    },

    /**
     * Fallback register with localStorage
     */
    async registerWithLocalStorage(userData) {
        const { name, email, password, timezone, currency } = userData;
        const users = this.getAllUsersFromLocalStorage();

        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }

        const passwordHash = await this.hashPassword(password);

        const newUser = {
            id: DataManager.generateUniqueId(),
            name,
            email,
            passwordHash,
            role: 'Admin',
            avatar_url: null,
            preferences: {
                currency: currency || 'LKR',
                dark_mode: false,
                date_format: 'DD-MM-YYYY',
                timezone: timezone || 'Asia/Colombo'
            },
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('cvp_users', JSON.stringify(users));

        const { passwordHash: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            // 1. Firebase Logout
            if (FirebaseService.isInitialized) {
                await FirebaseService.signOut();
            }

            // 2. Remove session from database if exists
            const sessionToken = localStorage.getItem('cvp_session_token');
            if (sessionToken && DBService.isReady()) {
                await DBService.deleteSession(sessionToken);
            }

            localStorage.removeItem('cvp_current_user');
            localStorage.removeItem('cvp_remember_me');
            localStorage.removeItem('cvp_session_token');

            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: true }; // Still logout even if session deletion fails
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            if (DBService.isReady()) {
                const user = await DBService.getUserById(currentUser.id);
                if (!user) {
                    return { success: false, error: 'User not found' };
                }

                const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
                await DBService.updateUser(updatedUser);

                const { passwordHash, ...userWithoutPassword } = updatedUser;
                localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

                return { success: true, user: userWithoutPassword };
            } else {
                // Fallback to localStorage
                const users = this.getAllUsersFromLocalStorage();
                const userIndex = users.findIndex(u => u.id === currentUser.id);

                if (userIndex === -1) {
                    return { success: false, error: 'User not found' };
                }

                users[userIndex] = { ...users[userIndex], ...updates };
                localStorage.setItem('cvp_users', JSON.stringify(users));

                const { passwordHash, ...userWithoutPassword } = users[userIndex];
                localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

                return { success: true, user: userWithoutPassword };
            }
        } catch (error) {
            console.error('❌ Update profile error:', error);
            return { success: false, error: 'Failed to update profile' };
        }
    },

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters' };
        }

        try {
            if (DBService.isReady()) {
                const user = await DBService.getUserById(currentUser.id);
                if (!user) {
                    return { success: false, error: 'User not found' };
                }

                const currentHash = await this.hashPassword(currentPassword);
                if (user.passwordHash !== currentHash) {
                    return { success: false, error: 'Current password is incorrect' };
                }

                user.passwordHash = await this.hashPassword(newPassword);
                user.updated_at = new Date().toISOString();
                await DBService.updateUser(user);

                return { success: true };
            } else {
                // Fallback to localStorage
                const users = this.getAllUsersFromLocalStorage();
                const user = users.find(u => u.id === currentUser.id);

                if (!user) {
                    return { success: false, error: 'User not found' };
                }

                const currentHash = await this.hashPassword(currentPassword);
                if (user.passwordHash !== currentHash) {
                    return { success: false, error: 'Current password is incorrect' };
                }

                user.passwordHash = await this.hashPassword(newPassword);
                localStorage.setItem('cvp_users', JSON.stringify(users));

                return { success: true };
            }
        } catch (error) {
            console.error('❌ Change password error:', error);
            return { success: false, error: 'Failed to change password' };
        }
    },

    /**
     * Get all users from localStorage (fallback)
     */
    getAllUsersFromLocalStorage() {
        const usersStr = localStorage.getItem('cvp_users');
        if (!usersStr) {
            return [];
        }
        try {
            return JSON.parse(usersStr);
        } catch (e) {
            return [];
        }
    },

    /**
     * Get all users (admin only)
     */
    async getAllUsers() {
        try {
            if (DBService.isReady()) {
                return await DBService.getAllUsers();
            } else {
                return this.getAllUsersFromLocalStorage();
            }
        } catch (error) {
            console.error('❌ Get all users error:', error);
            return [];
        }
    },

    /**
     * Initialize default users
     */
    async initializeUsers() {
        // Init Firebase
        await FirebaseService.init();

        try {
            const users = await this.getAllUsers();

            if (users.length === 0) {
                const defaultPassword = 'admin123';
                const passwordHash = await this.hashPassword(defaultPassword);

                const defaultUser = {
                    id: DataManager.generateUniqueId(),
                    name: 'Admin User',
                    email: 'admin@cvp.com',
                    passwordHash,
                    role: 'Admin',
                    avatar_url: null,
                    preferences: {
                        currency: 'LKR',
                        dark_mode: false,
                        date_format: 'DD-MM-YYYY',
                        timezone: 'Asia/Colombo'
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_login: null,
                    failed_login_attempts: 0,
                    account_locked: false
                };

                if (DBService.isReady()) {
                    await DBService.addUser(defaultUser);
                } else {
                    localStorage.setItem('cvp_users', JSON.stringify([defaultUser]));
                }

                console.log('✅ Default admin user created');
                console.log('📧 Email: admin@cvp.com');
                console.log('🔑 Password: admin123');
            }
        } catch (error) {
            console.error('❌ Initialize users error:', error);
        }
    },

    /**
     * Get avatar initials from name or user object
     */
    getAvatarInitials(nameOrUser) {
        if (!nameOrUser) return '?';

        let name = '';
        if (typeof nameOrUser === 'object') {
            name = nameOrUser.name || nameOrUser.email || '?';
        } else {
            name = nameOrUser;
        }

        const parts = name.trim().split(/[ @._-]/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Sync all data from cloud
     */
    async syncDataFromCloud() {
        if (!FirebaseService.isInitialized) return;

        console.log('🔄 Syncing data from cloud...');

        const products = await FirebaseService.pullFromCloud('products');
        if (products) {
            DataManager.saveProducts(products);
            console.log('✅ Synced products from cloud');
        }

        const sales = await FirebaseService.pullFromCloud('sales');
        if (sales) {
            DataManager.saveSales(sales);
            console.log('✅ Synced sales from cloud');
        }

        const fixedCosts = await FirebaseService.pullFromCloud('fixed_costs');
        if (fixedCosts) {
            DataManager.saveFixedCosts(fixedCosts);
            console.log('✅ Synced fixed costs from cloud');
        }
    }
};

// Initialize users on load (async)
(async () => {
    // Wait for database to be ready
    let retries = 0;
    const maxRetries = 10;

    while (!DBService.isReady() && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }

    await AuthManager.initializeUsers();
})();
