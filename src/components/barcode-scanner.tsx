
import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Type } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isScanning: boolean;
}

export function BarcodeScanner({ onScan, onClose, isScanning }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  useEffect(() => {
    if (isScanning && !manualEntry) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isScanning, manualEntry]);

  const startScanning = async () => {
    try {
      setError(null);
      if (videoRef.current) {
        await codeReader.decodeFromVideoDevice(
          undefined, // Use default camera
          videoRef.current,
          (result, error) => {
            if (result) {
              const barcode = result.getText();
              console.log('Barcode scanned:', barcode);
              onScan(barcode);
              setIsActive(false);
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error('Scanning error:', error);
            }
          }
        );
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    codeReader.reset();
    setIsActive(false);
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
    }
  };

  const toggleManualEntry = () => {
    setManualEntry(!manualEntry);
    setManualBarcode('');
    if (!manualEntry) {
      stopScanning();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scan Yarn Barcode</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!manualEntry ? (
          <>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {isActive && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-white rounded-lg"></div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={isActive ? stopScanning : startScanning}
                variant={isActive ? "destructive" : "default"}
                className="flex-1"
              >
                {isActive ? (
                  <>
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanning
                  </>
                )}
              </Button>
              <Button onClick={toggleManualEntry} variant="outline">
                <Type className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Barcode Manually</label>
              <Input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter UPC/EAN barcode"
                onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleManualSubmit} className="flex-1">
                Submit
              </Button>
              <Button onClick={toggleManualEntry} variant="outline">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        
        <div className="text-xs text-gray-500 text-center">
          Position the barcode within the frame for automatic scanning
        </div>
      </CardContent>
    </Card>
  );
}
