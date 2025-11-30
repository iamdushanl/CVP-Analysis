// ========================================
// Authentication Manager - Enhanced with Password Hashing
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
     * Migrate old plain text passwords to hashed passwords
     */
    async migratePasswords() {
        const users = this.getAllUsers();
        let migrated = false;

        for (let user of users) {
            // If user has plain text password, migrate it
            if (user.password && !user.passwordHash) {
                user.passwordHash = await this.hashPassword(user.password);
                delete user.password;
                migrated = true;
            }
        }

        if (migrated) {
            localStorage.setItem('cvp_users', JSON.stringify(users));
            console.log('✅ Passwords migrated to hashed format');
        }
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
     * Login user with hashed password
     */
    async login(email, password, rememberMe = false) {
        // For demo: check if user exists or use demo credentials
        const users = this.getAllUsers();

        // Demo quick login (bypass hashing for demo user)
        if (email === 'demo@cvp.com' && password === 'demo') {
            const demoUser = {
                id: 'demo',
                name: 'Demo User',
                email: 'demo@cvp.com',
                role: 'DemoUser',
                avatar_url: null,
                preferences: {
                    currency: 'LKR',
                    dark_mode: false,
                    date_format: 'DD-MM-YYYY',
                    timezone: 'Asia/Colombo'
                },
                created_at: new Date().toISOString()
            };

            localStorage.setItem('cvp_current_user', JSON.stringify(demoUser));
            if (rememberMe) {
                localStorage.setItem('cvp_remember_me', 'true');
            }

            return { success: true, user: demoUser };
        }

        // Hash the provided password
        const hashedPassword = await this.hashPassword(password);

        // Check regular users with hashed password
        const user = users.find(u => u.email === email && u.passwordHash === hashedPassword);

        if (user) {
            // Never store password in current user
            const { passwordHash: _, ...userWithoutPassword } = user;
            localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

            if (rememberMe) {
                localStorage.setItem('cvp_remember_me', 'true');
            }

            return { success: true, user: userWithoutPassword };
        }

        return { success: false, error: 'Invalid email or password' };
    },

    /**
     * Register new user with hashed password
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

        // Check if email already exists
        const users = this.getAllUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create new user with hashed password
        const newUser = {
            id: DataManager.generateUniqueId(),
            name,
            email,
            passwordHash, // Store hashed password
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

        // Auto-login after registration
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('cvp_current_user');
        localStorage.removeItem('cvp_remember_me');
        return { success: true };
    },

    /**
     * Update user profile
     */
    updateProfile(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === currentUser.id);

        if (userIndex === -1) {
            return { success: false, error: 'User not found' };
        }

        // Update user data
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('cvp_users', JSON.stringify(users));

        // Update current user session (without password hash)
        const { passwordHash: _, ...userWithoutPassword } = users[userIndex];
        localStorage.setItem('cvp_current_user', JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
    },

    /**
     * Change password with hashing
     */
    async changePassword(currentPassword, newPassword) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        const users = this.getAllUsers();
        const user = users.find(u => u.id === currentUser.id);

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Hash current password and verify
        const currentHash = await this.hashPassword(currentPassword);
        if (user.passwordHash !== currentHash) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Validate new password
        if (newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters' };
        }

        // Hash and save new password
        user.passwordHash = await this.hashPassword(newPassword);
        localStorage.setItem('cvp_users', JSON.stringify(users));

        return { success: true };
    },

    /**
     * Get all users (admin only)
     */
    getAllUsers() {
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
     * Initialize default users with hashed passwords
     */
    async initializeUsers() {
        const users = this.getAllUsers();

        if (users.length === 0) {
            // Create default admin user with hashed password
            const defaultPassword = 'admin123';
            const passwordHash = await this.hashPassword(defaultPassword);

            const defaultUser = {
                id: DataManager.generateUniqueId(),
                name: 'Admin User',
                email: 'admin@cvp.com',
                passwordHash, // Hashed password
                role: 'Admin',
                avatar_url: null,
                preferences: {
                    currency: 'LKR',
                    dark_mode: false,
                    date_format: 'DD-MM-YYYY',
                    timezone: 'Asia/Colombo'
                },
                created_at: new Date().toISOString()
            };

            localStorage.setItem('cvp_users', JSON.stringify([defaultUser]));
            console.log('✅ Default admin user created');
            console.log('📧 Email: admin@cvp.com');
            console.log('🔑 Password: admin123');
        } else {
            // Migrate any existing plain text passwords
            await this.migratePasswords();
        }
    },

    /**
     * Get avatar initials from name
     */
    getAvatarInitials(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
};

// Initialize users on load (async)
(async () => {
    await AuthManager.initializeUsers();
})();
