/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CastPhoneNumberInput from './CastPhoneNumberInput';
import { handleLineLogin } from '../../../utils/lineLogin';

interface CastLoginOptionsProps {
    onNext: () => void;
}

const CastLoginOptions: React.FC<CastLoginOptionsProps> = ({ onNext }) => {
    const [showPhoneInput, setShowPhoneInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const userType = 'cast';
    const location = useLocation();

    // Check for error message from navigation state or URL query params
    useEffect(() => {
        if (location.state?.error) {
            setError(location.state.error);
        } else if (location.search) {
            const urlParams = new URLSearchParams(location.search);
            const errorParam = urlParams.get('error');
            if (errorParam) {
                setError(decodeURIComponent(errorParam));
            }
        }
    }, [location.state, location.search]);

    const handleLineLoginClick = () => {
        setIsLoading(true);
        setError(null);

        handleLineLogin({
            userType,
            useCastCallback: false, // Explicitly set to false for regular login
            onError: (errorMessage: string) => {
                setError(errorMessage);
            }
        }).finally(() => {
            setIsLoading(false);
        });
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

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

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
                            onClick={handleLineLoginClick}
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