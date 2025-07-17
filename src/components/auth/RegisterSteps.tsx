import React from 'react';
import { useState } from 'react';
import LoginOptions from './steps/LoginOptions';
import PhoneVerification from './steps/PhoneVerification';
import LocationSelect from './steps/LocationSelect';
import NicknameInput from './steps/NicknameInput';
import InterestTags from './steps/InterestTags';
import ProfilePhoto from './steps/ProfilePhoto';
import Completion from './steps/Completion';

interface FormData {
  phoneNumber: string;
  verificationCode: string;
  location: string;
  nickname: string;
  interests: string[];
  profilePhoto: File | null;
}

const RegisterSteps: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
    location: '',
    nickname: '',
    interests: [],
    profilePhoto: null,
  });

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LoginOptions onNext={handleNextStep} />;
      case 2:
        return <PhoneVerification onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 3:
        return <LocationSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 4:
        return <NicknameInput onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 5:
        return <InterestTags onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 6:
        return <ProfilePhoto onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 7:
        return <Completion />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-primary rounded-2xl shadow-lg p-8 border border-secondary">
        {renderStep()}
      </div>
    </div>
  );
};

export default RegisterSteps; 