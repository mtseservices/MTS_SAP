import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { QrCode, Camera, Upload, X, Flashlight, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Box } from 'lucide-react';
import { INITIAL_INVENTORY } from '../../services/mockData';
import { InventoryItem } from '../../types/erp';

export interface ScannedItemPayload {
  code: string;
  name: string;
  unitPrice: number;
  qty: number;
  category?: string;
  uom?: string;
  barcode?: string;
  rawPayload: string;
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemScanned: (item: ScannedItemPayload) => void;
  title?: string;
  moduleContext?: 'PROCUREMENT' | 'SALES' | 'INVENTORY';
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onItemScanned,
  title = 'Scan Inventory QR / Barcode',
  moduleContext = 'INVENTORY'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'quick'>('camera');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<ScannedItemPayload | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = 'qr-reader-viewport';

  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  const startCameraScanner = async () => {
    setErrorMessage(null);
    try {
      if (html5QrcodeRef.current) {
        await stopCameraScanner();
      }

      const html5Qrcode = new Html5Qrcode(qrRegionId);
      html5QrcodeRef.current = html5Qrcode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      setIsScanning(true);
      await html5Qrcode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScannedText(decodedText);
        },
        (error) => {
          // Ignore frequent frame scan failures
        }
      );
    } catch (err: any) {
      console.warn('Camera scan initialization failed:', err);
      setIsScanning(false);
      setErrorMessage(
        err?.message || 'Camera permission denied or camera unavailable. Try uploading an image or using Quick Select.'
      );
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        html5QrcodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader-file-temp');
      const decodedText = await html5Qrcode.scanFile(file, true);
      html5Qrcode.clear();
      handleScannedText(decodedText);
    } catch (err: any) {
      setErrorMessage('Could not detect a clear QR Code or Barcode in the uploaded image. Please try another image.');
    }
  };

  const handleScannedText = (decodedText: string) => {
    let code = decodedText.trim();
    let name = '';
    let unitPrice = 0;
    let qty = 1;
    let category = 'Scanned Item';
    let uom = 'Pcs';

    // Check if JSON payload
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed && typeof parsed === 'object') {
        code = parsed.code || parsed.itemCode || parsed.id || code;
        name = parsed.name || parsed.itemName || name;
        unitPrice = parsed.price || parsed.unitPrice || unitPrice;
        qty = parsed.qty || parsed.quantity || 1;
        category = parsed.category || category;
        uom = parsed.uom || uom;
      }
    } catch (e) {
      // Plain string payload: Match with existing inventory catalog
    }

    const matchedInventory = INITIAL_INVENTORY.find(
      (inv) =>
        inv.code.toLowerCase() === code.toLowerCase() ||
        inv.barcode?.toLowerCase() === code.toLowerCase() ||
        inv.id.toLowerCase() === code.toLowerCase() ||
        inv.name.toLowerCase().includes(code.toLowerCase())
    );

    if (matchedInventory) {
      code = matchedInventory.code;
      name = matchedInventory.name;
      unitPrice = moduleContext === 'PROCUREMENT' ? matchedInventory.purchasePrice : matchedInventory.unitPrice;
      category = matchedInventory.category;
      uom = matchedInventory.uom;
    } else if (!name) {
      name = `Scanned Item (${code})`;
      unitPrice = moduleContext === 'PROCUREMENT' ? 1500 : 2200;
    }

    const scannedPayload: ScannedItemPayload = {
      code,
      name,
      unitPrice,
      qty,
      category,
      uom,
      barcode: code,
      rawPayload: decodedText
    };

    setLastScannedResult(scannedPayload);

    // Stop camera and pass result
    stopCameraScanner();
    onItemScanned(scannedPayload);
  };

  const toggleFlashlight = async () => {
    if (html5QrcodeRef.current && isScanning) {
      try {
        // @ts-ignore
        const capabilities = html5QrcodeRef.current.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          // @ts-ignore
          await html5QrcodeRef.current.applyVideoConstraints({
            advanced: [{ torch: !torchOn }]
          });
          setTorchOn(!torchOn);
        } else {
          alert('Flashlight control is not supported on this device/browser.');
        }
      } catch (err) {
        console.warn('Torch failed:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              moduleContext === 'PROCUREMENT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              moduleContext === 'SALES' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">{title}</h3>
              <p className="text-[11px] text-slate-400">
                Point device camera at QR code, upload image, or select test item.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera'
                ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Upload Image
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'quick'
                ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Test
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[260px] flex items-center justify-center">
                <div id={qrRegionId} className="w-full h-full overflow-hidden" />
                
                {!isScanning && !errorMessage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 space-y-2 bg-slate-950/90">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="text-xs font-medium">Initializing Device Camera...</span>
                  </div>
                )}

                {/* Torch & Restart overlay buttons */}
                {isScanning && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={toggleFlashlight}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                        torchOn
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                      title="Toggle Flashlight"
                    >
                      <Flashlight className="w-4 h-4" />
                      {torchOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Camera Connection Issue</div>
                    <div className="text-[11px] opacity-90 mt-0.5">{errorMessage}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD FILE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div id="qr-reader-file-temp" className="hidden" />
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 text-center bg-slate-950/50 transition-all flex flex-col items-center justify-center space-y-3">
                <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Upload QR / Barcode Image</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WEBP formats</p>
                </div>

                <label className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Browse Image File
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* QUICK TEST TAB */}
          {activeTab === 'quick' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-semibold">
                Select a catalog item to test scanning instantly:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {INITIAL_INVENTORY.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleScannedText(item.code)}
                    className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 group-hover:text-amber-400 transition-colors">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          {item.name}
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                            {item.code}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Category: {item.category} • Price:{' '}
                          <span className="font-mono text-emerald-400">
                            Rs.{' '}
                            {(moduleContext === 'PROCUREMENT' ? item.purchasePrice : item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      Scan →
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or input custom barcode / SKU text:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. BARCODE-9901 or ITEM-SKU"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                  />
                  <button
                    onClick={() => {
                      if (customInput.trim()) {
                        handleScannedText(customInput.trim());
                      }
                    }}
                    disabled={!customInput.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs"
                  >
                    Simulate Scan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Last Scanned Result Confirmation Badge */}
          {lastScannedResult && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-100">{lastScannedResult.name}</div>
                  <div className="text-[11px] font-mono opacity-90">
                    Code: {lastScannedResult.code} | Price: Rs. {lastScannedResult.unitPrice.toLocaleString()}
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                SCANNED
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              stopCameraScanner();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
