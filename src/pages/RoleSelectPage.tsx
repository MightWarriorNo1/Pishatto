import React from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelect from '../components/auth/RoleSelect';

const RoleSelectPage: React.FC = () => {
    const navigate = useNavigate();

    const handleSelect = (role: 'guest' | 'cast') => {
        if (role === 'guest') {
            navigate('/register'); // Guest registration flow
        } else {
            navigate('/cast/login'); // Cast login flow
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto">
                <RoleSelect onSelect={handleSelect} />
            </div>
        </div>
    );
};

export default RoleSelectPage; 