import { ChevronLeft, Lock } from 'lucide-react';
import React from 'react';

const IdentityVerificationScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 pt-6 pb-6">
                <button onClick={onBack} className="mr-2 text-2xl text-white">
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold -ml-8 text-white">本人認証</span>
            </div>
            {/* Red instruction section */}
            <div className="bg-primary text-white text-center py-6 px-4">
                <div className="text-xl font-bold mb-2">本人確認書類を撮影してください</div>
                <div className="text-sm">安心してpishattoをご利用いただくために、<br />ご協力をお願いいたします。</div>
            </div>
            {/* Phone + ID illustration */}
            <div className="flex justify-center -mt-10 mb-8">
                {/* Placeholder illustration */}
                <svg width="300" height="120" viewBox="0 0 300 120" fill="none">
                    <rect x="10" y="20" width="280" height="80" rx="20" fill="#fff" stroke="#bbb" strokeWidth="4" />
                    <rect x="60" y="40" width="180" height="40" rx="4" fill="#eee" stroke="#bbb" strokeWidth="2" />
                    <rect x="70" y="50" width="100" height="10" rx="2" fill="#ffe066" />
                    <rect x="70" y="65" width="60" height="6" rx="2" fill="#ccc" />
                    <rect x="180" y="50" width="30" height="20" rx="4" fill="#b3e5fc" />
                </svg>
            </div>
            {/* Acceptable documents */}
            <div className="text-center font-bold text-lg mb-">登録可能な本人確認書類</div>
            <div className="flex justify-center gap-8 mb-6">
                <div className="flex flex-col items-center">
                    {/* License icon */}
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><rect x="2" y="2" width="60" height="36" rx="4" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="8" y="8" width="30" height="6" rx="2" fill="#ffe066" /><rect x="8" y="18" width="20" height="4" rx="2" fill="#ccc" /><rect x="40" y="8" width="12" height="12" rx="3" fill="#b3e5fc" /></svg>
                    <span className="text-xs mt-1">免許証</span>
                </div>
                <div className="flex flex-col items-center">
                    {/* Passport icon */}
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><rect x="8" y="4" width="20" height="32" rx="4" fill="#e53935" /><rect x="36" y="4" width="20" height="32" rx="4" fill="#3949ab" /></svg>
                    <span className="text-xs mt-1">パスポート</span>
                </div>
                <div className="flex flex-col items-center">
                    {/* MyNumber icon */}
                    <svg width="64" height="40" viewBox="0 0 64 40" fill="none"><rect x="2" y="2" width="60" height="36" rx="4" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="8" y="8" width="30" height="6" rx="2" fill="#b3e5fc" /><rect x="8" y="18" width="20" height="4" rx="2" fill="#ccc" /><rect x="40" y="8" width="12" height="12" rx="3" fill="#ffe066" /></svg>
                    <span className="text-xs mt-1">マイナンバー</span>
                </div>
            </div>
            {/* Info box */}
            <div className="mx-4 border border-secondary rounded-xl bg-primary py-4 px-4 mb-24 flex flex-col items-center">
                <Lock className="text-white mb-2" />
                <div className="font-bold mb-1 text-white">お客様情報は厳重に管理しています</div>
                <div className="text-xs text-white text-center">提出いただいた証明書の画像は本人確認のみに使用し、<br />他の目的には一切使用しません。</div>
            </div>
            {/* Start button */}
            <div className="px-4">
                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg">本人認証をはじめる</button>
            </div>
        </div>
    );
};

export default IdentityVerificationScreen; 