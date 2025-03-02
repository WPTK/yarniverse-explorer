
import { YarnItem, YarnWeight } from "@/types/yarn";
import Papa from "papaparse";

// Updated column mapping to match new CSV structure
const CSV_COLUMN_MAPPING = {
  brand: "Brand",
  subBrand: "Sub-brand",
  vintage: "Vintage",
  qty: "Qty",
  length: "Length (yards)",
  multicolor: "Multicolor",
  softnessRanking: "Softness Ranking",
  weight: "Weight",
  hookSize: "Hook Size",
  rows: "Rows",
  machineWash: "Machine Wash",
  machineDry: "Machine Dry",
  material: "Material",
  brandColor: "Brand Color",
  color1: "Color 1",
  color2: "Color 2",
  color3: "Color 3",
  color4: "Color 4",
};

class CSVService {
  private filePath: string;
  private lastModified: number = 0;
  private pollingInterval: number = 5000; // Check for updates every 5 seconds
  private intervalId: number | null = null;
  private onDataUpdate: ((data: YarnItem[]) => void) | null = null;
  private loadAttempts: number = 0;
  private maxLoadAttempts: number = 3;

  constructor(filePath: string = "./data/yarn-collection.csv") {
    // Ensure the file path is correctly prefixed if we're using the base path
    const basePath = import.meta.env.BASE_URL || '/';
    this.filePath = basePath.endsWith('/') && !filePath.startsWith('./') 
      ? `${basePath}${filePath.replace(/^\.\//, '')}`
      : filePath;
    
    console.log("CSV file path:", this.filePath);
  }

  public startPolling(callback: (data: YarnItem[]) => void): void {
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
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          
          const parsedData = this.processResults(results.data);
          if (this.onDataUpdate) {
            this.onDataUpdate(parsedData);
          }
          
          // Reset attempt counter on success
          this.loadAttempts = 0;
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          this.handleLoadError(error);
        }
      });
      
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

  private processResults(data: any[]): YarnItem[] {
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('CSV data is empty or invalid');
      return [];
    }
    
    return data.map((row, index) => {
      // Extract colors into an array, filtering out empty values
      const colors = [
        row[CSV_COLUMN_MAPPING.color1],
        row[CSV_COLUMN_MAPPING.color2],
        row[CSV_COLUMN_MAPPING.color3],
        row[CSV_COLUMN_MAPPING.color4] // Added Color 4
      ].filter(color => color && color.trim() !== '');

      // Convert boolean values
      const multicolorValue = row[CSV_COLUMN_MAPPING.multicolor]?.toLowerCase();
      const isMulticolor = multicolorValue === 'yes' || multicolorValue === 'true' || multicolorValue === '1';
      
      const vintageValue = row[CSV_COLUMN_MAPPING.vintage]?.toLowerCase();
      const isVintage = vintageValue === 'yes' || vintageValue === 'true' || vintageValue === '1';
      
      const machineWashValue = row[CSV_COLUMN_MAPPING.machineWash]?.toLowerCase();
      const isMachineWash = machineWashValue === 'yes' || machineWashValue === 'true' || machineWashValue === '1';
      
      const machineDryValue = row[CSV_COLUMN_MAPPING.machineDry]?.toLowerCase();
      const isMachineDry = machineDryValue === 'yes' || machineDryValue === 'true' || machineDryValue === '1';
      
      // Ensure weight is converted to valid YarnWeight type
      let weightValue = (row[CSV_COLUMN_MAPPING.weight]?.toLowerCase() || 'other') as string;
      
      // Convert to a valid YarnWeight value
      const validWeights: YarnWeight[] = [
        "lace", "super fine", "fine", "light", "medium", 
        "bulky", "super bulky", "jumbo", "other"
      ];
      
      if (!validWeights.includes(weightValue as YarnWeight)) {
        weightValue = "other";
      }
      
      return {
        id: `yarn-${index}`,
        brand: row[CSV_COLUMN_MAPPING.brand] || '',
        subBrand: row[CSV_COLUMN_MAPPING.subBrand] || '',
        vintage: isVintage,
        qty: parseInt(row[CSV_COLUMN_MAPPING.qty], 10) || 0,
        length: parseInt(row[CSV_COLUMN_MAPPING.length], 10) || 0,
        multicolor: isMulticolor,
        softnessRanking: parseInt(row[CSV_COLUMN_MAPPING.softnessRanking], 10) || 0,
        weight: weightValue as YarnWeight,
        hookSize: row[CSV_COLUMN_MAPPING.hookSize] || '',
        rows: parseInt(row[CSV_COLUMN_MAPPING.rows], 10) || 0,
        machineWash: isMachineWash,
        machineDry: isMachineDry,
        material: row[CSV_COLUMN_MAPPING.material] || '',
        brandColor: row[CSV_COLUMN_MAPPING.brandColor] || '',
        colors: colors
      };
    });
  }

  public static getColumnMapping(): typeof CSV_COLUMN_MAPPING {
    return CSV_COLUMN_MAPPING;
  }
}

export default CSVService;
