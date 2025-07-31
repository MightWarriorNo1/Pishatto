import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Camera, RotateCcw } from 'lucide-react';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onClose, onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScannedData = useRef<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start QR code detection
      startQRDetection();
    } catch (err) {
      console.error('Camera error:', err);
      setError('カメラへのアクセスが許可されていません。カメラの権限を確認してください。');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsScanning(false);
  };

  const startQRDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scanFrame = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // Prevent duplicate scans of the same QR code
        if (code.data !== lastScannedData.current) {
          lastScannedData.current = code.data;
          console.log('QR Code detected:', code.data);
          
          // Call the onScan callback with the detected data
          onScan(code.data);
          onClose();
          return;
        }
      }

      // Continue scanning
      if (isScanning) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    scanFrame();
  }, [isScanning, onScan, onClose]);

  const handleSwitchCamera = () => {
    stopCamera();
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  const handleManualInput = () => {
    const input = prompt('QRコードの内容を手動で入力してください:');
    if (input) {
      onScan(input);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">QRコードスキャン</h2>
        <button
          onClick={handleSwitchCamera}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Hidden canvas for QR detection */}
            <canvas
              ref={canvasRef}
              className="hidden"
              style={{ display: 'none' }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>カメラを起動中...</p>
            </div>
          </div>
        )}

        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scanning Frame */}
              <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white"></div>
                
                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white animate-pulse"></div>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 text-center text-white">
                <p className="text-sm">QRコードを枠内に配置してください</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 mx-4 max-w-sm">
              <h3 className="text-lg font-bold mb-2">エラー</h3>
              <p className="text-gray-700 mb-4">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={startCamera}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded font-bold"
                >
                  再試行
                </button>
                <button
                  onClick={handleManualInput}
                  className="flex-1 bg-secondary text-white py-2 px-4 rounded font-bold"
                >
                  手動入力
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-black">
        <button
          onClick={handleManualInput}
          className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-bold"
        >
          QRコードを手動で入力
        </button>
      </div>
    </div>
  );
};

export default QRCodeScanner; 