
import { YarnItem } from "@/types/yarn";
import Papa from "papaparse";

// IMPORTANT: Update these column names to match your CSV structure
// The keys should match the YarnItem interface properties
const CSV_COLUMN_MAPPING = {
  brand: "Brand",
  subBrand: "Sub-brand",
  length: "Length (yards)",
  multicolor: "Multicolor",
  weight: "Weight",
  rows: "Rows",
  color1: "Color 1",
  color2: "Color 2",
  color3: "Color 3",
};

class CSVService {
  private filePath: string;
  private lastModified: number = 0;
  private pollingInterval: number = 5000; // Check for updates every 5 seconds
  private intervalId: number | null = null;
  private onDataUpdate: ((data: YarnItem[]) => void) | null = null;

  constructor(filePath: string = "/data/yarn-collection.csv") {
    this.filePath = filePath;
  }

  public startPolling(callback: (data: YarnItem[]) => void): void {
    this.onDataUpdate = callback;
    
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

  private async checkForUpdates(): Promise<void> {
    try {
      const response = await fetch(this.filePath, { method: 'HEAD' });
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
      const response = await fetch(this.filePath);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = this.processResults(results.data);
          if (this.onDataUpdate) {
            this.onDataUpdate(parsedData);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
      
    } catch (error) {
      console.error('Error loading CSV data:', error);
    }
  }

  private processResults(data: any[]): YarnItem[] {
    return data.map((row, index) => {
      // Extract colors into an array, filtering out empty values
      const colors = [
        row[CSV_COLUMN_MAPPING.color1],
        row[CSV_COLUMN_MAPPING.color2],
        row[CSV_COLUMN_MAPPING.color3]
      ].filter(color => color && color.trim() !== '');

      // Convert multicolor value to boolean
      const multicolorValue = row[CSV_COLUMN_MAPPING.multicolor]?.toLowerCase();
      const isMulticolor = multicolorValue === 'yes' || multicolorValue === 'true' || multicolorValue === '1';
      
      // Ensure weight is lowercase to match the YarnWeight type
      const weightValue = row[CSV_COLUMN_MAPPING.weight]?.toLowerCase() || 'other';
      
      return {
        id: `yarn-${index}`,
        brand: row[CSV_COLUMN_MAPPING.brand] || '',
        subBrand: row[CSV_COLUMN_MAPPING.subBrand] || '',
        length: parseInt(row[CSV_COLUMN_MAPPING.length], 10) || 0,
        multicolor: isMulticolor,
        weight: weightValue,
        rows: parseInt(row[CSV_COLUMN_MAPPING.rows], 10) || 0,
        colors: colors
      };
    });
  }

  public static getColumnMapping(): typeof CSV_COLUMN_MAPPING {
    return CSV_COLUMN_MAPPING;
  }
}

export default CSVService;
