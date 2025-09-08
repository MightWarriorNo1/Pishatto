import React from 'react';

interface LineLoginGuideProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'guest' | 'cast';
}

const LineLoginGuide: React.FC<LineLoginGuideProps> = ({ isOpen, onClose, userType }) => {
  if (!isOpen) return null;

  const userTypeText = userType === 'guest' ? 'ゲスト' : 'キャスト';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            LINEログイン
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            {userTypeText}としてLINEアカウントでログインします
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
              📱 LINEアプリがインストール済みの場合
            </h4>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. 【LINEアプリでログイン】をタップ</li>
              <li>2. または、【LINEアプリでログイン】を長押し</li>
              <li>3. 【LINEで開く】を選択</li>
              <li>4. もう一度ログインをお試しください</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              🌐 LINEアプリがインストールされていない場合
            </h4>
            <p className="text-xs text-gray-700">
              App StoreからLINEアプリをダウンロードしてから再度お試しください。
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
              ⚠️ トラブルシューティング
            </h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• インターネット接続を確認</li>
              <li>• LINEアプリを最新版に更新</li>
              <li>• ブラウザをSafariに設定</li>
              <li>• ページを再読み込み</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
          >
            閉じる
          </button>
          
          <button
            onClick={() => {
              onClose();
              // Trigger web-based LINE login as fallback
              const redirectUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/line/redirect?user_type=${userType}`;
              window.location.href = redirectUrl;
            }}
            className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-green-600 transition-colors"
          >
            Webでログイン
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineLoginGuide;
