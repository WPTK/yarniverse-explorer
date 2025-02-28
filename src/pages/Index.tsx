
import { useState, useEffect } from "react";
import { YarnProvider } from "@/contexts/yarn-context";
import { SummaryCards } from "@/components/summary-cards";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { DataView } from "@/components/data-view";
import { SavedViews } from "@/components/saved-views";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [csvConfigured, setCsvConfigured] = useState<boolean | null>(null);
  const [isCheckingCsv, setIsCheckingCsv] = useState(true);
  
  // Check if CSV file exists on mount
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
  
  return (
    <YarnProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="container flex h-14 items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                <path d="M18.42 12.5C21.5 12.5 22 10 22 8.5C22 7.34 21.5 6.37 20.73 5.75M18.42 12.5C16.4 12.5 14.5 14.55 14.5 16.62C14.5 19.94 16.71 21.7 20.73 18.33M18.42 12.5H14.5" />
                <path d="M12 19.5C12 19.5 4 19 4 12V4" />
                <path d="M4 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                <path d="M8 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                <path d="M8 16c0-6 8-6 8-12" />
              </svg>
              <h1 className="text-lg font-semibold">Yarniverse Explorer</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="container py-4">
          {isCheckingCsv ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Checking for CSV data...</p>
            </div>
          ) : csvConfigured ? (
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="glass-card p-6 max-w-md text-center">
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
          )}
        </main>
        
        <footer className="border-t border-border mt-4">
          <div className="container py-4 text-center text-xs text-muted-foreground">
            <p>Yarn Collection Visualization • View and analyze your yarn collection</p>
          </div>
        </footer>
      </div>
    </YarnProvider>
  );
};

export default Index;
