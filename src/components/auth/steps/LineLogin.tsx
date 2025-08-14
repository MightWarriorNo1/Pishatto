/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useCast } from '../../../contexts/CastContext';    
import Spinner from '../../../components/ui/Spinner';

interface LineLoginProps {
    userType?: 'guest' | 'cast';
    onSuccess?: (user: any) => void;
    onError?: (error: string) => void;
}

const LineLogin: React.FC<LineLoginProps> = ({ userType = 'guest', onSuccess, onError }) => {
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { setCast } = useCast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLineLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/redirect?user_type=${userType}`;
            window.location.href = redirectUrl;
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
            console.log(response);
            const data = await response.json();
            console.log(data);
            if (data.success) {
                if (data.user_type === 'guest') {
                    setUser(data.user);
                    onSuccess?.(data.user);
                    navigate('/dashboard');
                } else if (data.user_type === 'cast') {
                    setCast(data.user);
                    onSuccess?.(data.user);
                    navigate('/cast/dashboard');
                } else if (data.user_type === 'new') {
                    // Handle new user registration for guest only
                    if (userType === 'guest') {
                        navigate('/line-register', { 
                            state: { 
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
                throw new Error(data.message || 'Line authentication failed');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Line callback failed';
            setError(errorMessage);
            onError?.(errorMessage);
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
                onClick={handleLineLogin}
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