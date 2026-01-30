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
            const provider = new firebase.auth.GoogleAuthProvider();
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
            console.error('❌ Google Sign-In error:', error);
            throw error;
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
    }
};

// Export service
window.FirebaseService = FirebaseService;
