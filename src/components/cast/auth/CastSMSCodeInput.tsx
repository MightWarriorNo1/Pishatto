import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { castLogin, castRegister, sendSmsVerificationCode } from '../../../services/api';
import { useCast } from '../../../contexts/CastContext';

interface CastSMSCodeInputProps {
    onBack: () => void;
    phone: string;
    verificationCode?: string | null;
}

const CastSMSCodeInput: React.FC<CastSMSCodeInputProps> = ({ onBack, phone, verificationCode }) => {
    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [displayedCode, setDisplayedCode] = useState<string | null>(verificationCode || null);
    const navigate = useNavigate();
    const { setCastId, setCast } = useCast();
    
    console.log('CastSMSCodeInput: cast context values:', { setCastId, setCast });

    const isActive = code.every(digit => digit !== '') && code.join('').length === 6;

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
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

    const handleResendCode = async () => {
        if (timeLeft > 0 || loading) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await sendSmsVerificationCode(phone);
            
            if (response.success) {
                setTimeLeft(30);
                if (response.code) {
                    console.log('Development mode - Verification code (resend):', response.code);
                    setDisplayedCode(response.code);
                } else {
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

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        event.preventDefault();
        const newDigits = pasted.split('');
        const updated = [...code];
        for (let i = 0; i < 6; i += 1) {
            updated[i] = newDigits[i] || '';
        }
        setCode(updated);
        const nextIndex = Math.min(newDigits.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.key === 'Backspace' && code[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (event.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
            event.preventDefault();
        }
        if (event.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
            event.preventDefault();
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gradient-to-br from-primary via-primary/80 to-secondary b   flex items-center justify-center px-4">
            <div className="w-full min-h-screen p-6 pb-28">
                <div className="flex items-center justify-center relative h-14 border-b border-rose-200">
                    <button onClick={onBack} className="absolute left-2 text-white hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-full p-2" aria-label="戻る">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-base font-medium text-white">SMS認証コードの入力</span>
                </div>

                <div className="pt-6 space-y-5">
                    <div className="flex justify-between space-x-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                id={`code-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                                onPaste={handlePaste}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-[46px] h-[52px] text-center text-lg border border-rose-200 rounded-xl bg-white text-primary focus:outline-none focus:ring-2 focus:ring-rose-300"
                                aria-label={`認証コード ${index + 1} 桁目`}
                            />
                        ))}
                    </div>

                    {displayedCode && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                            <div className="text-xs text-rose-500 mb-1">テスト用認証コード</div>
                            <div className="text-lg font-mono text-rose-700 text-center tracking-widest">{displayedCode}</div>
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={handleResendCode}
                            disabled={timeLeft > 0 || loading}
                            className={`text-sm ${timeLeft > 0 || loading ? 'text-rose-300' : 'text-white hover:text-rose-700'} focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-full px-3 py-1`}
                            type="button"
                        >
                            認証コードを再送する {timeLeft > 0 ? `(${timeLeft}秒)` : ''}
                        </button>
                        {error && <div role="alert" className="text-rose-600 text-center mt-2">{error}</div>}
                    </div>
                </div>

                <div className="fixed max-w-md mx-auto bottom-0 left-0 right-0 px-4 pb-10 pt-3">
                    <div className="max-w-md mx-auto">
                        <button
                            className={`w-full h-14 rounded-full font-medium text-base transition-colors ${isActive ? 'bg-rose-500 text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300' : 'bg-rose-100 text-rose-300 cursor-not-allowed'}`}
                            disabled={!isActive || loading}
                            onClick={async () => {
                                if (isActive) {
                                    setLoading(true);
                                    setError(null);
                                    try {
                                        const response = await castLogin(phone);
                                        if (response.cast) {
                                            setCast(response.cast);
                                            setCastId(response.cast.id);
                                            setTimeout(() => {
                                                navigate('/cast/dashboard');
                                            }, 100);
                                            return;
                                        }
                                        const result = await castRegister({ phone });
                                        setCast(result.cast);
                                        setCastId(result.cast.id);
                                        setTimeout(() => {
                                            navigate('/cast/dashboard');
                                        }, 100);
                                    } catch (err: any) {
                                        setError('ログインに失敗しました。もう一度お試しください。');
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            type="button"
                        >
                            {loading ? '登録中…' : '認証して次へ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastSMSCodeInput; 