/* eslint-disable */
import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LocationSelect from './steps/LocationSelect';
import NicknameInput from './steps/NicknameInput';
import InterestTags from './steps/InterestTags';
import AgeSelect from './steps/AgeSelect';
import ShiatsuSelect from './steps/ShiatsuSelect';
import ProfilePhoto from './steps/ProfilePhoto';
import Completion from './steps/Completion';
import { guestRegister, GuestInterest } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

interface LineData {
    line_id: string;
    line_email?: string;
    line_name?: string;
    line_avatar?: string;
}

interface FormData {
    favorite_area: string;
    nickname: string;
    interests: GuestInterest[];
    profilePhoto: File | null;
    age: string;
    shiatsu: string;
}

const LineRegisterSteps: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useUser();
    
    // Get LINE data from URL params or location state
    const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const lineData: LineData = location.state?.lineData || {
        line_id: queryParams.get('line_id') || '',
        line_email: queryParams.get('line_email') || undefined,
        line_name: queryParams.get('line_name') || undefined,
        line_avatar: queryParams.get('line_avatar') || undefined,
    };
    const userType: 'guest' | 'cast' = (location.state?.userType as 'guest' | 'cast') || ((queryParams.get('user_type') as 'guest' | 'cast') || 'guest');

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        favorite_area: '',
        nickname: lineData.line_name || '',
        interests: [],
        profilePhoto: null,
        age: '',
        shiatsu: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationError, setRegistrationError] = useState<string | null>(null);

    // Redirect if no LINE data
    useEffect(() => {
        if (!lineData.line_id) {
            navigate('/');
        }
    }, [lineData.line_id, navigate]);

    const handleNextStep = async () => {
        console.log('LineRegisterSteps: handleNextStep called, current step:', currentStep);
        
        // If we're moving to the completion step, submit the data
        if (currentStep === 6) { // ProfilePhoto step, next is Completion
            console.log('LineRegisterSteps: Processing step 6 (ProfilePhoto), submitting registration');
            setIsSubmitting(true);
            setRegistrationError(null);
            try {
                // Use FormData to handle file upload properly
                const formDataToSend = new FormData();
                formDataToSend.append('user_type', userType);
                formDataToSend.append('line_id', lineData.line_id);
                if (lineData.line_email) {
                    formDataToSend.append('line_email', lineData.line_email);
                }
                if (lineData.line_name) {
                    formDataToSend.append('line_name', lineData.line_name);
                }
                if (lineData.line_avatar) {
                    formDataToSend.append('line_avatar', lineData.line_avatar);
                }
                
                // Add additional data as JSON string
                const additionalData = {
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

                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/register`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    credentials: 'include',
                    body: formDataToSend
                });

                const data = await response.json();

                if (data.success) {
                    if (data.user_type === 'guest') {
                        console.log('LineRegisterSteps: Registration successful, setting user data');
                        setUser(data.user);
                    }
                    setCurrentStep((prev) => prev + 1);
                } else {
                    throw new Error(data.message || 'Registration failed');
                }
            } catch (error: any) {
                console.error('LineRegisterSteps: Registration failed:', error);
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
            console.log('LineRegisterSteps: Moving from step', currentStep, 'to step', currentStep + 1);
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
                return <LocationSelect onNext={handleNextStep} onBack={() => navigate('/')} updateFormData={updateFormData} formData={formData} />;
            case 2:
                return <NicknameInput onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
            case 3:
                return <InterestTags onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
            case 4:
                return <AgeSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
            case 5:
                return <ShiatsuSelect onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} />;
            case 6:
                return <ProfilePhoto onNext={handleNextStep} onBack={handlePrevStep} updateFormData={updateFormData} formData={formData} isSubmitting={isSubmitting} />;
            case 7:
                return <Completion />;
            default:
                return null;
        }
    };

    if (!lineData.line_id) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary flex items-center justify-center p-6">
                <div className="text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">エラー</h1>
                    <p>Line認証情報が見つかりません</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-secondary rounded-full hover:bg-red-400"
                    >
                        ホームに戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full mx-auto bg-primary rounded-2xl shadow-lg border border-secondary">
                {renderStep()}
            </div>
        </div>
    );
};

export default LineRegisterSteps;
