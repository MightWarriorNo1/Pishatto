/* eslint-disable */
import React from 'react';
import { useState } from 'react';
import LoginOptions from './steps/LoginOptions';
import PhoneVerification from './steps/PhoneVerification';
import LocationSelect from './steps/LocationSelect';
import NicknameInput from './steps/NicknameInput';
import InterestTags from './steps/InterestTags';
import AgeSelect from './steps/AgeSelect';
import ShiatsuSelect from './steps/ShiatsuSelect';
import ProfilePhoto from './steps/ProfilePhoto';
import Completion from './steps/Completion';
import { guestRegister, GuestInterest, getGuestProfile } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

interface FormData {
  phoneNumber: string;
  verificationCode: string;
  favorite_area: string;
  nickname: string;
  interests: GuestInterest[];
  profilePhoto: File | null;
  age: string;
  shiatsu: string;
}

const RegisterSteps: React.FC = () => {
  const { setUser, setPhone } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
    favorite_area: '',
    nickname: '',
    interests: [],
    profilePhoto: null,
    age: '',
    shiatsu: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const handleNextStep = async () => {
    console.log('RegisterSteps: handleNextStep called, current step:', currentStep);
    
    // Special logic after PhoneVerification (step 2)
    if (currentStep === 2) {
      console.log('RegisterSteps: Processing step 2 (PhoneVerification)');
      // Normalize phone number
      const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '').trim();
      const normalizedInput = normalizePhone(formData.phoneNumber);
      try {
        const { guest } = await getGuestProfile(formData.phoneNumber);
        if (guest && normalizePhone(guest.phone) === normalizedInput) {
          console.log('RegisterSteps: Existing guest found, redirecting to dashboard');
          setUser(guest);
          setPhone(formData.phoneNumber);
          window.location.href = '/dashboard';
          return;
        }
      } catch (e) {
        console.log('RegisterSteps: No existing guest found, continuing to registration');
        // Not found, continue to registration steps
      }
    }
    
    // If we're moving to the completion step, submit the data
    // New: ProfilePhoto is step 8, so completion is step 9 -> Now ProfilePhoto is step 8, so completion is step 9
    if (currentStep === 8) { // ProfilePhoto step, next is Completion
      console.log('RegisterSteps: Processing step 8 (ProfilePhoto), submitting registration');
      setIsSubmitting(true);
      setRegistrationError(null);
      try {
        const response = await guestRegister({
          phone: formData.phoneNumber,
          verificationCode: formData.verificationCode,
          nickname: formData.nickname,
          favorite_area: formData.favorite_area,
          location: formData.favorite_area,
          profilePhoto: formData.profilePhoto,
          interests: formData.interests,
          age: formData.age,
          shiatsu: formData.shiatsu,
        });
        // Store the user data in context
        if (response.guest) {
          console.log('RegisterSteps: Registration successful, setting user data');
          setUser(response.guest);
          setPhone(formData.phoneNumber); 
        }
        setCurrentStep((prev) => prev + 1);
      } catch (error: any) {
        console.error('RegisterSteps: Registration failed:', error);
        if (error.response && error.response.data) {
          console.error('Registration failed:', error.response.data);
          setRegistrationError(JSON.stringify(error.response.data.errors));
          alert('Registration failed: ' + JSON.stringify(error.response.data.errors));
        } else {
          console.error('Registration failed:', error);
          setRegistrationError(error.message);
          alert('Registration failed: ' + error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('RegisterSteps: Moving from step', currentStep, 'to step', currentStep + 1);
      setCurrentStep((prev) => prev + 1);
    }
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
        return <AgeSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 7:
        return <ShiatsuSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 8:
        return <ProfilePhoto onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} isSubmitting={isSubmitting} />;
      case 9:
        return <Completion />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full mx-auto bg-primary rounded-2xl shadow-lg border border-secondary">
        {renderStep()}
      </div>
    </div>
  );
};

export default RegisterSteps; 