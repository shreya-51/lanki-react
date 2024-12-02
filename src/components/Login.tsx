// src/components/Login.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Boxes, LogIn } from 'lucide-react';
import Logo from './Logo';
import { OrbitProgress } from 'react-loading-indicators';


interface LoginProps {
    onLoginSuccess: (email: string) => void; // Callback to pass the logged-in user's email
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);
    const logoUrl = chrome.runtime.getURL('/logo.svg');

    const checkOrCreateUser = async (email: string) => {
        // Check if user exists in our users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('user_id, email')
            .eq('email', email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking user:', fetchError);
            return false;
        }

        if (!existingUser) {
            // User doesn't exist, create new user
            console.log('Creating new user with email:', email);
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ email: email }])
                .select('user_id, email')
                .single();

            if (insertError) {
                console.error('Error creating user:', insertError);
                return false;
            }
            console.log('Successfully created new user');
        } else {
            console.log('User already exists:', existingUser.email);
        }

        return true;
    };

    useEffect(() => {
        const checkIdToken = async () => {
            setLoading(true);
            chrome.storage.local.get(['lankiIdToken'], async (result) => {
                if (result.lankiIdToken) {
                    console.log("Local Lanki token found.");
                    const { data, error } = await supabase.auth.signInWithIdToken({
                        provider: 'google',
                        token: result.lankiIdToken,
                    });
                    if (data?.user?.email) {
                        // Add check for user in database
                        const userCreated = await checkOrCreateUser(data.user.email);
                        if (userCreated) {
                            onLoginSuccess(data.user.email);
                        } else {
                            console.error('Failed to create/verify user in database');
                        }
                    } else if (error) {
                        console.error('Supabase sign-in error:', error);
                    }
                } else {
                    console.log("Local Lanki token not found.");
                }
                setLoading(false);
            });
        };

        checkIdToken();
    }, [onLoginSuccess]);

    const launchSignIn = () => {
        setLoading(true);
        chrome.runtime.sendMessage({ action: 'launchAuthFlow' }, async (response) => {
            if (response.success) {
                const { email } = response.data.user;
                // Add check for user in database
                const userCreated = await checkOrCreateUser(email);
                if (userCreated) {
                    onLoginSuccess(email);
                } else {
                    console.error('Failed to create/verify user in database');
                }
            } else {
                console.error('Authentication failed:', response.error);
            }
            setLoading(false);
        });
    };

    return (
        <div>
            {loading ? (
                <div className="bg-white flex items-center justify-center p-4">
                    <OrbitProgress variant="split-disc" color="#3f51b5" size="small" text="" textColor="" />
                </div>
            ) : (
                <div className="bg-white flex items-center justify-center p-4">
                    <div className="w-full max-w-sm text-center flex flex-col items-center justify-center gap-3 mb-2">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Logo logoUrl={logoUrl} />
                        </div>

                        <button
                            onClick={launchSignIn}
                            className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
                        >
                            <LogIn className="w-5 h-5" />
                            <span>Continue with Google</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
