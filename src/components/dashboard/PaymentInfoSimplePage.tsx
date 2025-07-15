import React from 'react';

interface PaymentInfoSimplePageProps {
    onBack: () => void;
}

const PaymentInfoSimplePage: React.FC<PaymentInfoSimplePageProps> = ({ onBack }) => {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#f3f6fa]">
            {/* Top bar */}
            <div className="flex items-center px-4 py-3 border-b bg-white">
                <button onClick={onBack} className="mr-2 text-2xl text-gray-500">&#60;</button>
                <span className="text-lg font-bold flex-1 text-center">お支払い情報</span>
            </div>
            {/* Add payment info section */}
            <div className="bg-white border-b">
                <div className="text-orange-500 font-bold px-4 py-4 border-b border-orange-100">お支払い情報を追加する</div>
            </div>
            {/* Explanatory text */}
            <div className="px-4 py-4 text-xs text-gray-600">
                ※上記でご選択いただいているカードで決済エラーとなる場合、自動的に他に登録いただいているカードで決済が行われる仕様となっております。<br />
                カード情報を削除する際は、削除したいカードを左へスワイプしていただければ幸いです。<br /><br />
                ※カードに名義の記載がない場合は、ご本人様の氏名を入力してください。
            </div>
        </div>
    );
};

export default PaymentInfoSimplePage; 