// ========================================
// Firebase Service - Core Implementation
// ========================================

// Import Firebase SDKs (using compat version for easier global access in browser)
// The SDKs will be loaded via CDN in index.html

const FirebaseService = {
    auth: null,
    db: null,
    isInitialized: false,

    /**
     * Initialize Firebase
     */
    async init() {
        if (this.isInitialized) return true;

        try {
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK not loaded');
                return false;
            }

            // Check if config is provided
            if (!window.firebaseConfig || window.firebaseConfig.apiKey === "YOUR_API_KEY") {
                console.warn('⚠️ Firebase configuration missing or incomplete');
                return false;
            }

            // Initialize App
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.isInitialized = true;

            console.log('✅ Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            return false;
        }
    },

    // ============================================
    // AUTHENTICATION
    // ============================================

    async signUp(email, password, displayName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (displayName) {
                await user.updateProfile({ displayName });
            }

            // Create user profile in Firestore
            await this.db.collection('users').doc(user.uid).set({
                name: displayName,
                email: email,
                role: 'Admin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {
                    currency: 'LKR',
                    dark_mode: false,
                    date_format: 'DD-MM-YYYY',
                    timezone: 'Asia/Colombo'
                }
            });

            return { success: true, user };
        } catch (error) {
            console.error('❌ Sign up error:', error);
            throw error;
        }
    },

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            throw error;
        }
    },

    async signInWithGoogle() {
        try {
            if (!this.isInitialized) {
                const initialized = await this.init();
                if (!initialized) {
                    const error = new Error('Firebase is not configured correctly');
                    error.code = 'auth/configuration-not-ready';
                    throw error;
                }
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;

            // Check if user profile exists in Firestore, if not create it
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                await this.db.collection('users').doc(user.uid).set({
                    name: user.displayName,
                    email: user.email,
                    role: 'Admin',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    preferences: {
                        currency: 'LKR',
                        dark_mode: false,
                        date_format: 'DD-MM-YYYY',
                        timezone: 'Asia/Colombo'
                    }
                });
            }

            return { success: true, user };
        } catch (error) {
            const fallbackCodes = [
                'auth/popup-blocked',
                'auth/popup-closed-by-user',
                'auth/cancelled-popup-request',
                'auth/operation-not-supported-in-this-environment'
            ];

            if (fallbackCodes.includes(error?.code)) {
                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    await this.auth.signInWithRedirect(provider);
                    return { success: true, redirect: true };
                } catch (redirectError) {
                    console.error('❌ Google redirect sign-in error:', redirectError);
                    throw redirectError;
                }
            }

            console.error('❌ Google Sign-In error:', error);
            throw error;
        }
    },

    async completeRedirectSignIn() {
        if (!this.isInitialized) {
            const initialized = await this.init();
            if (!initialized) return { success: false, user: null };
        }

        try {
            const result = await this.auth.getRedirectResult();

            if (result?.user) {
                return { success: true, user: result.user, fromRedirect: true };
            }

            if (this.auth.currentUser) {
                return { success: true, user: this.auth.currentUser, fromRedirect: false };
            }

            return { success: false, user: null };
        } catch (error) {
            console.error('❌ Failed to complete redirect sign-in:', error);
            return { success: false, user: null, error };
        }
    },

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw error;
        }
    },

    // ============================================
    // FIRESTORE SYNC
    // ============================================

    /**
     * Sync local collection to Firestore
     */
    async syncToCloud(collectionName, dataArray) {
        if (!this.isInitialized) return false;

        const user = this.auth.currentUser;
        if (!user) return false;

        try {
            const userRef = this.db.collection('users').doc(user.uid);
            await userRef.collection(collectionName).doc('data').set({
                items: dataArray,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Synced ${collectionName} to cloud`);
            return true;
        } catch (error) {
            console.error(`❌ Error syncing ${collectionName}:`, error);
            return false;
        }
    },

    /**
     * Pull data from Firestore
     */
    async pullFromCloud(collectionName) {
        if (!this.isInitialized) return null;

        const user = this.auth.currentUser;
        if (!user) return null;

        try {
            const doc = await this.db.collection('users').doc(user.uid)
                .collection(collectionName).doc('data').get();

            if (doc.exists) {
                return doc.data().items;
            }
            return null;
        } catch (error) {
            console.error(`❌ Error pulling ${collectionName}:`, error);
            return null;
        }
    },

    /**
     * Subscribe to real-time updates for a collection
     * @param {string} collectionName - name of the collection to listen to
     * @param {function} callback - function to call with new data
     * @returns {function} unsubscribe function
     */
    subscribeToCollection(collectionName, callback) {
        if (!this.isInitialized) return () => { };

        const user = this.auth.currentUser;
        if (!user) return () => { };

        try {
            console.log(`🔌 Subscribing to ${collectionName}...`);
            return this.db.collection('users').doc(user.uid)
                .collection(collectionName).doc('data')
                .onSnapshot((doc) => {
                    if (!doc.exists) {
                        callback([]);
                        return;
                    }

                    const payload = doc.data();
                    const data = Array.isArray(payload?.items) ? payload.items : [];
                    callback(data);
                }, (error) => {
                    console.error(`❌ Error in ${collectionName} listener:`, error);
                });
        } catch (error) {
            console.error(`❌ Error setting up listener for ${collectionName}:`, error);
            return () => { };
        }
    }
};

// Export service
window.FirebaseService = FirebaseService;
