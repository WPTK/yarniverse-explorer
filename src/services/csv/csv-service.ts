
import { YarnItem } from "@/types/yarn";
import { parseCSVToYarnItems, convertYarnItemsToCSV } from "./csv-parser";
import { CSVServiceOptions, CSVDataUpdateCallback } from "./csv-types";

class CSVService {
  private filePath: string;
  private lastModified: number = 0;
  private pollingInterval: number;
  private intervalId: number | null = null;
  private onDataUpdate: CSVDataUpdateCallback | null = null;
  private loadAttempts: number = 0;
  private maxLoadAttempts: number;

  constructor(
    filePath: string = "./data/yarn-collection.csv", 
    options: CSVServiceOptions = {}
  ) {
    // Set default options
    this.pollingInterval = options.pollingInterval || 5000; // Default: check every 5 seconds
    this.maxLoadAttempts = options.maxLoadAttempts || 3; // Default: 3 attempts
    
    // Ensure the file path is correctly prefixed if we're using the base path
    const basePath = import.meta.env.BASE_URL || '/';
    this.filePath = basePath.endsWith('/') && !filePath.startsWith('./') 
      ? `${basePath}${filePath.replace(/^\.\//, '')}`
      : filePath;
    
    console.log("CSV file path:", this.filePath);
  }

  public startPolling(callback: CSVDataUpdateCallback): void {
    this.onDataUpdate = callback;
    this.loadAttempts = 0;
    
    // Initial load
    this.loadData();
    
    // Start polling for updates
    this.intervalId = window.setInterval(() => {
      this.checkForUpdates();
    }, this.pollingInterval);
  }

  public stopPolling(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async updateData(updatedData: YarnItem[]): Promise<boolean> {
    try {
      // Convert YarnItem array back to CSV format
      const csvData = convertYarnItemsToCSV(updatedData);
      
      // In a real application, you would send this data to a server endpoint
      // that would update the CSV file on the server. Since we're working with
      // a local CSV file that can't be directly modified by the client,
      // we'll log the data and return success for now.
      console.log('Data update requested with:', csvData);
      
      // In a real implementation, you might do something like:
      // const response = await fetch('/api/update-csv', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ data: csvData }),
      // });
      // return response.ok;
      
      // For now, let's just trigger a reload of the data after "updating"
      if (this.onDataUpdate) {
        this.onDataUpdate(updatedData);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating CSV data:', error);
      return false;
    }
  }

  private async checkForUpdates(): Promise<void> {
    try {
      const response = await fetch(this.filePath, { 
        method: 'HEAD',
        cache: 'no-store' // Ensure we don't get a cached response
      });
      
      if (!response.ok) {
        console.warn(`Failed to check for CSV updates: ${response.status} ${response.statusText}`);
        return;
      }
      
      const lastModified = new Date(response.headers.get('last-modified') || '').getTime();
      
      if (lastModified > this.lastModified) {
        this.lastModified = lastModified;
        this.loadData();
      }
    } catch (error) {
      console.error('Error checking for CSV updates:', error);
    }
  }

  private async loadData(): Promise<void> {
    try {
      const response = await fetch(this.filePath, { 
        cache: 'no-store' // Ensure we don't get a cached response
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      if (!csvText || csvText.trim() === '') {
        throw new Error('CSV file is empty');
      }
      
      const parsedData = parseCSVToYarnItems(csvText);
      if (this.onDataUpdate) {
        this.onDataUpdate(parsedData);
      }
      
      // Reset attempt counter on success
      this.loadAttempts = 0;
      
    } catch (error) {
      console.error('Error loading CSV data:', error);
      this.handleLoadError(error);
    }
  }

  private handleLoadError(error: any): void {
    this.loadAttempts++;
    
    if (this.loadAttempts < this.maxLoadAttempts) {
      // Retry with exponential backoff
      const retryDelay = Math.pow(2, this.loadAttempts) * 1000;
      console.log(`Retrying CSV load in ${retryDelay}ms (attempt ${this.loadAttempts}/${this.maxLoadAttempts})`);
      
      setTimeout(() => this.loadData(), retryDelay);
    } else if (this.onDataUpdate) {
      // Provide empty data after max attempts
      console.error(`Failed to load CSV after ${this.maxLoadAttempts} attempts`);
      this.onDataUpdate([]);
    }
  }
}

export default CSVService;
