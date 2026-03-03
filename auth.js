// ========================================
// Authentication Manager
// ========================================

const AuthManager = {
    currentUserKey: 'cvp_current_user',
    userProfilesKey: 'cvp_user_profiles',

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.currentUserKey);
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch (error) {
            console.error('❌ Failed to read current user:', error);
            return null;
        }
    },

    setCurrentUser(user) {
        if (!user) {
            localStorage.removeItem(this.currentUserKey);
            return;
        }

        const safeUser = {
            id: user.id || user.uid || user.email,
            uid: user.uid || user.id || user.email,
            name: user.name || user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: user.role || 'Admin',
            created_at: user.created_at || user.createdAt || new Date().toISOString(),
            preferences: {
                currency: user.preferences?.currency || 'LKR',
                dark_mode: user.preferences?.dark_mode ?? false,
                date_format: user.preferences?.date_format || 'DD-MM-YYYY'
            }
        };

        localStorage.setItem(this.currentUserKey, JSON.stringify(safeUser));
    },

    isAuthenticated() {
        const localUser = this.getCurrentUser();
        if (localUser) return true;

        const firebaseUser = FirebaseService?.auth?.currentUser;
        if (firebaseUser) {
            this.setCurrentUser({
                uid: firebaseUser.uid,
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                role: 'Admin',
                created_at: new Date().toISOString(),
                preferences: {
                    currency: 'LKR',
                    dark_mode: false,
                    date_format: 'DD-MM-YYYY'
                }
            });
            return true;
        }

        return false;
    },

    getAvatarInitials(user = null) {
        const profile = user || this.getCurrentUser();
        if (!profile) return 'U';

        const name = (profile.name || '').trim();
        if (!name) return 'U';

        const parts = name.split(' ').filter(Boolean);
        if (parts.length === 1) {
            return parts[0].slice(0, 1).toUpperCase();
        }

        return (parts[0][0] + parts[1][0]).toUpperCase();
    },

    async ensureFirebaseReady() {
        if (typeof FirebaseService === 'undefined') return false;
        if (FirebaseService.isInitialized) return true;

        try {
            return await FirebaseService.init();
        } catch (error) {
            console.warn('⚠️ Firebase init failed:', error);
            return false;
        }
    },

    getStoredProfiles() {
        try {
            const profiles = JSON.parse(localStorage.getItem(this.userProfilesKey) || '{}');
            return profiles && typeof profiles === 'object' ? profiles : {};
        } catch {
            return {};
        }
    },

    saveStoredProfile(profile) {
        if (!profile?.uid && !profile?.id && !profile?.email) return;

        const key = profile.uid || profile.id || profile.email;
        const profiles = this.getStoredProfiles();
        profiles[key] = {
            id: profile.id || profile.uid || profile.email,
            uid: profile.uid || profile.id || profile.email,
            name: profile.name || profile.displayName || profile.email?.split('@')[0] || 'User',
            email: profile.email || '',
            role: profile.role || 'Admin',
            created_at: profile.created_at || new Date().toISOString(),
            preferences: {
                currency: profile.preferences?.currency || 'LKR',
                dark_mode: profile.preferences?.dark_mode ?? false,
                date_format: profile.preferences?.date_format || 'DD-MM-YYYY'
            }
        };

        localStorage.setItem(this.userProfilesKey, JSON.stringify(profiles));
    },

    getStoredProfileByUser(user) {
        if (!user) return null;

        const profiles = this.getStoredProfiles();
        const key = user.uid || user.id || user.email;
        return profiles[key] || null;
    },

    async login(email, password, remember = true) {
        if (!email || !password) {
            return { success: false, error: 'Email and password are required' };
        }

        const firebaseReady = await this.ensureFirebaseReady();

        if (firebaseReady) {
            try {
                const result = await FirebaseService.signIn(email, password);
                if (!result?.success || !result.user) {
                    return { success: false, error: 'Login failed. Please try again.' };
                }

                await this.loginWithFirebase(result.user, remember);
                return { success: true, user: this.getCurrentUser() };
            } catch (error) {
                console.error('❌ Login failed:', error);
                return { success: false, error: 'Invalid email or password' };
            }
        }

        return { success: false, error: 'Authentication service is unavailable' };
    },

    async register({ name, email, password, currency = 'LKR' }) {
        if (!name || !email || !password) {
            return { success: false, error: 'Name, email, and password are required' };
        }

        const firebaseReady = await this.ensureFirebaseReady();
        if (!firebaseReady) {
            return { success: false, error: 'Authentication service is unavailable' };
        }

        try {
            const result = await FirebaseService.signUp(email, password, name);
            if (!result?.success || !result.user) {
                return { success: false, error: 'Registration failed. Please try again.' };
            }

            const profile = {
                uid: result.user.uid,
                id: result.user.uid,
                name,
                email,
                role: 'Admin',
                created_at: new Date().toISOString(),
                preferences: {
                    currency,
                    dark_mode: false,
                    date_format: 'DD-MM-YYYY'
                }
            };

            this.saveStoredProfile(profile);
            this.setCurrentUser(profile);
            return { success: true, user: profile };
        } catch (error) {
            console.error('❌ Registration failed:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    },

    async loginWithFirebase(firebaseUser, remember = true) {
        if (!firebaseUser) {
            return { success: false, error: 'Invalid user' };
        }

        const storedProfile = this.getStoredProfileByUser(firebaseUser);

        const mergedProfile = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            name: storedProfile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || storedProfile?.email || '',
            role: storedProfile?.role || 'Admin',
            created_at: storedProfile?.created_at || new Date().toISOString(),
            preferences: {
                currency: storedProfile?.preferences?.currency || 'LKR',
                dark_mode: storedProfile?.preferences?.dark_mode ?? false,
                date_format: storedProfile?.preferences?.date_format || 'DD-MM-YYYY'
            }
        };

        if (!remember) {
            // App currently relies on localStorage for sync/session checks.
            // Keep behavior consistent by still persisting user profile.
        }

        this.saveStoredProfile(mergedProfile);
        this.setCurrentUser(mergedProfile);

        return { success: true, user: mergedProfile };
    },

    updateProfile(updates = {}) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const updatedUser = {
            ...user,
            name: updates.name ?? user.name,
            email: updates.email ?? user.email
        };

        this.setCurrentUser(updatedUser);
        this.saveStoredProfile(updatedUser);
        return { success: true, user: updatedUser };
    },

    updatePreferences(updates = {}) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const updatedUser = {
            ...user,
            preferences: {
                ...(user.preferences || {}),
                ...updates
            }
        };

        this.setCurrentUser(updatedUser);
        this.saveStoredProfile(updatedUser);
        return { success: true, user: updatedUser };
    },

    async changePassword(currentPassword, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters' };
        }

        const firebaseReady = await this.ensureFirebaseReady();
        if (!firebaseReady || !FirebaseService?.auth?.currentUser) {
            return { success: false, error: 'Password change requires an active Firebase session' };
        }

        try {
            const currentUser = FirebaseService.auth.currentUser;
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
            await currentUser.reauthenticateWithCredential(credential);
            await currentUser.updatePassword(newPassword);
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to change password:', error);
            return { success: false, error: 'Failed to change password. Please check current password.' };
        }
    },

    async logout() {
        try {
            if (typeof DataManager !== 'undefined' && typeof DataManager.stopRealtimeSync === 'function') {
                DataManager.stopRealtimeSync();
            }

            if (typeof DataManager !== 'undefined' && typeof DataManager.clearAll === 'function') {
                DataManager.clearAll();
            }

            const firebaseReady = await this.ensureFirebaseReady();
            if (firebaseReady) {
                await FirebaseService.signOut();
            }
        } catch (error) {
            console.warn('⚠️ Logout warning:', error);
        } finally {
            localStorage.removeItem(this.currentUserKey);
        }

        return { success: true };
    },

    async hydrateSessionFromFirebase() {
        if (this.getCurrentUser()) {
            return true;
        }

        const firebaseReady = await this.ensureFirebaseReady();
        if (!firebaseReady) {
            return false;
        }

        try {
            const redirectResult = await FirebaseService.completeRedirectSignIn?.();
            const firebaseUser = redirectResult?.user || FirebaseService?.auth?.currentUser;

            if (!firebaseUser) {
                return false;
            }

            await this.loginWithFirebase(firebaseUser);
            return true;
        } catch (error) {
            console.warn('⚠️ Unable to hydrate session from Firebase:', error);
            return false;
        }
    }
};

if (typeof window !== 'undefined') {
    window.AuthManager = AuthManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
