
/**
 * CSV Service
 * 
 * Handles loading, monitoring, and updating CSV data.
 * Provides interfaces for interacting with CSV files and managing data updates.
 */

import { YarnItem } from "@/types/yarn";
import { parseCSVToYarnItems, convertYarnItemsToCSV } from "./csv-parser";
import { CSVServiceOptions, CSVDataUpdateCallback, CSVUpdateResult } from "./csv-types";

/**
 * Service for handling CSV data operations including loading, polling for updates,
 * and providing mechanisms to update CSV data.
 */
class CSVService {
  private filePath: string;
  private lastModified: number = 0;
  private pollingInterval: number;
  private intervalId: number | null = null;
  private onDataUpdate: CSVDataUpdateCallback | null = null;
  private loadAttempts: number = 0;
  private maxLoadAttempts: number;
  private dataCache: YarnItem[] = [];

  /**
   * Creates a new instance of CSVService.
   * 
   * @param filePath - Path to the CSV file (defaults to "./data/yarn-collection.csv")
   * @param options - Configuration options for the service
   */
  constructor(
    filePath: string = "./data/yarn-collection.csv", 
    options: CSVServiceOptions = {}
  ) {
    // Set default options
    this.pollingInterval = options.pollingInterval || 5000; // Default: check every 5 seconds
    this.maxLoadAttempts = options.maxLoadAttempts || 3; // Default: 3 attempts
    
    // Ensure the file path is correctly prefixed if we're using the base path
    const basePath = import.meta.env.BASE_URL || '/';
    this.filePath = this.normalizeFilePath(basePath, filePath);
    
    console.log("CSV file path:", this.filePath);
  }

  /**
   * Starts polling for CSV file updates.
   * 
   * @param callback - Function to call when data is updated
   */
  public startPolling(callback: CSVDataUpdateCallback): void {
    this.onDataUpdate = callback;
    this.loadAttempts = 0;
    
    // Initial load
    this.loadData();
    
    // Start polling for updates
    this.intervalId = window.setInterval(() => {
      this.checkForCSVUpdates();
    }, this.pollingInterval);
  }

  /**
   * Stops polling for CSV file updates.
   */
  public stopPolling(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Updates the data in the CSV service.
   * In a real-world application, this would update the actual CSV file.
   * 
   * @param updatedData - The new data to replace the existing data
   * @returns Promise that resolves to a result object
   */
  public async updateData(updatedData: YarnItem[]): Promise<CSVUpdateResult> {
    try {
      // Cache the updated data
      this.dataCache = [...updatedData];
      
      // Convert YarnItem array back to CSV format
      const csvData = convertYarnItemsToCSV(updatedData);
      
      // In a real application, we would send this data to a server endpoint.
      // Since we're working with a local CSV file, we just log and update the cache.
      console.log('Data update requested:', { items: updatedData.length });
      
      // In a real implementation, you might do something like:
      // const response = await fetch('/api/update-csv', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ data: csvData }),
      // });
      // return { success: response.ok, error: response.ok ? undefined : await response.text() };
      
      // For now, let's just trigger an update to our data callback
      if (this.onDataUpdate) {
        this.onDataUpdate(updatedData);
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error updating CSV data:', error);
      return { 
        success: false, 
        error: `Failed to update data: ${errorMessage}`
      };
    }
  }

  /**
   * Manually checks for updates to the CSV file.
   * Can be called to force an immediate check outside of the polling interval.
   * 
   * @returns Promise that resolves when the check is complete
   */
  public async checkForUpdates(): Promise<void> {
    try {
      // Use the private method to check for updates
      await this.checkForCSVUpdates();
      
      // Force a reload of the data regardless of whether an update was detected
      await this.loadData();
    } catch (error) {
      console.error('Error during manual update check:', error);
      throw error;
    }
  }

  /**
   * Normalizes the file path by handling relative paths and base URLs properly.
   * 
   * @param basePath - The base path of the application
   * @param filePath - The file path to normalize
   * @returns Normalized file path
   */
  private normalizeFilePath(basePath: string, filePath: string): string {
    // If filePath is already absolute, return it as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // Remove leading ./ from file path if present
    const cleanFilePath = filePath.replace(/^\.\//, '');
    
    // Ensure basePath ends with / if it's not empty
    const cleanBasePath = basePath.endsWith('/') || basePath === '' 
      ? basePath 
      : `${basePath}/`;
    
    return `${cleanBasePath}${cleanFilePath}`;
  }

  /**
   * Checks if the CSV file has been updated.
   * Private method used for both automatic and manual checks.
   */
  private async checkForCSVUpdates(): Promise<void> {
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

  /**
   * Loads data from the CSV file.
   */
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
      this.dataCache = parsedData;
      
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

  /**
   * Handles errors that occur when loading the CSV file.
   * Implements retry logic with exponential backoff.
   * 
   * @param error - The error that occurred
   */
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
