import React, { useState } from 'react';
import CastSMSCodeInput from './CastSMSCodeInput';
import { ChevronLeft } from 'lucide-react';
import { sendSmsVerificationCode } from '../../../services/api';

interface CastPhoneNumberInputProps {
    onBack: () => void;
}

function isValidPhoneNumber(phone: string) {
    // Japanese mobile: 10 or 11 digits, starts with 0
    return /^\+?[1-9]\d{1,14}$/.test(phone);
}

const CastPhoneNumberInput: React.FC<CastPhoneNumberInputProps> = ({ onBack }) => {
    const [phone, setPhone] = useState('');
    const [showSMS, setShowSMS] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState<string | null>(null);

    const handleSendSMS = async () => {
        if (!isValidPhoneNumber(phone)) {
            setError('無効な電話番号です');
            return;
        }

        setLoading(true);
        setError(null);

        try {
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
            setError('SMS送信に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    if (showSMS) {
        return <CastSMSCodeInput onBack={() => setShowSMS(false)} phone={phone} verificationCode={verificationCode} />;
    }

    const isActive = isValidPhoneNumber(phone);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="max-w-md w-full mx-auto bg-primary rounded-2xl shadow-lg p-8 border border-secondary">
                <div className="min-h-screen flex flex-col bg-primary">
                    {/* Header */}
                    <div className="flex items-center justify-center relative h-14 border-b border-secondary bg-primary">
                        <button onClick={onBack} className="absolute left-4 text-2xl text-white hover:text-red-700 transition-all duration-200">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-base font-medium text-white">電話番号の入力</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex flex-col px-4 pt-6">
                        <label className="block text-sm font-medium text-white mb-2">電話番号を入力してください</label>
                        <input
                            type="tel"
                            className="w-full border border-secondary rounded-lg px-4 py-3 text-white placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 mb-1 bg-primary"
                            placeholder="例）09012345346"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                            maxLength={15}
                        />
                        <div className="text-xs text-white mb-4">※ハイフンなし</div>
                        <div className="text-xs text-white">
                            pishattoは、携帯電話番号の認証のため、SMS(テキスト)が送信されます。これには、SMS料金及びデータ料金がかかる場合があります。
                        </div>
                        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                    </div>
                    {/* Bottom Button */}
                    <div className="w-full px-4 pb-6">
                        <button
                            className={`w-full h-20 py-3 font-medium text-base ${isActive && !loading ? 'bg-secondary text-white hover:bg-red-700 transition-all duration-200' : 'bg-pink-400 border border-secondary text-white cursor-not-allowed'}`}
                            disabled={!isActive || loading}
                            onClick={handleSendSMS}
                        >
                            {loading ? '送信中...' : 'SMS認証コードを送信する'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastPhoneNumberInput; 