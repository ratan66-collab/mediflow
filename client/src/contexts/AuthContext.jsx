import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            // Check if we have a "demo user" in local storage (Priority for Direct Login)
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                setUser(JSON.parse(demoUser));
                setLoading(false);
                return;
            }

            if (supabase) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                }

                // Listen for changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setUser(session?.user ?? null);
                });
                // If we have a supbase session, loading false. If not, also false.
                setLoading(false);
                return () => subscription.unsubscribe();
            } else {
                setLoading(false);
            }
        };

        getSession();
    }, []);

    const signIn = async (email) => {
        // DIRECT LOGIN (Bypassing Email Verification per User Request)
        // This effectively treats any email as a valid login immediately.

        const fakeUser = {
            id: 'user-' + Date.now(),
            email: email || 'user@example.com',
            aud: 'authenticated',
            role: 'authenticated'
        };

        // We force this simulated login to avoid "Go to Inbox"
        localStorage.setItem('demo_user', JSON.stringify(fakeUser));
        setUser(fakeUser);

        return { error: null };
    };

    const signInWithOAuth = async (provider) => {
        if (!supabase) {
            // Simulation for demo if Supabase not configured
            const fakeUser = { id: `demo-${provider}-123`, email: `demo-${provider}@mediflow.com` };
            localStorage.setItem('demo_user', JSON.stringify(fakeUser));
            setUser(fakeUser);
            return { error: null };
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
        });
        return { error };
    };

    const signOut = async () => {
        localStorage.removeItem('demo_user');
        setUser(null);
        if (supabase) {
            await supabase.auth.signOut();
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signInWithOAuth, signOut, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
