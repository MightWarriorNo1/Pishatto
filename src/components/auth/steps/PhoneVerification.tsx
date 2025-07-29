import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { guestLogin, fetchAllGuestPhones, getGuestProfile } from '../../../services/api';
import { ChevronLeft } from 'lucide-react';

interface PhoneVerificationData {
  phoneNumber?: string;
  verificationCode?: string;
}

interface PhoneVerificationProps {
  onNext: () => void;
  onBack: () => void;
  // eslint-disable-next-line
  updateFormData: (data: PhoneVerificationData) => void;
  formData: PhoneVerificationData;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onNext,
  onBack,
  updateFormData,
  formData,
}) => {
  const navigate = useNavigate();
  const { setUser, setPhone } = useUser();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [allPhones, setAllPhones] = useState<string[]>([]);

  useEffect(() => {
    fetchAllGuestPhones().then(setAllPhones);
  }, []);

  useEffect(() => {
    if (step === 'code' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  function isValidPhoneNumber(phone: string) {
    // Japanese mobile: 10 or 11 digits, starts with 0
    return /^\d{10,11}$/.test(phone);
  }
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('無効な電話番号です');
      return;
    }
    updateFormData({ phoneNumber });
    setStep('code');
    setTimeLeft(30);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const normalizePhone = (phone: string) =>
    phone.replace(/[^0-9]/g, '').trim();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    updateFormData({ verificationCode: code });
    setError(null);
    // Normalize all phones for comparison
    const normalizedPhones = allPhones.map(normalizePhone);
    const normalizedInput = normalizePhone(phoneNumber);
    if (normalizedPhones.includes(normalizedInput)) {
      setPhone(phoneNumber);
      try {
        const { guest } = await getGuestProfile(phoneNumber);
        if (guest) setUser(guest);
        window.location.href = '/dashboard';
      } catch (e) { /* handle error if needed */ }
      
      return;
    }
    onNext();
  };

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-primary flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 bg-primary">
          <button onClick={onBack} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-medium mr-6 text-white">電話番号の入力</h1>
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-primary p-4">
            <div className="text-sm text-white mb-2">電話番号を入力してください</div>
            <div className="mt-4 p-0">
              <input
                type="tel"
                value={phoneNumber}
                placeholder='例) 09012345346'
                maxLength={11}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-lg border border-secondary rounded bg-primary text-white focus:ring-0 p-0 placeholder-secondary"
              />
            </div>
            <div className="text-xs text-white mt-2">※ハイフンなし</div>
            <div className="text-xs text-white mt-4 leading-relaxed">
              pishattoは、携帯電話番号の認証のため、SMS(テキスト)が送信されます。これには、SMS料金及びデータ料金がかかる場合があります。
            </div>
          </div>
        </div>
        {/* Fixed Bottom Button */}
        <div className="p-4">
          <button
            onClick={handlePhoneSubmit}
            disabled={!phoneNumber}
            className={`w-full py-4 text-center text-white rounded-lg ${phoneNumber ? 'bg-secondary hover:bg-red-500' : 'bg-primary border border-secondary text-white'}`}
          >
            SMS認証コードを送信する
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-primary">
        <button onClick={() => setStep('phone')} className="text-white">
          <ChevronLeft />
        </button>
        <h1 className="flex-1 text-center text-lg font-medium mr-6 text-white">認証コードの入力</h1>
      </div>
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-4">
          <div className="bg-primary p-4 rounded-lg">
            <div className="text-sm text-white mb-4">送信された6桁の認証コードを入力してください。</div>
            {/* Verification Code Input */}
            <div className="flex justify-between space-x-2 mb-4">
              {verificationCode.map((digit, index) => (
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
            {/* Resend Code */}
            <div className="bg-primary rounded-lg p-3 text-center">
              <div className="text-sm text-white">
                認証コードを再送する {timeLeft > 0 ? `(${timeLeft}秒)` : ''}
              </div>
              {error && <div className="text-red-500 text-center mt-2">{error}</div>}
            </div>
            {/* SMS not received notice */}
            <div className="mt-4 flex items-center text-xs text-white">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30秒以内にSMSが届かない場合
            </div>
          </div>
        </div>
      </div>
      {/* Fixed Bottom Button */}
      <div className="p-4">
        <button
          onClick={handleCodeSubmit}
          disabled={verificationCode.some(digit => digit === '')}
          className={`w-full py-4 text-center text-white rounded-lg ${verificationCode.every(digit => digit !== '') ? 'bg-secondary hover:bg-red-400' : 'bg-primary border border-secondary text-white'}`}
        >
          認証する
        </button>
      </div>
    </div>
  );
};

export default PhoneVerification; 