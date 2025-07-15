import React, { useState } from 'react';
import CastPhoneNumberInput from './CastPhoneNumberInput';

interface CastLoginOptionsProps {
    onNext: () => void;
}

const CastLoginOptions: React.FC<CastLoginOptionsProps> = ({ onNext }) => {
    const [showPhoneInput, setShowPhoneInput] = useState(false);

    if (showPhoneInput) {
        return <CastPhoneNumberInput onBack={() => setShowPhoneInput(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto">
                <div className="flex flex-col min-h-screen bg-black">
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-full px-4 space-y-4">
                            <div className="p-2 text-center text-xs text-gray-400">
                                18歳以上全ての利用規約とプライバシーポリシーに同意し
                            </div>
                            <button
                                onClick={() => setShowPhoneInput(true)}
                                className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-[#FF6B00] text-white font-medium relative"
                            >
                                <span className="absolute left-4">📞</span>
                                電話番号で始める
                            </button>
                            <button
                                className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-[#00B900] text-white font-medium relative"
                            >
                                <span className="absolute left-4">LINE</span>
                                LINEで始める
                            </button>
                            <button className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-[#1877F2] text-white font-medium relative">
                                <span className="absolute left-4">f</span>
                                Facebookで始める
                                <span className="absolute right-4 text-xs text-gray-200">SNS上には一切の表示・投稿されません</span>
                            </button>
                            <button className="w-full flex items-center justify-center py-2 text-gray-400">
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastLoginOptions; 