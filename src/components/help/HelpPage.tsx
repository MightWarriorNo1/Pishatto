import { ChevronLeft } from 'lucide-react';
import React from 'react';

const HelpPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => (
    <div className="max-w-md mx-auto min-h-screen bg-primary">
        <div className="flex items-center px-4 py-3 border-b bg-primary border-secondary">
            {onBack && <button onClick={onBack} className="mr-2 text-2xl text-white">
                <ChevronLeft />
            </button>}
            <span className="text-lg font-bold flex-1 text-center text-white">ヘルプ</span>
        </div>
        <div className="p-6">
            <h2 className="font-bold text-xl mb-4 text-white">よくある質問</h2>
            <div className="mb-4">
                <div className="font-bold mb-1 text-white">Q. サービスの使い方は？</div>
                <div className="text-white">A. 画面の案内に従ってご利用ください。</div>
            </div>
            <div className="mb-4">
                <div className="font-bold mb-1 text-white">Q. 問い合わせ先は？</div>
                <div className="text-white">A. サポート窓口までご連絡ください。</div>
            </div>
            <div className="mb-4">
                <div className="font-bold mb-1 text-white">Q. パスワードを忘れた場合は？</div>
                <div className="text-white">A. ログイン画面の「パスワードを忘れた方はこちら」から再設定できます。</div>
            </div>
            <div className="mb-4">
                <div className="font-bold mb-1 text-white">Q. 利用料金はかかりますか？</div>
                <div className="text-white">A. 基本的なサービスは無料でご利用いただけます。一部有料機能もございます。</div>
            </div>
            <div className="mb-4">
                <div className="font-bold mb-1 text-white">Q. 対応ブラウザは？</div>
                <div className="text-white">A. 最新のChrome、Firefox、Edge、Safariに対応しています。</div>
            </div>
        </div>
    </div>
);

export default HelpPage;