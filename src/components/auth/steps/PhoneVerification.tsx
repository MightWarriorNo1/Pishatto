import React, { useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { fetchAllGuestPhones, getGuestProfile, sendSmsVerificationCode, verifySmsCode } from '../../../services/api';
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
  const { setUser, setPhone } = useUser();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allPhones, setAllPhones] = useState<string[]>([]);
  const [displayedCode, setDisplayedCode] = useState<string | null>(null);

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
    // Allow international format with + or Japanese format
    // International: + followed by 7-15 digits
    // Japanese: 10-11 digits, may start with 0
    const internationalPattern = /^\+[1-9]\d{7,14}$/;
    const japanesePattern = /^0\d{9,10}$/;
    
    return internationalPattern.test(phone) || japanesePattern.test(phone);
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('無効な電話番号です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send SMS verification code via Twilio
      const response = await sendSmsVerificationCode(phoneNumber);
      if (response.success) {
        updateFormData({ phoneNumber });
        setStep('code');
        setTimeLeft(30);
        
        // Show verification code in development mode
        if (response.code) {
          console.log('Development mode - Verification code:', response.code);
          setDisplayedCode(response.code);
        } else {
          // Fallback: generate a test code for development
          const testCode = Math.floor(100000 + Math.random() * 900000).toString();
          console.log('Fallback test code generated:', testCode);
          setDisplayedCode(testCode);
        }
      } else {
        setError(response.message || 'SMS送信に失敗しました');
      }
    } catch (err: any) {
      setError('SMS送信に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      console.log("VERIFICATION CODE", verificationCode);

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
    
    if (code.length !== 6) {
      setError('6桁の認証コードを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify SMS code via Twilio
      const response = await verifySmsCode(phoneNumber, code);
      
      if (response.success) {
        updateFormData({ verificationCode: code });
        
        // Check if user exists
        const normalizedPhones = allPhones.map(normalizePhone);
        const normalizedInput = normalizePhone(phoneNumber);
        
        if (normalizedPhones.includes(normalizedInput)) {
          setPhone(phoneNumber);
          try {
            const { guest } = await getGuestProfile(phoneNumber);
            if (guest) setUser(guest);
            window.location.href = '/dashboard';
          } catch (e) { 
            setError('ユーザー情報の取得に失敗しました');
          }
          return;
        }
        
        onNext();
      } else {
        setError(response.message || '認証コードが正しくありません');
      }
    } catch (err: any) {
      setError('認証に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendSmsVerificationCode(phoneNumber);
      
      if (response.success) {
        setTimeLeft(30);
        // Show verification code in development mode for resend
        if (response.code) {
          console.log('Development mode - Verification code (resend):', response.code);
          setDisplayedCode(response.code);
        } else {
          // Fallback: generate a test code for development
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
                placeholder='例) 09012345346 または +15005550006'
                maxLength={13}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                className="w-full text-lg border border-secondary rounded bg-primary text-white focus:ring-0 p-0 placeholder-secondary"
                disabled={loading}
              />
            </div>
            <div className="text-xs text-white mt-2">※ハイフンなし</div>
            <div className="text-xs text-white mt-4 leading-relaxed">
              pishattoは、携帯電話番号の認証のため、SMS(テキスト)が送信されます。これには、SMS料金及びデータ料金がかかる場合があります。
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </div>
        {/* Fixed Bottom Button */}
        <div className="p-4">
          <button
            onClick={handlePhoneSubmit}
            disabled={!phoneNumber || loading}
            className={`w-full py-4 text-center text-white rounded-lg ${phoneNumber && !loading ? 'bg-secondary hover:bg-red-500' : 'bg-primary border border-secondary text-white'}`}
          >
            {loading ? '送信中...' : 'SMS認証コードを送信する'}
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
                  disabled={loading}
                />
              ))}
            </div>
            
            {/* Display verification code for testing */}
            {displayedCode && (
              <div className="mb-4 p-3 bg-secondary/20 border border-secondary rounded-lg">
                <div className="text-xs text-white mb-1">テスト用認証コード:</div>
                <div className="text-lg font-mono text-white text-center">{displayedCode}</div>
              </div>
            )}
            
            {/* Resend Code */}
            <div className="bg-primary rounded-lg p-3 text-center">
              <button
                onClick={handleResendCode}
                disabled={timeLeft > 0 || loading}
                className={`text-sm ${timeLeft > 0 || loading ? 'text-gray-500' : 'text-white hover:text-red-400'}`}
              >
                認証コードを再送する {timeLeft > 0 ? `(${timeLeft}秒)` : ''}
              </button>
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
          disabled={verificationCode.some(digit => digit === '') || loading}
          className={`w-full py-4 text-center text-white rounded-lg ${verificationCode.every(digit => digit !== '') && !loading ? 'bg-secondary hover:bg-red-400' : 'bg-primary border border-secondary text-white'}`}
        >
          {loading ? '認証中...' : '認証する'}
        </button>
      </div>
    </div>
  );
};

export default PhoneVerification; 