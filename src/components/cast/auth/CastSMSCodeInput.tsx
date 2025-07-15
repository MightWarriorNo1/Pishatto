import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CastSMSCodeInputProps {
    onBack: () => void;
    phone: string;
}

const CastSMSCodeInput: React.FC<CastSMSCodeInputProps> = ({ onBack, phone }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft] = useState(30);
    const isActive = code.length === 6 && /^[a-zA-Z0-9]{6}$/.test(code.join(''));
    const navigate = useNavigate();

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
    return (
        <div className="min-h-screen">
            <div className="max-w-md mx-auto">
                <div className="min-h-screen flex flex-col bg-gray-50">
                    {/* Header */}
                    <div className="flex items-center justify-center relative h-14 border-b border-gray-200 bg-white">
                        <button onClick={onBack} className="absolute left-4 text-2xl text-gray-700">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-base font-medium">SMS認証コードの入力</span>
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
                                    className="w-[45px] h-[45px] text-center text-lg border border-gray-300 rounded-md bg-white focus:outline-none focus:border-gray-400"
                                />
                            ))}
                        </div>

                        {/* Resend Code */}
                        <div className="bg-[#F1F2F4] rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600">
                                認証コードを再送する {timeLeft > 0 ? `(${timeLeft}秒)` : ''}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Button */}
                    <div className="w-full px-4 pb-4 mt-auto">
                        <button
                            className={`w-full py-3 rounded-full font-medium text-base ${isActive ? 'bg-[#FF6B00] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            disabled={!isActive}
                            onClick={() => {
                                if (isActive) {
                                    navigate('/cast/dashboard');
                                }
                            }}
                        >
                            認証して次へ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CastSMSCodeInput; 