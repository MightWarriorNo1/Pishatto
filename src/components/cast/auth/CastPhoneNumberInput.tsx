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
                            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={11}
                        />
                        <div className="text-xs text-white mb-4">※ハイフンなし</div>
                        <div className="text-xs text-white">
                            pishattoは、携帯電話番号の認証のため、SMS(テキスト)が送信されます。これには、SMS料金及びデータ料金がかかる場合があります。
                        </div>
                    </div>
                    {/* Bottom Button */}
                    <div className="w-full px-4 pb-6">
                        <button
                            className={`w-full py-3 rounded-full font-medium text-base ${isActive ? 'bg-secondary text-white hover:bg-red-700 transition-all duration-200' : 'bg-primary border border-secondary text-white cursor-not-allowed'}`}
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