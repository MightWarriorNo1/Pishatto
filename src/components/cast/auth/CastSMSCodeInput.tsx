import { ChevronLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { castRegister } from '../../../services/api';
import { castLogin } from '../../../services/api';
import { sendSmsVerificationCode } from '../../../services/api';

interface CastSMSCodeInputProps {
    onBack: () => void;
    phone: string;
    verificationCode?: string | null;
}

const CastSMSCodeInput: React.FC<CastSMSCodeInputProps> = ({ onBack, phone, verificationCode }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(30);
    const isActive = code.length === 6 && /^[a-zA-Z0-9]{6}$/.test(code.join(''));
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayedCode, setDisplayedCode] = useState<string | null>(null);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const handleCodeChange = (index: number, value: string) => {
        if (value.length <= 1) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            // Auto-focus next input
            if (value !== '' && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    // For testing purposes, set verification code
    React.useEffect(() => {
        if (verificationCode) {
            setDisplayedCode(verificationCode);
        } else if (process.env.NODE_ENV === 'development') {
            // Fallback to sample code in development mode
            setDisplayedCode('123456');
        }
    }, [verificationCode]);

    const handleResendCode = async () => {
        if (timeLeft > 0) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await sendSmsVerificationCode(phone);
            
            if (response.success) {
                setTimeLeft(30);
                // Show verification code in development mode for resend
                if (response.code) {
                    console.log('Development mode - Verification code (resend):', response.code);
                    setDisplayedCode(response.code);
                } else {
                    // Fallback: generate a test code for development
                    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log('Fallback test code generated (resend):', testCode);
                    setDisplayedCode(testCode);
                }
            } else {
                setError(response.message || 'SMS再送に失敗しました');
            }
        } catch (err: any) {
            setError('SMS再送に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto bg-primary rounded-2xl shadow-lg p-8 border border-secondary">
                <div className="min-h-screen flex flex-col bg-primary">
                    {/* Header */}
                    <div className="flex items-center justify-center relative h-14 border-b border-secondary bg-primary">
                        <button onClick={onBack} className="absolute left-4 text-2xl text-white hover:text-red-700 transition-all duration-200">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-base font-medium text-white">SMS認証コードの入力</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 px-4 pt-6">
                        <div className="flex justify-between space-x-2 mb-4">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    className="w-[45px] h-[45px] text-center text-lg border border-secondary rounded-md bg-primary text-white focus:outline-none focus:border-secondary"
                                />
                            ))}
                        </div>
                        
                        {/* Display verification code for testing */}
                        {displayedCode && (
                            <div className="mb-4 p-3 bg-secondary/20 border border-secondary rounded-lg">
                                <div className="text-xs text-white mb-1">テスト用認証コード:</div>
                                <div className="text-lg font-mono text-white text-center">{displayedCode}</div>
                            </div>
                        )}
                        
                        {/* Resend Code */}
                        <div className="bg-primary rounded-lg p-3 text-center">
                            <button
                                onClick={handleResendCode}
                                disabled={timeLeft > 0 || loading}
                                className={`text-sm ${timeLeft > 0 || loading ? 'text-gray-500' : 'text-white hover:text-red-400'}`}
                            >
                                認証コードを再送する {timeLeft > 0 ? `(${timeLeft}秒)` : ''}
                            </button>
                            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
                        </div>
                    </div>
                    {/* Bottom Button */}
                    <div className="w-full px-4 pb-4 mt-auto">
                        <button
                            className={`w-full h-20 py-3 font-medium text-base ${isActive ? 'bg-secondary text-white hover:bg-pink-700 transition-all duration-200' : 'bg-pink-400 border border-secondary text-white cursor-not-allowed'}`}
                            disabled={!isActive || loading}
                            onClick={async () => {
                                if (isActive) {
                                    setLoading(true);
                                    setError(null);
                                    try {
                                        // Try login with phone number
                                        const response = await castLogin(phone);
                                        if (response.cast) {
                                            localStorage.setItem('castId', response.cast.id);
                                            navigate('/cast/dashboard');
                                            return;
                                        }
                                        // fallback: register
                                        const result = await castRegister({ phone });
                                        localStorage.setItem('castId', result.cast.id);
                                        navigate('/cast/dashboard');
                                    } catch (err: any) {
                                        setError('ログインに失敗しました。もう一度お試しください。');
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                        >
                            {loading ? '登録中...' : '認証して次へ'}
                        </button>
                        {error && <div className="text-red-500 text-center mt-2">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastSMSCodeInput; 