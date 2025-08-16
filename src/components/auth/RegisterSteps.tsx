/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

interface LineData {
  line_id: string;
  line_email?: string;
  line_name?: string;
  line_avatar?: string;
}

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
  const location = useLocation();
  const { setUser, setPhone } = useUser();
  
  // Check if user is coming from LINE login
  const fromLine = location.state?.fromLine || false;
  const lineData: LineData | null = location.state?.lineData || null;
  
  // If coming from LINE, start at step 2 (PhoneVerification) instead of step 1
  const [currentStep, setCurrentStep] = useState(fromLine ? 2 : 1);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    verificationCode: '',
    favorite_area: '',
    nickname: lineData?.line_name || '',
    interests: [],
    profilePhoto: null,
    age: '',
    shiatsu: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Check sessionStorage for LINE data on component mount
  useEffect(() => {
    const storedLineData = sessionStorage.getItem('lineData');
    const storedLineUserType = sessionStorage.getItem('lineUserType');
    
    if (storedLineData && storedLineUserType === 'guest' && !fromLine) {
      // User has LINE data in sessionStorage but not in location state
      // This might happen if they refreshed the page
      try {
        const parsedLineData = JSON.parse(storedLineData);
        // Update the component state to reflect LINE registration
        setCurrentStep(2); // Start at PhoneVerification
        setFormData(prev => ({
          ...prev,
          nickname: parsedLineData.line_name || prev.nickname
        }));
      } catch (error) {
        console.error('Error parsing stored LINE data:', error);
        // Clear invalid data
        sessionStorage.removeItem('lineData');
        sessionStorage.removeItem('lineUserType');
      }
    }
  }, [fromLine]);

  // Add a header message for LINE users
  const isLineRegistration = fromLine || sessionStorage.getItem('lineData');

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
          console.log('RegisterSteps: Existing guest found');
          
          // If coming from LINE, link the LINE account to existing guest
          const storedLineData = sessionStorage.getItem('lineData');
          if (fromLine || storedLineData) {
            console.log('RegisterSteps: Linking LINE account to existing guest');
            const finalLineData = lineData || (storedLineData ? JSON.parse(storedLineData) : null);
            
            if (finalLineData) {
              try {
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/link-account`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    user_type: 'guest',
                    user_id: guest.id,
                    line_id: finalLineData.line_id
                  })
                });

                const data = await response.json();
                if (data.success) {
                  console.log('RegisterSteps: LINE account linked successfully');
                  // Clear LINE data from sessionStorage
                  sessionStorage.removeItem('lineData');
                  sessionStorage.removeItem('lineUserType');
                  // Set user and redirect to dashboard
                  setUser(data.user || guest);
                  setPhone(formData.phoneNumber);
                  window.location.href = '/dashboard';
                  return;
                } else {
                  throw new Error(data.message || 'Failed to link LINE account');
                }
              } catch (error: any) {
                console.error('RegisterSteps: Failed to link LINE account:', error);
                alert('LINEアカウントの連携に失敗しました: ' + error.message);
                return;
              }
            }
          } else {
            // Regular phone login - redirect to dashboard
            console.log('RegisterSteps: Existing guest found, redirecting to dashboard');
            setUser(guest);
            setPhone(formData.phoneNumber);
            window.location.href = '/dashboard';
            return;
          }
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
        // If coming from LINE, use LINE registration endpoint
        const storedLineData = sessionStorage.getItem('lineData');
        const finalLineData = lineData || (storedLineData ? JSON.parse(storedLineData) : null);
        
        if ((fromLine || storedLineData) && finalLineData) {
          // Use FormData to handle file upload properly
          const formDataToSend = new FormData();
          formDataToSend.append('user_type', 'guest');
          formDataToSend.append('line_id', finalLineData.line_id);
          if (finalLineData.line_email) {
            formDataToSend.append('line_email', finalLineData.line_email);
          }
          if (finalLineData.line_name) {
            formDataToSend.append('line_name', finalLineData.line_name);
          }
          if (finalLineData.line_avatar) {
            formDataToSend.append('line_avatar', finalLineData.line_avatar);
          }
          
          // Add additional data as JSON string
          const additionalData = {
            phone: formData.phoneNumber,
            verificationCode: formData.verificationCode,
            nickname: formData.nickname,
            favorite_area: formData.favorite_area,
            location: formData.favorite_area,
            interests: formData.interests,
            age: formData.age,
            shiatsu: formData.shiatsu,
          };
          formDataToSend.append('additional_data', JSON.stringify(additionalData));
          
          // Add profile photo if present
          if (formData.profilePhoto) {
            formDataToSend.append('profile_photo', formData.profilePhoto);
          }

          // Get CSRF token from meta tag or global function
          let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
          if (!csrfToken && (window as any).csrfUtils?.getToken) {
            csrfToken = (window as any).csrfUtils.getToken();
          }
          if (!csrfToken) {
            throw new Error('CSRF token not found. Please refresh the page and try again.');
          }

          let response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/register`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            body: formDataToSend
          });

          // If we get a 419 error, try to refresh the CSRF token and retry
          if (response.status === 419) {
            console.log('CSRF token expired, refreshing...');
            if ((window as any).csrfUtils?.refreshToken) {
              const newToken = await (window as any).csrfUtils.refreshToken();
              if (newToken) {
                // Retry with new token
                response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/register`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': newToken,
                    'X-Requested-With': 'XMLHttpRequest',
                  },
                  credentials: 'include',
                  body: formDataToSend
                });
              }
            }
          }

          const data = await response.json();

          if (data.success) {
            console.log('RegisterSteps: LINE registration successful, setting user data');
            setUser(data.user);
            setPhone(formData.phoneNumber);
            // Clear LINE data from sessionStorage
            sessionStorage.removeItem('lineData');
            sessionStorage.removeItem('lineUserType');
          } else {
            throw new Error(data.message || 'Registration failed');
          }
        } else {
          // Regular phone registration
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
        // If coming from LINE, skip LoginOptions and go to PhoneVerification
        if (fromLine) {
          return <PhoneVerification onNext={handleNextStep} onBack={() => window.history.back()} updateFormData={updateFormData} formData={formData} />;
        }
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
        {isLineRegistration && (
          <div className="p-4 bg-secondary/20 border-b border-secondary/30">
            <div className="text-center text-white text-sm">
              <div className="font-semibold mb-1">LINEログイン</div>
              <div>電話番号認証でアカウントを完成させてください</div>
            </div>
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
};

export default RegisterSteps; 