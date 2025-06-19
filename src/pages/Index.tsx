
/**
 * Main Index Page
 * 
 * The primary landing page of the application that displays the yarn collection
 * dashboard, filters, and data visualization components.
 */

import { useState, useEffect } from "react";
import { YarnProvider } from "@/contexts/yarn-context";
import { SummaryCards } from "@/components/summary-cards";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { DataView } from "@/components/data-view";
import { SavedViews } from "@/components/saved-views";
import { ThemeToggle } from "@/components/theme-toggle";
import { RefreshDataButton } from "@/components/refresh-data-button";
import { UPCScanner } from "@/components/upc-scanner";
import { QuickScanMode } from "@/components/quick-scan-mode";
import { QuickScanReview } from "@/components/quick-scan-review";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Scan, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScanMode = 'none' | 'single' | 'quick' | 'review';

interface QuickScanSessionData {
  items: Array<{
    upc: string;
    timestamp: Date;
    isNew: boolean;
    existingItem?: any;
    lookupData?: any;
  }>;
  newItemsCount: number;
  updatedItemsCount: number;
  totalScans: number;
}

/**
 * Main Index component that serves as the application entry point.
 */
const Index = () => {
  const { toast } = useToast();
  const [csvConfigured, setCsvConfigured] = useState<boolean | null>(null);
  const [isCheckingCsv, setIsCheckingCsv] = useState(true);
  const [scanMode, setScanMode] = useState<ScanMode>('none');
  const [quickScanSession, setQuickScanSession] = useState<QuickScanSessionData | null>(null);
  
  /**
   * Check if CSV file exists on mount and configure the application state accordingly.
   */
  useEffect(() => {
    const checkCsvFile = async () => {
      try {
        setIsCheckingCsv(true);
        // Use a relative path to ensure it works with the basename
        const response = await fetch('./data/yarn-collection.csv');
        if (response.ok) {
          setCsvConfigured(true);
        } else {
          throw new Error(`CSV file not found: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("CSV file error:", error);
        setCsvConfigured(false);
        toast({
          title: "CSV File Not Found",
          description: "Please create a CSV file at '/data/yarn-collection.csv' with your yarn collection data.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingCsv(false);
      }
    };
    
    checkCsvFile();
  }, [toast]);

  const handleQuickScanComplete = (sessionData: QuickScanSessionData) => {
    setQuickScanSession(sessionData);
    setScanMode('review');
  };

  const handleQuickScanReviewComplete = () => {
    setQuickScanSession(null);
    setScanMode('none');
  };
  
  /**
   * Renders the application content when CSV is properly configured.
   */
  const renderMainContent = () => (
    <>
      <section className="mb-4">
        <SummaryCards />
      </section>
      
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <div className="md:col-span-2">
          <div className="space-y-4 sticky top-[4.5rem]">
            <FiltersSidebar />
            
            <div className="hidden md:block">
              <SavedViews />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-6">
          <DataView />
        </div>
      </div>
      
      <div className="md:hidden mt-4">
        <SavedViews />
      </div>

      {/* Scanning Modals */}
      {scanMode === 'single' && (
        <UPCScanner onClose={() => setScanMode('none')} />
      )}

      {scanMode === 'quick' && (
        <QuickScanMode 
          onComplete={handleQuickScanComplete}
          onClose={() => setScanMode('none')} 
        />
      )}

      {scanMode === 'review' && quickScanSession && (
        <QuickScanReview
          sessionData={quickScanSession}
          onComplete={handleQuickScanReviewComplete}
          onClose={handleQuickScanReviewComplete}
        />
      )}
    </>
  );
  
  /**
   * Renders a loading state while checking for CSV.
   */
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Checking for CSV data...</p>
    </div>
  );
  
  /**
   * Renders the setup instructions when CSV is not configured.
   */
  const renderSetupInstructions = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="glass-card p-6 max-w-md text-center border border-border rounded-lg shadow-sm bg-card/50 backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-3">CSV File Setup Required</h2>
        <p className="mb-4">
          To use this application, you need to create a CSV file with your yarn collection data.
        </p>
        <div className="text-left space-y-3">
          <div>
            <h3 className="font-medium mb-1">1. Create a CSV file with these columns:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Brand</li>
              <li>Sub-brand</li>
              <li>Length (yards)</li>
              <li>Multicolor (Yes/No)</li>
              <li>Weight</li>
              <li>Rows</li>
              <li>Color 1</li>
              <li>Color 2</li>
              <li>Color 3</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">2. Save the file at:</h3>
            <p className="text-sm font-mono bg-muted p-2 rounded">/data/yarn-collection.csv</p>
          </div>
          <div>
            <h3 className="font-medium mb-1">3. Refresh this page</h3>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <YarnProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="container flex h-14 items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Yarniverse Explorer</h1>
            </div>
            <div className="flex items-center gap-2">
              {csvConfigured && !isCheckingCsv && (
                <>
                  <Button
                    onClick={() => setScanMode('quick')}
                    variant="default"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Scan
                  </Button>
                  <Button
                    onClick={() => setScanMode('single')}
                    variant="outline"
                    size="sm"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Single Scan
                  </Button>
                  <RefreshDataButton />
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="container py-4">
          {isCheckingCsv 
            ? renderLoadingState()
            : csvConfigured 
              ? renderMainContent() 
              : renderSetupInstructions()
          }
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border mt-4">
          <div className="container py-4 text-center text-xs text-muted-foreground">
            <p>Yarn Collection Visualization • View and analyze your yarn collection</p>
          </div>
        </footer>
      </div>
    </YarnProvider>
  );

  /**
   * Renders a loading state while checking for CSV.
   */
  function renderLoadingState() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Checking for CSV data...</p>
      </div>
    );
  }
  
  /**
   * Renders the setup instructions when CSV is not configured.
   */
  function renderSetupInstructions() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="glass-card p-6 max-w-md text-center border border-border rounded-lg shadow-sm bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-3">CSV File Setup Required</h2>
          <p className="mb-4">
            To use this application, you need to create a CSV file with your yarn collection data.
          </p>
          <div className="text-left space-y-3">
            <div>
              <h3 className="font-medium mb-1">1. Create a CSV file with these columns:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Brand</li>
                <li>Sub-brand</li>
                <li>Length (yards)</li>
                <li>Multicolor (Yes/No)</li>
                <li>Weight</li>
                <li>Rows</li>
                <li>Color 1</li>
                <li>Color 2</li>
                <li>Color 3</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-1">2. Save the file at:</h3>
              <p className="text-sm font-mono bg-muted p-2 rounded">/data/yarn-collection.csv</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">3. Refresh this page</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Index;
