import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { fetchAllGuestPhones, getGuestProfile, sendSmsVerificationCode, verifySmsCode, guestLogin } from '../../../services/api';
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
  const { setUser, setPhone, resetLineAuthFlag } = useUser();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allPhones, setAllPhones] = useState<string[]>([]);
  const [displayedCode, setDisplayedCode] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

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
    // Japanese mobile: 10 or 11 digits, must start with 0
    return /^0\d{9,10}$/.test(phone);
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhoneNumber(phoneNumber)) {
      setError('電話番号は0で始まる10桁または11桁の数字で入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send SMS verification code via Twilio
      const response = await sendSmsVerificationCode(phoneNumber);
      console.log("Response", response);
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
      // Extract error message from API response
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.errors?.phone?.[0]
        || err.message 
        || 'SMS送信に失敗しました。もう一度お試しください。';
      setError(errorMessage);
      console.error('SMS verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, '');
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Auto-focus next input when a digit is entered
      if (value !== '' && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData?.getData('text') || '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;
    e.preventDefault();
    const newCode = [...verificationCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = digits[i] || '';
    }
    setVerificationCode(newCode);
    const lastFilled = Math.max(0, digits.length - 1);
    inputsRef.current[lastFilled]?.focus();
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
        const normalizedPhones = allPhones.map((p) => normalizePhone(p || ''));
        const normalizedInput = normalizePhone(phoneNumber);

        if (normalizedPhones.includes(normalizedInput)) {
          setPhone(phoneNumber);
          try {
            // Log the guest in; backend will honor previously verified phone
            await guestLogin(phoneNumber, code);
            const { guest } = await getGuestProfile(phoneNumber);
            if (guest) {
              // Reset LINE auth flag since user is explicitly logging in via phone
              resetLineAuthFlag();
              setUser(guest);
            }
            window.location.href = '/dashboard';
          } catch (e: any) {
            const loginErrorMessage = e.response?.data?.message 
              || e.message 
              || 'ログインに失敗しました';
            setError(loginErrorMessage);
          }
          return;
        }

        onNext();
      } else {
        setError(response.message || '認証コードが正しくありません');
      }
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.errors?.code?.[0]
        || err.response?.data?.errors?.phone?.[0]
        || err.message 
        || '認証に失敗しました。もう一度お試しください。';
      setError(errorMessage);
      console.error('SMS verification error:', err);
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
      // Extract error message from API response
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.errors?.phone?.[0]
        || err.message 
        || 'SMS再送に失敗しました。もう一度お試しください。';
      setError(errorMessage);
      console.error('SMS resend error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 bg-primary">
          <button onClick={onBack} className="text-white hover:text-secondary cursor-pointer">
            <ChevronLeft />
          </button>
          <h1 className="flex-1 text-center text-lg font-medium mr-6 text-white">電話番号の入力</h1>
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4">
            <div className="text-sm text-white mb-2">電話番号を入力してください</div>
            <div className="mt-4 p-0">
              <input
                type="tel"
                value={phoneNumber}
                placeholder='例) 07542132114'
                maxLength={11}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                className="w-full text-lg border border-white/20 rounded bg-primary text-white placeholder-secondary p-2 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/60"
                disabled={loading}
              />
            </div>
            <div className="text-xs text-white mt-2">※ハイフンなし</div>
            <div className="text-xs text-white mt-4 leading-relaxed">
              Pishattoは、携帯電話番号の認証のため、SMS(テキスト)が送信されます。これには、SMS料金及びデータ料金がかかる場合があります。
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </div>
        {/* Fixed Bottom Button */}
        <div className="p-4 mb-[100px]">
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
    <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 bg-primary">
        <button onClick={() => setStep('phone')} className="text-white hover:text-secondary cursor-pointer">
          <ChevronLeft />
        </button>
        <h1 className="flex-1 text-center text-lg font-medium mr-6 text-white">認証コードの入力</h1>
      </div>
      {/* Main Content */}
      <div className="flex-1">  
        <div className="p-4" onPaste={handleCodePaste}>
          <div className="p-4 rounded-lg">
            <div className="text-sm text-white mb-4">送信された6桁の認証コードを入力してください。</div>
            {/* Verification Code Input */}
            <div
              className="flex justify-center gap-1 sm:gap-2 mb-4"
              role="group"
              aria-label="6桁の認証コード入力"
            >
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={`コード ${index + 1} 桁目`}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onFocus={(e) => e.currentTarget.select()}
                  ref={(el) => (inputsRef.current[index] = el)}
                  className="w-10 h-10 sm:w-[45px] sm:h-[45px] text-center text-base sm:text-lg border border-white/20 rounded-md bg-primary text-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/60 flex-shrink-0"
                  disabled={loading}
                />
              ))}
            </div>
            {/* {displayedCode && <div className="text-sm text-white mb-4">送信された認証コード: {displayedCode}</div>} */}
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
      <div className="p-4 mb-[100px]">
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