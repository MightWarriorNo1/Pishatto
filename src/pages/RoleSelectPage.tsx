import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelect from '../components/auth/RoleSelect';
import { useUser } from '../contexts/UserContext';
import { useCast } from '../contexts/CastContext';

const RoleSelectPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    const { cast, loading: castLoading } = useCast();

    useEffect(() => {
        console.log('RoleSelectPage: checking authentication state:', { user, cast, userLoading, castLoading });
        
        if (!userLoading && !castLoading) {
            if (user) {
                console.log('RoleSelectPage: user authenticated, navigating to /dashboard');
                navigate('/dashboard');
            } else if (cast) {
                console.log('RoleSelectPage: cast authenticated, navigating to /cast/dashboard');
                navigate('/cast/dashboard');
            }
        }
    }, [user, cast, userLoading, castLoading, navigate]);

    const handleSelect = (role: 'guest' | 'cast') => {
        if (role === 'guest') {
            navigate('/register'); // Guest registration flow
        } else {
            navigate('/cast/login'); // Cast login flow
        }
    };

    // Show loading while checking authentication
    if (userLoading || castLoading) {
        return (
            <div className="min-h-screen max-w-md mx-auto bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    if (user || cast) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-md mx-auto">
                <RoleSelect onSelect={handleSelect} />
            </div>
        </div>
    );
};

export default RoleSelectPage; 