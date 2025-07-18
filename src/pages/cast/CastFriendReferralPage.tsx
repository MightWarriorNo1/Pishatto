import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const CastFriendReferralPage: React.FC = () => {
    const [invoice, setInvoice] = useState('');
    const [name, setName] = useState('')
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            {/* Top bar */}
            <div className="flex items-center px-4 pt-4 pb-2 border-b bg-primary border-secondary">
                <button className="mr-2 text-2xl text-white" onClick={() => window.history.back()}>
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">インボイス番号登録</span>
                <button className="text-white font-bold">保存</button>
            </div>
            {/* Form */}
            <div className="px-4 pt-6">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-bold text-white">インボイス番号 <span className="text-white">*</span></label>
                        <span className="text-xs text-white/50">例）1234567890123</span>
                    </div>
                    <input
                        className="w-full border border-secondary rounded px-3 py-2 text-base bg-primary text-white"
                        value={invoice}
                        onChange={e => setInvoice(e.target.value)}
                        placeholder="インボイス番号"
                        maxLength={13}
                    />
                    <div className="text-xs text-white mt-1">インボイス番号は13桁の数字で入力してください。</div>
                </div>
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-bold text-white">名前</label>
                        <span className="text-xs text-white/50">例）キネカ太郎</span>
                    </div>
                    <input
                        className="w-full border border-secondary rounded px-3 py-2 text-base bg-primary text-white"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="名前"
                    />
                </div>
                <div className="text-xs text-white/50 mt-8 mb-2">
                    *1 本サービスでは利用規約上、登録するユーザーを個人と定義しております。個人で登録いただいたインボイス登録番号をご入力ください。
                </div>
            </div>
        </div>
    );
};

export default CastFriendReferralPage; 