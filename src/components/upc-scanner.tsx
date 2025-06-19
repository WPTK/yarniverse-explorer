
import React, { useState } from 'react';
import { BarcodeScanner } from './barcode-scanner';
import { ScannedYarnForm } from './scanned-yarn-form';
import { upcLookupService, UPCLookupResult } from '@/services/upc-lookup';
import { YarnItem } from '@/types/yarn';
import { useYarn } from '@/contexts/yarn-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Scan, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UPCScannerProps {
  onClose: () => void;
}

type ScannerState = 'scanning' | 'looking-up' | 'reviewing' | 'complete' | 'error';

export function UPCScanner({ onClose }: UPCScannerProps) {
  const [state, setState] = useState<ScannerState>('scanning');
  const [currentUPC, setCurrentUPC] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<UPCLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateYarnItem } = useYarn();
  const { toast } = useToast();

  const handleBarcodeScan = async (upc: string) => {
    console.log('Barcode scanned:', upc);
    setCurrentUPC(upc);
    setState('looking-up');
    setError(null);

    try {
      const result = await upcLookupService.lookupUPC(upc);
      
      if (result) {
        setLookupResult(result);
        setState('reviewing');
        toast({
          title: "Product Found",
          description: `Found product data with ${Math.round(result.confidence * 100)}% confidence`,
        });
      } else {
        setError('No product data found for this UPC. You can still add the yarn manually.');
        setState('error');
      }
    } catch (err) {
      console.error('UPC lookup error:', err);
      setError('Failed to lookup product data. Please try again.');
      setState('error');
    }
  };

  const handleYarnSave = (yarnItem: YarnItem) => {
    // Add the yarn to the collection
    updateYarnItem(yarnItem.id, yarnItem);
    setState('complete');
  };

  const handleTryAgain = () => {
    setState('scanning');
    setCurrentUPC('');
    setLookupResult(null);
    setError(null);
  };

  const renderContent = () => {
    switch (state) {
      case 'scanning':
        return (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={onClose}
            isScanning={true}
          />
        );

      case 'looking-up':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <h3 className="text-lg font-semibold mb-2">Looking up product...</h3>
              <p className="text-sm text-gray-500 text-center">
                Searching multiple databases for UPC: {currentUPC}
              </p>
            </CardContent>
          </Card>
        );

      case 'reviewing':
        return lookupResult ? (
          <ScannedYarnForm
            lookupResult={lookupResult}
            onSave={handleYarnSave}
            onCancel={onClose}
          />
        ) : null;

      case 'complete':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Yarn Added Successfully!</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                The scanned yarn has been added to your collection.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleTryAgain}>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan Another
                </Button>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'error':
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lookup Failed</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                {error}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleTryAgain}>
                  Try Again
                </Button>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  );
}
