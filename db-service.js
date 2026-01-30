// ========================================
// Database Service - IndexedDB Implementation
// ========================================

const DBService = {
    dbName: 'CVPIntelligenceDB',
    version: 1,
    db: null,

    /**
     * Initialize the database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('❌ Database failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create users object store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('created_at', 'created_at', { unique: false });
                    console.log('✅ Users store created');
                }

                // Create sessions object store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'token' });
                    sessionStore.createIndex('user_id', 'user_id', { unique: false });
                    sessionStore.createIndex('expires_at', 'expires_at', { unique: false });
                    console.log('✅ Sessions store created');
                }

                // Create settings object store
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                    console.log('✅ Settings store created');
                }
            };
        });
    },

    /**
     * Add a user to the database
     */
    async addUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.add(user);

            request.onsuccess = () => {
                console.log('✅ User added:', user.email);
                resolve(user);
            };

            request.onerror = () => {
                console.error('❌ Error adding user:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('email');
            const request = index.get(email);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Error getting user:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Get user by ID
     */
    async getUserById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Error getting user:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Get all users
     */
    async getAllUsers() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('❌ Error getting users:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Update user
     */
    async updateUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(user);

            request.onsuccess = () => {
                console.log('✅ User updated:', user.email);
                resolve(user);
            };

            request.onerror = () => {
                console.error('❌ Error updating user:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Delete user
     */
    async deleteUser(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('✅ User deleted:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ Error deleting user:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Add session
     */
    async addSession(session) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.add(session);

            request.onsuccess = () => {
                console.log('✅ Session created');
                resolve(session);
            };

            request.onerror = () => {
                console.error('❌ Error adding session:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Get session by token
     */
    async getSession(token) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore('sessions');
            const request = store.get(token);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('❌ Error getting session:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Delete session
     */
    async deleteSession(token) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const request = store.delete(token);

            request.onsuccess = () => {
                console.log('✅ Session deleted');
                resolve(true);
            };

            request.onerror = () => {
                console.error('❌ Error deleting session:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Clean expired sessions
     */
    async cleanExpiredSessions() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readwrite');
            const store = transaction.objectStore('sessions');
            const index = store.index('expires_at');
            const now = new Date().toISOString();
            const range = IDBKeyRange.upperBound(now);
            const request = index.openCursor(range);

            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    console.log(`✅ Cleaned ${deletedCount} expired sessions`);
                    resolve(deletedCount);
                }
            };

            request.onerror = () => {
                console.error('❌ Error cleaning sessions:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Migrate data from localStorage to IndexedDB
     */
    async migrateFromLocalStorage() {
        try {
            // Migrate users
            const usersStr = localStorage.getItem('cvp_users');
            if (usersStr) {
                const users = JSON.parse(usersStr);
                console.log(`🔄 Migrating ${users.length} users from localStorage...`);

                for (const user of users) {
                    try {
                        await this.addUser(user);
                    } catch (error) {
                        // User might already exist, try updating
                        if (error.name === 'ConstraintError') {
                            await this.updateUser(user);
                        }
                    }
                }

                console.log('✅ Users migrated successfully');
                // Keep localStorage as backup for now
                // localStorage.removeItem('cvp_users');
            }

            // Migrate current user session
            const currentUserStr = localStorage.getItem('cvp_current_user');
            if (currentUserStr) {
                const currentUser = JSON.parse(currentUserStr);
                console.log('✅ Current user session preserved');
            }

            return true;
        } catch (error) {
            console.error('❌ Migration error:', error);
            return false;
        }
    },

    /**
     * Save setting
     */
    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value, updated_at: new Date().toISOString() });

            request.onsuccess = () => {
                resolve(value);
            };

            request.onerror = () => {
                console.error('❌ Error saving setting:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Get setting
     */
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };

            request.onerror = () => {
                console.error('❌ Error getting setting:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * Export all data (for backup)
     */
    async exportData() {
        try {
            const users = await this.getAllUsers();
            const data = {
                version: this.version,
                exported_at: new Date().toISOString(),
                users: users.map(u => {
                    // Don't export password hashes
                    const { passwordHash, ...userWithoutPassword } = u;
                    return userWithoutPassword;
                })
            };
            return data;
        } catch (error) {
            console.error('❌ Export error:', error);
            throw error;
        }
    },

    /**
     * Check if database is ready
     */
    isReady() {
        return this.db !== null;
    }
};

// Initialize database on load
(async () => {
    try {
        await DBService.init();
        await DBService.migrateFromLocalStorage();
        await DBService.cleanExpiredSessions();
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        console.log('⚠️ Falling back to localStorage');
    }
})();
