import React, { useState } from 'react';
import CastSMSCodeInput from './CastSMSCodeInput';
import { ChevronLeft } from 'lucide-react';

interface CastPhoneNumberInputProps {
    onBack: () => void;
}

function isValidPhoneNumber(phone: string) {
    // Japanese mobile: 10 or 11 digits, starts with 0
    return /^\d{10,11}$/.test(phone);
}

const CastPhoneNumberInput: React.FC<CastPhoneNumberInputProps> = ({ onBack }) => {
    const [phone, setPhone] = useState('');
    const [showSMS, setShowSMS] = useState(false);

    if (showSMS) {
        return <CastSMSCodeInput onBack={() => setShowSMS(false)} phone={phone} />;
    }

    const isActive = isValidPhoneNumber(phone);

    return (
        <div className="min-h-screen">
            <div className="max-w-md mx-auto">
                <div className="min-h-screen flex flex-col bg-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-center relative h-14 border-b border-gray-200 bg-white">
                        <button onClick={onBack} className="absolute left-4 text-2xl text-gray-700">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-base font-medium">電話番号の入力</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 flex flex-col px-4 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">電話番号を入力してください</label>
                        <input
                            type="tel"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 mb-1 bg-white"
                            placeholder="例）09012345346"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={11}
                        />
                        <div className="text-xs text-gray-400 mb-4">※ハイフンなし</div>
                        <div className="text-xs text-gray-500">
                            pishattoは、携帯電話番号の認証のため、SMS(テキスト)が送信されます。これには、SMS料金及びデータ料金がかかる場合があります。
                        </div>
                    </div>
                    {/* Bottom Button */}
                    <div className="w-full px-4 pb-6">
                        <button
                            className={`w-full py-3 rounded-full font-medium text-base ${isActive ? 'bg-[#FF6B00] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            disabled={!isActive}
                            onClick={() => isActive && setShowSMS(true)}
                        >
                            SMS認証コードを送信する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastPhoneNumberInput; 