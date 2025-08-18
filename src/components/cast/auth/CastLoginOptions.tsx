/* eslint-disable */
import React, { useState } from 'react';
import CastPhoneNumberInput from './CastPhoneNumberInput';

interface CastLoginOptionsProps {
    onNext: () => void;
}

const CastLoginOptions: React.FC<CastLoginOptionsProps> = ({ onNext }) => {
    const [showPhoneInput, setShowPhoneInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userType = 'cast';

    const handleLineLogin = () => {
        setIsLoading(true);
        setError(null);

        try {
            const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/redirect?user_type=${userType}`;
            window.location.href = redirectUrl;
        } catch (err: any) {
            const errorMessage = err.message || 'Line login failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (showPhoneInput) {
        return <CastPhoneNumberInput onBack={() => setShowPhoneInput(false)} />;
    }

    return (
        <div className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-primary via-primary/80 to-secondary flex items-center justify-center">
            <div className="w-full p-8">
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-white text-xl">✨</div>
                        <h1 className="text-xl font-semibold text-white">はじめましょう</h1>
                        <p className="text-sm text-secondary">かんたん・安全・無料。女性のためのやさしい設計です。</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setShowPhoneInput(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-full bg-rose-500 text-white font-semibold shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-colors"
                            aria-label="電話番号で始める"
                        >
                            <span className="text-lg">📞</span>
                            電話番号で始める
                        </button>

                        <button
                            onClick={handleLineLogin}
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-full bg-white text-emerald-600 border-2 border-emerald-300 font-semibold shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors hover:text-secondary cursor-pointer"
                            aria-label="LINEで始める"
                            type="button"
                        >
                            <span className="text-lg">💬</span>
                            LINEで始める
                        </button>
                    </div>

                    <div className="pt-2 text-center text-xs text-rose-500">
                        ご利用は<strong className="mx-1">18歳以上</strong>、
                        利用規約と
                        プライバシーポリシー
                        に同意のうえでお願いします。
                    </div>

                    <button
                        className="w-full flex items-center justify-center py-2 text-rose-500 hover:text-rose-600 focus:outline-none transition-colors"
                        onClick={() => { window.location.href = "/"; }}
                        type="button"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CastLoginOptions; 