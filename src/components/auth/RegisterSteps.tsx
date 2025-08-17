/* eslint-disable */
import React, { useState, useEffect } from 'react';
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
import { getCsrfToken, refreshCsrfToken } from '../../utils/csrf';
import { API_ENDPOINTS } from '../../config/api';

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
  
  // Start at step 1 for all users (including LINE users)
  const [currentStep, setCurrentStep] = useState(1);
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
    
    console.log('RegisterSteps: Checking for LINE data', { storedLineData, storedLineUserType, fromLine });
    
    if (storedLineData && storedLineUserType === 'guest') {
      try {
        const parsedLineData = JSON.parse(storedLineData);
        console.log('RegisterSteps: Found stored LINE data', parsedLineData);
        
        // If we have LINE data but no fromLine state, update the state
        if (!fromLine) {
          console.log('RegisterSteps: Setting fromLine to true based on sessionStorage');
          // We can't directly set fromLine, but we can update the form data
          setFormData(prev => ({
            ...prev,
            nickname: parsedLineData.line_name || prev.nickname
          }));
        }
        
        // LINE users start at step 1 (LocationSelect) like regular users
        console.log('RegisterSteps: LINE user starting at step 1 (LocationSelect)');
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
    
    // Special logic after LocationSelect (step 1) for LINE users
    if (currentStep === 1 && (fromLine || sessionStorage.getItem('lineData'))) {
      console.log('RegisterSteps: LINE user completed LocationSelect, skipping to NicknameInput');
      // For LINE users, skip phone verification and go directly to nickname input
      setCurrentStep(3); // Skip step 2 (PhoneVerification)
      return;
    }
    
    // Special logic after PhoneVerification (step 2) - only for non-LINE users
    if (currentStep === 2 && !(fromLine || sessionStorage.getItem('lineData'))) {
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
                const response = await fetch(API_ENDPOINTS.LINE_LINK_ACCOUNT, {
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
    // ProfilePhoto is step 7 for regular users, step 6 for LINE users (since they skip phone verification)
    if (currentStep === 7) { // ProfilePhoto step, next is Completion
      console.log('RegisterSteps: Processing step 7 (ProfilePhoto), submitting registration');
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
          
          // Add form data directly to match database fields
          formDataToSend.append('phone', formData.phoneNumber || '');
          formDataToSend.append('verification_code', formData.verificationCode || '');
          formDataToSend.append('nickname', formData.nickname || '');
          formDataToSend.append('favorite_area', formData.favorite_area || '');
          formDataToSend.append('location', formData.favorite_area || '');
          formDataToSend.append('age', formData.age || '');
          formDataToSend.append('shiatsu', formData.shiatsu || '');
          
          // Handle interests array properly
          if (formData.interests && formData.interests.length > 0) {
            formData.interests.forEach((interest, index) => {
              formDataToSend.append(`interests[${index}][category]`, interest.category);
              formDataToSend.append(`interests[${index}][tag]`, interest.tag);
            });
          }
          
          // Add profile photo if present
          if (formData.profilePhoto) {
            formDataToSend.append('profile_photo', formData.profilePhoto);
          }

          // Get CSRF token using utility function
          const csrfToken = await getCsrfToken();
          if (!csrfToken) {
            throw new Error('CSRF token not found. Please refresh the page and try again.');
          }

          let response = await fetch(API_ENDPOINTS.LINE_REGISTER, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
              'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include',
            body: formDataToSend
          });

          // If we get a 419 error, try to refresh the CSRF token and retry
          if (response.status === 419) {
            console.log('CSRF token expired, refreshing...');
            const newToken = await refreshCsrfToken();
            if (newToken) {
              // Retry with new token
              response = await fetch(API_ENDPOINTS.LINE_REGISTER, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  ...(newToken && { 'X-CSRF-TOKEN': newToken }),
                  'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: formDataToSend
              });
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
    console.log('RegisterSteps: Rendering step', currentStep, 'fromLine:', fromLine, 'isLineRegistration:', isLineRegistration);
    
    // For LINE users, adjust step numbers since they skip phone verification
    const effectiveStep = (fromLine || sessionStorage.getItem('lineData')) && currentStep > 1 ? currentStep - 1 : currentStep;
    
    switch (currentStep) {
      case 1:
        // For LINE users, show LocationSelect directly (skip LoginOptions)
        if (fromLine) {
          console.log('RegisterSteps: LINE user at step 1, showing LocationSelect');
          return <LocationSelect onNext={handleNextStep} onBack={() => window.history.back()} updateFormData={updateFormData} formData={formData} />;
        }
        console.log('RegisterSteps: Regular user at step 1, showing LoginOptions');
        return <LoginOptions onNext={handleNextStep} />;
      case 2:
        // PhoneVerification - only show for non-LINE users
        if (fromLine || sessionStorage.getItem('lineData')) {
          console.log('RegisterSteps: LINE user at step 2, should not see this - redirecting to step 3');
          // This shouldn't happen, but just in case
          setCurrentStep(3);
          return null;
        }
        console.log('RegisterSteps: Regular user at step 2, showing PhoneVerification');
        return <PhoneVerification onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 3:
        console.log('RegisterSteps: Rendering NicknameInput at step 3 (effective step 2 for LINE users)');
        return <NicknameInput onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 4:
        console.log('RegisterSteps: Rendering InterestTags at step 4 (effective step 3 for LINE users)');
        return <InterestTags onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 5:
        console.log('RegisterSteps: Rendering AgeSelect at step 5 (effective step 4 for LINE users)');
        return <AgeSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 6:
        console.log('RegisterSteps: Rendering ShiatsuSelect at step 6 (effective step 5 for LINE users)');
        return <ShiatsuSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
      case 7:
        console.log('RegisterSteps: Rendering ProfilePhoto at step 7 (effective step 6 for LINE users)');
        return <ProfilePhoto onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} isSubmitting={isSubmitting} />;
      case 8:
        console.log('RegisterSteps: Rendering Completion at step 8 (effective step 7 for LINE users)');
        return <Completion />;
      default:
        console.log('RegisterSteps: Unknown step', currentStep);
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