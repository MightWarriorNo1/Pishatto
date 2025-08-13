import React from 'react';
import LineLogin from '../components/auth/steps/LineLogin';

const GuestLineLogin: React.FC = () => {
    const handleLineSuccess = (user: any) => {
        console.log('Guest Line login successful:', user);
        // Additional guest-specific logic can be added here
    };

    const handleLineError = (error: string) => {
        console.error('Guest Line login error:', error);
        // Handle guest-specific errors
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