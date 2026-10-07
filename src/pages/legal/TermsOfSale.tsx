import React from 'react';
import LegalLayout from './LegalLayout';

// Terms of Sale (特定商取引法に基づく表記)
const TermsOfSale: React.FC = () => {
  return (
    <LegalLayout title="特定商取引法に基づく表記">
      <div className="overflow-x-auto rounded-lg ring-1 ring-white/15">
          <table className="w-full text-sm">
            <tbody>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-top">運営会社</th>
                <td className="p-3 text-white/90">株式会社ジーンクエスト</td>
              </tr>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-top">業種</th>
                <td className="p-3 text-white/90">情報通信業</td>
              </tr>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-top">責任者</th>
                <td className="p-3 text-white/90">冨樫裕也</td>
              </tr>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-top">メールアドレス</th>
                <td className="p-3"><a className="underline text-white" href="mailto:info@pishatto.jp">info@pishatto.jp</a></td>
              </tr>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-center">所在地</th>
                <td className="p-3 text-white/90">
                東京都港区一丁目4番5号
                </td>
              </tr>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-top">企業URL</th>
                <td className="p-3"><a className="underline text-white" href="https://pishatto.jp/welcome/" target="_blank" rel="noreferrer">https://pishatto.jp/welcome/</a></td>
              </tr>
              <tr className="odd:bg-white/5">
                <th className="w-40 p-3 text-left font-semibold align-top">営業時間</th>
                <td className="p-3 text-white/90">平日9時から18時まで（土日祝日は休業）</td>
              </tr>
            </tbody>
          </table>
      </div>
    </LegalLayout>
  );
};

export default TermsOfSale;


