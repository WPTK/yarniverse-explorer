
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useYarn } from "@/contexts/yarn-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function RefreshDataButton() {
  const { csvService, data } = useYarn();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Force a check for updates from the CSV service
      await csvService.checkForUpdates();
      
      toast({
        title: "Data Refreshed",
        description: `${data.length} items loaded from CSV file.`,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data from CSV file.",
        variant: "destructive",
      });
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-1"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="sr-only md:not-sr-only md:inline-block">Refresh</span>
    </Button>
  );
}
