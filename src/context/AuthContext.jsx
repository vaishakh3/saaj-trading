import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if Firebase auth is available
        if (!auth) {
            console.log('Firebase auth not available - running in demo mode');
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
                setLoading(false);
            }, (error) => {
                console.error('Auth state change error:', error);
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Auth initialization error:', error);
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        if (!auth) {
            throw new Error('Firebase not configured. Please add your Firebase credentials to .env');
        }
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        if (!auth) return;
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
