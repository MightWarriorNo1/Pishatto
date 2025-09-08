/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useCast } from '../../../contexts/CastContext';
import Spinner from '../../ui/Spinner';
import { handleLineLogin } from '../../../utils/lineLogin';

interface LineLoginProps {
    userType?: 'guest' | 'cast';
    onSuccess?: (user: any) => void;
    onError?: (error: string) => void;
}

const LineLogin: React.FC<LineLoginProps> = ({ userType = 'guest', onSuccess, onError }) => {
    const navigate = useNavigate();
    const { setUser, resetLineAuthFlag } = useUser();
    const { setCast, resetLineAuthFlag: resetCastLineAuthFlag } = useCast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLineLoginClick = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await handleLineLogin({
                userType,
                onError: (errorMessage) => {
                    setError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Line login failed';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLineCallback = async (code: string, state?: string) => {
        try {
            console.log('LineLogin: Starting LINE callback handling...', { code, state, userType });
            
            // Use web route for callback to maintain session
            const params = new URLSearchParams({ code });
            if (state) params.set('state', state);
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/callback?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log('LineLogin: Received callback response:', data);
            console.log('LineLogin: Response structure:', {
                success: data.success,
                user_type: data.user_type,
                user: data.user,
                hasUser: !!data.user,
                userId: data.user?.id,
                userKeys: data.user ? Object.keys(data.user) : [],
                userStringified: data.user ? JSON.stringify(data.user) : 'null'
            });
            
            if (data.success) {
                if (data.user_type === 'guest') {
                    console.log('LineLogin: Processing guest login...');
                    // Reset LINE auth flag since user is explicitly logging in
                    resetLineAuthFlag();
                    // Set user in context first
                    setUser(data.user);
                    onSuccess?.(data.user);
                    
                    // Small delay to ensure context is updated
                    setTimeout(() => {
                        navigate('/dashboard', { replace: true });
                    }, 100);
                } else if (data.user_type === 'cast') {
                    console.log('LineLogin: Processing cast login...', data.user);
                    // Reset LINE auth flag since cast is explicitly logging in
                    resetCastLineAuthFlag();
                    // Set cast in context first and wait for it to be properly set
                    setCast(data.user);
                    onSuccess?.(data.user);
                    
                    // For cast users, we need to ensure the context is fully updated
                    // before navigation to avoid race conditions with ProtectedRoute
                    setTimeout(() => {
                        // Double-check that cast is set in context before navigation
                        if (data.user && data.user.id) {
                            console.log('Cast context updated, navigating to dashboard:', data.user);
                            
                            // Additional debugging: check localStorage and context state
                            const storedCastData = localStorage.getItem('castData');
                            const storedCastId = localStorage.getItem('castId');
                            console.log('LineLogin: LocalStorage state after setCast:', { 
                                storedCastData, 
                                storedCastId,
                                expectedId: data.user.id 
                            });
                            
                            // Wait a bit more to ensure context is fully updated
                            setTimeout(() => {
                                console.log('LineLogin: Final navigation to cast dashboard');
                                navigate('/cast/dashboard', { replace: true });
                            }, 100);
                        } else {
                            console.error('Cast data is missing, cannot navigate');
                            setError('キャストデータの取得に失敗しました。もう一度お試しください。');
                        }
                    }, 300); // Increased delay for cast users to ensure context stability
                } else if (data.user_type === 'new') {
                    console.log('LineLogin: Processing new user registration...');
                    // Handle new user registration for guest only
                    if (userType === 'guest') {
                        // For new LINE users, redirect to phone registration flow
                        // Store LINE data in sessionStorage for later use
                        sessionStorage.setItem('lineData', JSON.stringify(data.line_data));
                        sessionStorage.setItem('lineUserType', userType);
                        navigate('/register', { 
                            state: { 
                                fromLine: true,
                                lineData: data.line_data,
                                userType: userType 
                            } 
                        });
                    } else {
                        // Cast new user not allowed via LINE
                        throw new Error('キャストのLINE新規登録はできません。電話番号でログインしてください。');
                    }
                }
            } else {
                console.error('LineLogin: Authentication failed:', data.message);
                throw new Error(data.message || 'Line authentication failed');
            }
        } catch (err: any) {
            console.error('LineLogin: Error in callback handling:', err);
            const errorMessage = err.message || 'Line callback failed';
            setError(errorMessage);
            onError?.(errorMessage);
            // For cast, redirect to cast/login on failure
            if (userType === 'cast') {
                navigate('/cast/login', { replace: true });
            }
        }
    };

    // Check for Line callback code in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state') || undefined;
        
        if (code) {
            handleLineCallback(code, state);
        }
    }, []);

    return (
        <div className="flex flex-col max-w-md mx-auto items-center justify-center min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">LINEログイン</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
                    {error}
                </div>
            )}
            
            <button 
                onClick={handleLineLoginClick}
                disabled={isLoading}
                aria-label="LINEでログイン" 
                className="bg-secondary hover:bg-red-400 disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-bold text-lg focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-colors"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Spinner />
                    </div>
                ) : (
                    'LINEでログイン'
                )}
            </button>
            
            <div className="mt-4 text-white text-sm text-center">
                LINEアカウントで簡単ログイン
                <br />
                {userType === 'guest' ? 'ゲスト' : 'キャスト'}としてログインします
            </div>
        </div>
    );
};

export default LineLogin; 