import React from 'react';
import CastLoginOptions from '../../components/cast/auth/CastLoginOptions';

const CastLogin: React.FC = () => {
    const handleNext = () => {
        // Handle cast login next step
        console.log('Cast login next step');
    };

    return <CastLoginOptions onNext={handleNext} />;
};

export default CastLogin; 