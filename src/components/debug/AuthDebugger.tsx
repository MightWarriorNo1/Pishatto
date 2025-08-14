import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useCast } from '../../contexts/CastContext';

const AuthDebugger: React.FC = () => {
  const { user, loading: userLoading, checkLineAuthentication } = useUser();
  const { cast, loading: castLoading, checkLineAuthentication: checkCastLineAuth } = useCast();

  const handleCheckGuestLineAuth = async () => {
    console.log('Checking guest Line auth...');
    await checkLineAuthentication();
  };

  const handleCheckCastLineAuth = async () => {
    console.log('Checking cast Line auth...');
    await checkCastLineAuth();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Auth Debugger</h3>
      <div className="space-y-1">
        <div>User Loading: {userLoading ? 'Yes' : 'No'}</div>
        <div>Cast Loading: {castLoading ? 'Yes' : 'No'}</div>
        <div>User: {user ? `ID: ${user.id}` : 'None'}</div>
        <div>Cast: {cast ? `ID: ${cast.id}` : 'None'}</div>
      </div>
      <div className="mt-2 space-y-1">
        <button 
          onClick={handleCheckGuestLineAuth}
          className="bg-blue-500 px-2 py-1 rounded text-xs mr-1"
        >
          Check Guest Line
        </button>
        <button 
          onClick={handleCheckCastLineAuth}
          className="bg-green-500 px-2 py-1 rounded text-xs"
        >
          Check Cast Line
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;
