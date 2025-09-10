import React, { useState, useMemo } from 'react';
import { X, Download, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useUser } from '../../contexts/UserContext';
import { useCast } from '../../contexts/CastContext';
import QRCodeScanner from './QRCodeScanner';

interface QRCodeModalProps {
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
  const { user } = useUser();
  const { cast, castId } = useCast();
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Determine if this is a cast or guest user
  const isCast = cast && castId;
  const currentUser = isCast ? cast : user;
  const userType = isCast ? 'cast' : 'guest';

  // Generate QR code data - using useMemo to prevent unnecessary re-renders
  const qrData = useMemo(() => JSON.stringify({
    type: `${userType}_profile`,
    userId: currentUser?.id,
    nickname: currentUser?.nickname,
    userType: userType,
    // Removed timestamp to prevent QR code from changing
  }), [currentUser?.id, currentUser?.nickname, userType]);

  // Generate share URL based on user type
  const shareUrl = useMemo(() => {
    if (isCast) {
      return `${window.location.origin}/cast/${currentUser?.id}`;
    } else {
      return `${window.location.origin}/guest/${currentUser?.id}`;
    }
  }, [isCast, currentUser?.id]);

  const handleCopyLink = async () => {
    try {
      // Direct clipboard copy instead of share dialog
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        if (document.body.contains(textArea)) {
            document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('URLのコピーに失敗しました。手動でコピーしてください。');
      }
    }
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `qr-code-${currentUser?.nickname || 'user'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  // const handleShare = async () => {
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: `${user?.nickname || 'User'}'s Profile`,
  //         text: `Check out ${user?.nickname || 'this user'}'s profile!`,
  //         url: shareUrl,
  //       });
  //     } catch (err) {
  //       console.error('Error sharing:', err);
  //     }
  //   } else {
  //     // Fallback to copy link
  //     handleCopyLink();
  //   }
  // };

  const handleScanResult = (data: string) => {
    console.log('Scanned QR code data:', data);
    // Handle the scanned data here
    // You can parse the JSON data and take appropriate action
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'guest_profile') {
        // Navigate to guest profile or show guest info
        alert(`ゲストプロフィール: ${parsedData.nickname}`);
      } else if (parsedData.type === 'cast_profile') {
        // Navigate to cast profile or show cast info
        alert(`キャストプロフィール: ${parsedData.nickname}`);
      }
    } catch (err) {
      // Handle non-JSON QR codes
      alert(`スキャンされたデータ: ${data}`);
    }
    setShowScanner(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">QRコード</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-6">
          <div id="qr-code" className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <QRCodeSVG
              value={qrData}
              size={200}
              level="M"
              includeMargin={true}
              className="w-full h-auto"
            />
          </div>
          
          {/* User Info */}
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {currentUser?.nickname || 'ユーザー'}
            </h3>
            <p className="text-sm text-gray-600">
              QRコードをスキャンしてプロフィールを共有
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-3">
          {/* <button
            onClick={handleShare}
            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            共有
          </button> */}
          
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-secondary text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
          >
            <Copy className="w-5 h-5" />
            {copied ? 'コピー済み' : 'リンク'}
          </button>
        </div>


        {/* Download Button */}
        <button
          onClick={handleDownloadQR}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <Download className="w-5 h-5" />
          QRコードを保存
        </button>
      </div>
      
      {/* QR Code Scanner */}
      {showScanner && (
        <QRCodeScanner
          onClose={() => setShowScanner(false)}
          onScan={handleScanResult}
        />
      )}
    </div>
  );
};

export default QRCodeModal; 