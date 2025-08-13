import React from 'react';
import LineLogin from '../../components/auth/steps/LineLogin';

const CastLineLogin: React.FC = () => {
    const handleLineSuccess = (user: any) => {
        console.log('Cast Line login successful:', user);
        // Additional cast-specific logic can be added here
    };

    const handleLineError = (error: string) => {
        console.error('Cast Line login error:', error);
        // Handle cast-specific errors
    };

    return (
        <LineLogin 
            userType="cast"
            onSuccess={handleLineSuccess}
            onError={handleLineError}
        />
    );
};

export default CastLineLogin;
