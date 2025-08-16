/* eslint-disable */
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LineData {
    line_id: string;
    line_email?: string;
    line_name?: string;
    line_avatar?: string;
}

const LineRegister: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Prefer state passed from navigation; fallback to query params when arriving via server redirect
    const queryParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const lineData: LineData = location.state?.lineData || {
        line_id: queryParams.get('line_id') || '',
        line_email: queryParams.get('line_email') || undefined,
        line_name: queryParams.get('line_name') || undefined,
        line_avatar: queryParams.get('line_avatar') || undefined,
    };
    const userType: 'guest' | 'cast' = (location.state?.userType as 'guest' | 'cast') || ((queryParams.get('user_type') as 'guest' | 'cast') || 'guest');

    useEffect(() => {
        // Store LINE data in sessionStorage for the registration steps to use
        if (lineData.line_id) {
            sessionStorage.setItem('lineData', JSON.stringify(lineData));
            sessionStorage.setItem('lineUserType', userType);
            
            // Redirect to the registration steps
            navigate('/register', { 
                state: { 
                    fromLine: true, 
                    lineData: lineData,
                    userType: userType 
                } 
            });
        }
    }, [lineData, userType, navigate]);

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
        <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary flex items-center justify-center p-6">
            <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-4">LINE認証完了</h1>
                <p>登録手順に進んでいます...</p>
                <div className="mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default LineRegister;
