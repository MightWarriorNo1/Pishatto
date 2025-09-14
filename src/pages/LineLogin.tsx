import React from 'react';
import { useNavigate } from 'react-router-dom';
import LineLogin from '../components/auth/steps/LineLogin';

const GuestLineLogin: React.FC = () => {
    const navigate = useNavigate();

    const handleLineSuccess = (user: any) => {
        console.log('Guest Line login successful:', user);
        console.log('User structure:', {
            hasLineData: !!user?.line_data,
            lineDataKeys: user?.line_data ? Object.keys(user.line_data) : [],
            hasLineId: !!user?.line_id,
            userType: user?.user_type,
            success: user?.success
        });
        
        // Check if user came from cast registration
        const hasCastFormData = sessionStorage.getItem('cast_register_form_data');
        console.log('LINE login success - hasCastFormData:', !!hasCastFormData, 'user:', user);
        
        if (hasCastFormData || user?.user_type === 'cast_registration') {
            console.log('Processing cast registration flow...');
            // For cast registration, check multiple possible LINE ID locations
            const lineId = user?.line_data?.line_id || user?.line_id || user?.lineId;
            console.log('Extracted LINE ID:', lineId, 'from user:', user);
            console.log('Checking user.line_data:', user?.line_data);
            console.log('Checking user.line_id:', user?.line_id);
            console.log('Checking user.lineId:', user?.lineId);
            
            if (lineId) {
                // Store the LINE ID for cast registration
                sessionStorage.setItem('cast_line_id', lineId);
                console.log('Stored LINE ID in sessionStorage:', lineId);
                // Navigate back to cast register page
                navigate('/cast/register');
                return;
            } else {
                console.error('No LINE ID found in response:', user);
                console.error('Available keys in user object:', Object.keys(user || {}));
                // Still navigate back to cast register page even without LINE ID
                navigate('/cast/register');
                return;
            }
        }
        
        // Default guest flow - navigate to dashboard
        console.log('Navigating to guest dashboard...');
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