import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Tesseract from 'tesseract.js';

interface DocumentScannerProps {
  onScanComplete: (data: string) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanComplete }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMethod, setScanMethod] = useState<'client' | 'server'>('client');

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setIsScanning(true);
    try {
      if (scanMethod === 'client') {
        // Client-side OCR using Tesseract
        const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');
        onScanComplete(text);
      } else {
        // Server-side OCR using Gemini
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageSrc }),
        });
        const data = await response.json();
        onScanComplete(data.text);
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('Scanning failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-900 text-white">
      <h3 className="text-lg font-bold mb-2">Document Scanner</h3>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full rounded mb-2" />
      <div className="flex gap-2 mb-2">
        <select value={scanMethod} onChange={(e) => setScanMethod(e.target.value as 'client' | 'server')} className="bg-gray-800 p-2 rounded">
          <option value="client">Client-side OCR (Tesseract)</option>
          <option value="server">Server-side OCR (Gemini)</option>
        </select>
      </div>
      <button onClick={capture} disabled={isScanning} className="w-full bg-blue-600 p-2 rounded hover:bg-blue-700 disabled:bg-gray-600">
        {isScanning ? 'Scanning...' : 'Capture & Scan'}
      </button>
    </div>
  );
};
