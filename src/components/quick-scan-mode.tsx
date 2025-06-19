import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, CheckCircle, Plus, X, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useYarn } from '@/contexts/yarn-context';
import { YarnItem } from '@/types/yarn';
import { upcLookupService } from '@/services/upc-lookup';

interface QuickScanModeProps {
  onComplete: (sessionData: QuickScanSessionData) => void;
  onClose: () => void;
}

interface ScannedItem {
  upc: string;
  timestamp: Date;
  isNew: boolean;
  existingItem?: YarnItem;
  lookupData?: any;
}

interface QuickScanSessionData {
  items: ScannedItem[];
  newItemsCount: number;
  updatedItemsCount: number;
  totalScans: number;
}

export function QuickScanMode({ onComplete, onClose }: QuickScanModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<QuickScanSessionData>({
    items: [],
    newItemsCount: 0,
    updatedItemsCount: 0,
    totalScans: 0,
  });
  const [recentScans, setRecentScans] = useState<Set<string>>(new Set());
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  
  const { data: yarnData, updateYarnItem } = useYarn();
  const { toast } = useToast();

  const DEBOUNCE_TIME = 2000; // 2 seconds between identical scans

  useEffect(() => {
    if (isActive) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isActive]);

  // Clear recent scans debounce
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRecentScans(prev => {
        const filtered = new Set<string>();
        prev.forEach(upc => {
          // Keep UPCs that were scanned within debounce time
          if (now - lastScanTime < DEBOUNCE_TIME) {
            filtered.add(upc);
          }
        });
        return filtered;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastScanTime]);

  const startScanning = async () => {
    try {
      setError(null);
      if (videoRef.current) {
        await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, error) => {
            if (result) {
              const upc = result.getText();
              handleBarcodeScan(upc);
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error('Scanning error:', error);
            }
          }
        );
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    codeReader.reset();
  };

  const handleBarcodeScan = async (upc: string) => {
    const now = Date.now();
    
    // Debounce identical scans
    if (recentScans.has(upc) && now - lastScanTime < DEBOUNCE_TIME) {
      return;
    }

    setLastScanTime(now);
    setRecentScans(prev => new Set([...prev, upc]));

    console.log('Quick scan detected:', upc);

    // Check if item already exists in database
    const existingItem = yarnData.find(item => item.id === upc || item.brandColor === upc);
    
    if (existingItem) {
      // Update existing item quantity
      const updatedItem = { ...existingItem, qty: existingItem.qty + 1 };
      updateYarnItem(existingItem.id, updatedItem);
      
      setFeedback('✔ Quantity updated');
      setSessionData(prev => ({
        ...prev,
        items: [...prev.items, {
          upc,
          timestamp: new Date(),
          isNew: false,
          existingItem: updatedItem,
        }],
        updatedItemsCount: prev.updatedItemsCount + 1,
        totalScans: prev.totalScans + 1,
      }));
    } else {
      // New item - add to session for later review
      try {
        const lookupData = await upcLookupService.lookupUPC(upc);
        
        setFeedback('➕ New item added');
        setSessionData(prev => ({
          ...prev,
          items: [...prev.items, {
            upc,
            timestamp: new Date(),
            isNew: true,
            lookupData,
          }],
          newItemsCount: prev.newItemsCount + 1,
          totalScans: prev.totalScans + 1,
        }));
      } catch (err) {
        console.error('Lookup failed:', err);
        setFeedback('➕ New item added (no data found)');
        setSessionData(prev => ({
          ...prev,
          items: [...prev.items, {
            upc,
            timestamp: new Date(),
            isNew: true,
          }],
          newItemsCount: prev.newItemsCount + 1,
          totalScans: prev.totalScans + 1,
        }));
      }
    }

    // Clear feedback after 2 seconds
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleComplete = () => {
    stopScanning();
    onComplete(sessionData);
  };

  const handleReset = () => {
    setSessionData({
      items: [],
      newItemsCount: 0,
      updatedItemsCount: 0,
      totalScans: 0,
    });
    setRecentScans(new Set());
    setFeedback('Session reset');
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quick Scan Mode</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
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
            
            {/* Feedback Overlay */}
            {feedback && (
              <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-2 rounded text-center">
                {feedback}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-2xl font-bold text-blue-600">{sessionData.totalScans}</div>
              <div className="text-xs text-blue-600">Total Scans</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-2xl font-bold text-green-600">{sessionData.updatedItemsCount}</div>
              <div className="text-xs text-green-600">Updated</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="text-2xl font-bold text-orange-600">{sessionData.newItemsCount}</div>
              <div className="text-xs text-orange-600">New Items</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsActive(!isActive)}
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
            <Button onClick={handleReset} variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleComplete} className="flex-1" disabled={sessionData.totalScans === 0}>
              Complete Session
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Scan continuously. Identical barcodes are debounced for 2 seconds.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
