import React from 'react';
import { useNavigate } from 'react-router-dom';
import LineLogin from '../components/auth/steps/LineLogin';

const GuestLineLogin: React.FC = () => {
    const navigate = useNavigate();

    const handleLineSuccess = (user: any) => {
        console.log('Guest Line login successful:', user);
        
        // Check if user came from cast registration
        const hasCastFormData = sessionStorage.getItem('cast_register_form_data');
        if (hasCastFormData) {
            // For cast registration, check both possible LINE ID locations
            const lineId = user?.line_data?.line_id || user?.line_id;
            if (lineId) {
                // Store the LINE ID for cast registration
                sessionStorage.setItem('cast_line_id', lineId);
                // Navigate back to cast register page
                navigate('/cast/register');
                return;
            }
        }
        
        // Default guest flow - navigate to dashboard
        navigate('/dashboard');
    };

    const handleLineError = (error: string) => {
        console.error('Guest Line login error:', error);
        
        // Check if user came from cast registration
        const hasCastFormData = sessionStorage.getItem('cast_register_form_data');
        if (hasCastFormData) {
            // Navigate back to cast register page even on error
            navigate('/cast/register');
            return;
        }
        
        // Default error handling for guest flow
        console.error('Guest Line login error:', error);
    };

    return (
        <LineLogin 
            userType="guest"
            onSuccess={handleLineSuccess}
            onError={handleLineError}
        />
    );
};

export default GuestLineLogin;