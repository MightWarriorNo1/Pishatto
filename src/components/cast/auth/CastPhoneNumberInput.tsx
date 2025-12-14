import React, { useState } from 'react';
import CastSMSCodeInput from './CastSMSCodeInput';
import { ChevronLeft } from 'lucide-react';
import { sendSmsVerificationCode, checkCastExists } from '../../../services/api';

interface CastPhoneNumberInputProps {
    onBack: () => void;
}

function isValidPhoneNumber(phone: string) {
    // Japanese mobile: 10 or 11 digits, must start with 0
    return /^0\d{9,10}$/.test(phone);
}

const CastPhoneNumberInput: React.FC<CastPhoneNumberInputProps> = ({ onBack }) => {
    const [phone, setPhone] = useState('');
    const [showSMS, setShowSMS] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState<string | null>(null);

    const handleSendSMS = async () => {
        if (!isValidPhoneNumber(phone)) {
            setError('電話番号は0で始まる10桁または11桁の数字で入力してください');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // First check if cast exists
            const castCheckResponse = await checkCastExists(phone);
            if (!castCheckResponse.exists) {
                setError(castCheckResponse.message || 'お客様の情報は存在しません。管理者までご連絡ください。');
                setLoading(false);
                return;
            }

            // If cast exists, send SMS verification code
            const response = await sendSmsVerificationCode(phone);
            if (response.success) {
                // Show verification code in development mode
                if (response.code) {
                    console.log('Development mode - Verification code:', response.code);
                    setVerificationCode(response.code);
                } else {
                    // Fallback: generate a test code for development
                    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log('Fallback test code generated:', testCode);
                    setVerificationCode(testCode);
                }
                setShowSMS(true);
            } else {
                setError(response.message || 'SMS送信に失敗しました');
            }
        } catch (err: any) {
            // Extract error message from API response
            const errorMessage = err.response?.data?.message 
                || err.response?.data?.errors?.phone?.[0]
                || (err.response?.status === 404 ? 'お客様の情報は存在しません。管理者までご連絡ください。' : null)
                || err.message 
                || 'SMS送信に失敗しました。もう一度お試しください。';
            setError(errorMessage);
            console.error('SMS verification error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setShowSMS(false); // Go back to phone input page
    };

    if (showSMS) {
        return <CastSMSCodeInput onBack={() => setShowSMS(false)} phone={phone} verificationCode={verificationCode} onError={handleError} />;
    }

    const isActive = isValidPhoneNumber(phone);

    return (
        <div className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-primary via-primary/80 to-secondary flex items-center justify-center px-4">
            <div className="w-full min-h-screen p-6 pb-28">
                <div className="flex items-center justify-center relative h-14 border-b border-rose-200">
                    <button
                        onClick={onBack}
                        className="absolute left-2 text-white hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-full p-2"
                        aria-label="戻る"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <span className="text-base font-medium text-white">電話番号の入力</span>
                </div>

                <div className="pt-6 space-y-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-white">電話番号を入力してください</label>
                    <input
                        id="phone"
                        inputMode="numeric"
                        type="tel"
                        className="w-full border border-rose-200 rounded-xl px-4 py-3 text-primary placeholder-primary focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-white"
                        placeholder="例）09012345678"
                        aria-describedby="phone-help"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={11}
                    />
                    <div id="phone-help" className="text-xs text-white">ハイフンなし、0で始まる10〜11桁の番号</div>
                    <div className="text-[13px] text-secondary">SMSによる本人確認のため、テキストメッセージをお送りします（通信料が発生する場合があります）。</div>
                    {error && <div role="alert" className="text-rose-600 text-sm">{error}</div>}
                </div>
                
                {/* Show verification code for testing */}
                {verificationCode && (
                    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-4">
                        <div className="text-yellow-800 text-sm font-medium">
                            🧪 テスト用認証コード: <span className="font-mono text-lg font-bold">{verificationCode}</span>
                        </div>
                        <div className="text-yellow-700 text-xs mt-1">
                            開発環境でのみ表示されます
                        </div>
                    </div>
                )}
                {/* Spacer bottom is handled by pb-28 on container */}
            </div>
            <div className="fixed max-w-md mx-auto inset-x-0 bottom-0 z-20 backdrop-blur pb-[100px]">
                <div className="max-w-md mx-auto px-6 py-3">
                    <button
                        className={`w-full h-14 rounded-full font-medium text-base transition-colors ${isActive && !loading ? 'bg-rose-500 text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300' : 'bg-rose-100 text-rose-300 cursor-not-allowed'}`}
                        disabled={!isActive || loading}
                        onClick={handleSendSMS}
                        type="button"
                    >
                        {loading ? '送信中…' : 'SMS認証コードを送信する'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CastPhoneNumberInput; 