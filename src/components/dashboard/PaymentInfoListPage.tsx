import React from 'react';

interface PaymentInfoListPageProps {
    onBack: () => void;
}

const PaymentInfoListPage: React.FC<PaymentInfoListPageProps> = ({ onBack }) => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
                <button onClick={onBack} className="mr-2 text-2xl text-white">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center text-white">お支払い情報</span>
            </div>
            {/* Card list */}
            <div className="bg-primary px-4 py-2 text-sm font-bold text-white border-b border-secondary">お支払い情報</div>
            <div className="divide-y divide-secondary">
                <div className="flex items-center justify-between px-4 py-4 bg-primary">
                    <span className="text-white">************1680</span>
                    <span className="flex items-center gap-1 text-white text-xs font-bold">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF0000" /><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        3Dセキュア認証済み
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff" /><path d="M7 13l3 3 7-7" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                </div>
                <div className="flex items-center justify-between px-4 py-4 bg-primary">
                    <span className="text-white">************1004</span>
                    <span className="w-5 h-5 border-2 border-secondary rounded-full inline-block"></span>
                </div>
            </div>
            <div className="bg-primary text-white font-bold px-4 py-3 mt-4">お支払い情報を追加する</div>
            <div className="px-4 py-3 text-xs text-gray-600">
                ※上記でご選択いただいているカードで決済エラーとなる場合、自動的に他に登録いただいているカードで決済が行われる仕様となっております。<br />
                カード情報を削除する際は、削除したいカードを左へスワイプしていただければ幸いです。<br /><br />
                ※カードに名義の記載がない場合は、ご本人様の氏名を入力してください。
            </div>
        </div>
    );
};

export default PaymentInfoListPage; 