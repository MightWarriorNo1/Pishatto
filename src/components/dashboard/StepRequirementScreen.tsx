import { ChevronLeft } from 'lucide-react';
import React from 'react';

const StepRequirementScreen: React.FC = () => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#fafbfc] pb-8">
            {/* Top bar */}
            <div className="flex items-center px-4 pt-6 pb-2">
                <button className="mr-2 text-2xl text-gray-500">
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold -ml-8">ご利用になる前に</span>
            </div>
            {/* Main title */}
            <div className="px-4 mt-2">
                <div className="text-2xl font-bold mb-1">3つのステップを完了してください</div>
                <div className="text-gray-500 text-sm mb-4">すべてのステップが完了すると、pishattoをご利用いただけます。</div>
            </div>
            {/* Step 1: Phone verification (completed) */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4">
                <div className="relative bg-gray-300 h-32 flex items-center justify-center">
                    {/* Phone icon placeholder */}
                    <svg width="60" height="60" fill="none" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="3" fill="#fff" stroke="#bbb" strokeWidth="2" /><rect x="9" y="18" width="6" height="2" rx="1" fill="#bbb" /></svg>
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                        <div className="text-white text-base font-bold">電話番号認証</div>
                        <div className="text-white text-lg font-bold flex items-center mt-1">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#00B900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="ml-2">認証済み</span>
                        </div>
                    </div>
                </div>
                <div className="bg-transparent text-center text-orange-500 font-bold py-2">認証する</div>
            </div>
            {/* Step 2: Credit card registration */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4 bg-white flex items-center">
                <div className="flex items-center flex-1 p-4">
                    {/* Card icon */}
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="3" fill="#f3f4f6" stroke="#bbb" strokeWidth="2" /><rect x="2" y="10" width="20" height="2" fill="#bbb" /></svg>
                    <div className="ml-4">
                        <div className="text-xs text-blue-500 font-bold mb-1">ステップ②</div>
                        <div className="text-base font-bold">クレジットカード登録</div>
                    </div>
                </div>
            </div>
            <div className="mx-4 bg-white border-t-0 rounded-b-xl text-center text-orange-500 font-bold py-2 -mt-4 mb-4">登録する</div>
            {/* Step 3: Identity verification */}
            <div className="mx-4 rounded-xl overflow-hidden mb-4 bg-white flex items-center">
                <div className="flex items-center flex-1 p-4">
                    {/* ID icon */}
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="3" fill="#f3f4f6" stroke="#bbb" strokeWidth="2" /><circle cx="8" cy="12" r="2" fill="#bbb" /><rect x="12" y="11" width="6" height="2" rx="1" fill="#bbb" /></svg>
                    <div className="ml-4">
                        <div className="text-xs text-blue-500 font-bold mb-1">ステップ③</div>
                        <div className="text-base font-bold">本人認証</div>
                        <div className="text-xs text-gray-500">(18歳以上の確認のため)</div>
                    </div>
                </div>
            </div>
            <div className="mx-4 bg-white border-t-0 rounded-b-xl text-center text-orange-500 font-bold py-2 -mt-4">登録する</div>
        </div>
    );
};

export default StepRequirementScreen; 