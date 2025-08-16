/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../utils/csrf';
import { API_ENDPOINTS } from '../config/api';
import { useUser } from '../contexts/UserContext';
import { useCast } from '../contexts/CastContext';

interface LineData {
    line_id: string;
    line_email?: string;
    line_name?: string;
    line_avatar?: string;
}

const LineRegister: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useUser();
    const { setCast } = useCast();
    
    const [formData, setFormData] = useState({
        nickname: '',
        phone: '',
        location: '',
        birth_year: '',
        height: '',
        residence: '',
        birthplace: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
        // Pre-fill form with Line data if available
        if (lineData.line_name) {
            setFormData(prev => ({
                ...prev,
                nickname: lineData.line_name || ''
            }));
        }
    }, [lineData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const csrfToken = await getCsrfToken();
            const formDataToSend = JSON.stringify({
                user_type: userType,
                line_id: lineData.line_id,
                line_email: lineData.line_email,
                line_name: lineData.line_name,
                line_avatar: lineData.line_avatar,
                additional_data: formData
            });

            const response = await fetch(API_ENDPOINTS.LINE_REGISTER, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                if (data.user_type === 'guest') {
                    setUser(data.user);
                    navigate('/dashboard');
                } else if (data.user_type === 'cast') {
                    setCast(data.user);
                    navigate('/cast/dashboard');
                }
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Registration failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="min-h-screen bg-gradient-to-b from-primary via-gray-800 to-secondary p-6">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {userType === 'guest' ? 'ゲスト' : 'キャスト'}登録
                    </h1>
                    <p className="text-gray-300">
                        Lineアカウントでログインしました。追加情報を入力してください。
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            ニックネーム *
                        </label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="ニックネームを入力"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            電話番号
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="電話番号（任意）"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            居住地
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="居住地（任意）"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            生年
                        </label>
                        <input
                            type="number"
                            name="birth_year"
                            value={formData.birth_year}
                            onChange={handleInputChange}
                            min="1900"
                            max="2024"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="生年（任意）"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            身長
                        </label>
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            min="100"
                            max="250"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                            placeholder="身長cm（任意）"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-secondary hover:bg-red-400 disabled:bg-gray-400 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/60 transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                登録中...
                            </div>
                        ) : (
                            '登録完了'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LineRegister;
