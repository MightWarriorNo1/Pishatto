import React from 'react';
import { ChevronLeft } from 'lucide-react';

const CastImmediatePaymentPage: React.FC = () => {
    // Mock data
    const totalPoints = 133920;
    const immediatePoints = 66960;
    const fee = 3717;
    const amount = 63243;
    return (
        <div className="max-w-md mx-auto min-h-screen bg-primary">
            {/* Top bar */}
            <div className="flex items-center px-4 pt-4 pb-2 border-b border-secondary bg-primary">
                <button className="mr-2 text-2xl text-white" onClick={() => window.history.back()}>
                    <ChevronLeft />
                </button>
                <span className="flex-1 text-center text-base font-bold text-white">すぐ入金</span>
            </div>
            {/* Main section */}
            <div className="px-4 py-6">
                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="text-xs text-white mb-1">すぐ入金対象ポイント</div>
                    <div className="text-3xl font-bold text-center mb-2 text-white">{totalPoints.toLocaleString()} P</div>
                </div>
                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white">すぐ入金対象ポイント <span className="text-xs text-white">*1</span></span>
                        <span className="text-lg font-bold text-white">{immediatePoints.toLocaleString()} P</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white">振り込み手数料 <span className="text-xs text-white">*2 (2%)</span></span>
                        <span className="text-lg font-bold text-white">{fee.toLocaleString()}円</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-white">振込金額</span>
                        <span className="text-lg font-bold text-white">{amount.toLocaleString()}円</span>
                    </div>
                </div>
                <div className="bg-primary rounded-lg shadow-sm p-4 mb-4 border border-secondary">
                    <div className="text-xs text-white mb-2">*1 当月の獲得ポイントの50%分のみ、すぐ入金対象ポイントとなります。</div>
                    <div className="text-xs text-white mb-2">*2 通常振込(未締め・翌月20日振込)の場合、手数料654円のみ。インボイス番号未登録の場合、別途手数料が発生します。</div>
                    <div className="flex gap-2 mb-2">
                        <span className="bg-secondary text-white text-xs rounded px-2 py-1">プラチナキャスト 手数料5%→0%</span>
                        <span className="bg-secondary text-white text-xs rounded px-2 py-1">ゴールドキャスト 手数料5%→2%</span>
                        <span className="bg-secondary text-white text-xs rounded px-2 py-1">シルバーキャスト 手数料5%→4%</span>
                    </div>
                </div>
                <button className="w-full bg-secondary text-white font-bold py-3 rounded-lg text-lg mb-4 hover:bg-red-700 transition">申請する</button>
                <div className="text-xs text-white mb-2">
                    すぐ入金申請について (2021年3月1日より改訂)<br />
                    すぐ入金申請をした時に所持しているポイントのうち、当月の獲得ポイントの50%分のみ【すぐ入金】対象となり、前月の獲得ポイント・残りの獲得ポイント50%は全て当月定期振込分となります。
                </div>
            </div>
        </div>
    );
};

export default CastImmediatePaymentPage; 