import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleSelect from '../components/auth/RoleSelect';
import { useUser } from '../contexts/UserContext';
import { useCast } from '../contexts/CastContext';
import Spinner from '../components/ui/Spinner';

const RoleSelectPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: userLoading } = useUser();
    const { cast, loading: castLoading } = useCast();
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    useEffect(() => {
        console.log('RoleSelectPage: checking authentication state:', { user, cast, userLoading, castLoading });
        
        // Only proceed with navigation after both contexts have finished loading
        if (!userLoading && !castLoading && !hasCheckedAuth) {
            setHasCheckedAuth(true);
            
            if (cast) {
                console.log('RoleSelectPage: cast authenticated, navigating to /cast/dashboard');
                navigate('/cast/dashboard');
            } else if (user) {
                console.log('RoleSelectPage: user authenticated, navigating to /dashboard');
                navigate('/dashboard');
            }
        }
    }, [user, cast, userLoading, castLoading, hasCheckedAuth, navigate]);

    const handleSelect = (role: 'guest' | 'cast') => {
        console.log('RoleSelectPage: Role selected:', role);
        if (role === 'guest') {
            console.log('RoleSelectPage: Navigating to /register for guest');
            navigate('/register'); // Guest registration flow
        } else {
            console.log('RoleSelectPage: Navigating to /cast/login for cast');
            navigate('/cast/login'); // Cast login flow
        }
    };

    // Show loading while checking authentication
    if (userLoading || castLoading || !hasCheckedAuth) {
        return (
            <div className="min-h-screen max-w-md mx-auto bg-gradient-to-b from-primary to-secondary flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Don't render anything if user is already authenticated
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