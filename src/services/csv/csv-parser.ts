
/**
 * CSV Parsing module
 * 
 * Handles the conversion between CSV data and application data models.
 * Uses PapaParse for CSV parsing and formatting.
 */

import Papa from "papaparse";
import { YarnItem, YarnWeight } from "@/types/yarn";
import { CSV_COLUMN_MAPPING } from "./csv-types";

/**
 * Parses CSV text content into an array of YarnItem objects.
 * 
 * @param csvText - Raw CSV text content
 * @returns Array of parsed YarnItem objects
 */
export function parseCSVToYarnItems(csvText: string): YarnItem[] {
  // Parse CSV with headers
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  
  // Log any parsing warnings
  if (results.errors && results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }
  
  return processResults(results.data);
}

/**
 * Converts an array of YarnItem objects into CSV format.
 * 
 * @param data - Array of YarnItem objects to convert
 * @returns CSV-formatted string
 */
export function convertYarnItemsToCSV(data: YarnItem[]): string {
  // Get headers from our column mapping
  const headers = Object.values(CSV_COLUMN_MAPPING);
  
  // Convert the YarnItem objects to row objects that match our CSV structure
  const rows = data.map(item => {
    const row: Record<string, any> = {};
    
    // Map each property back to the CSV column
    row[CSV_COLUMN_MAPPING.brand] = item.brand;
    row[CSV_COLUMN_MAPPING.subBrand] = item.subBrand;
    row[CSV_COLUMN_MAPPING.vintage] = item.vintage ? 'Yes' : 'No';
    row[CSV_COLUMN_MAPPING.qty] = item.qty.toString();
    row[CSV_COLUMN_MAPPING.length] = item.length.toString();
    row[CSV_COLUMN_MAPPING.multicolor] = item.multicolor ? 'Yes' : 'No';
    row[CSV_COLUMN_MAPPING.softnessRanking] = item.softnessRanking; // Keep as string
    row[CSV_COLUMN_MAPPING.weight] = item.weight;
    row[CSV_COLUMN_MAPPING.hookSize] = item.hookSize;
    row[CSV_COLUMN_MAPPING.rows] = item.rows.toString();
    row[CSV_COLUMN_MAPPING.machineWash] = item.machineWash ? 'Yes' : 'No';
    row[CSV_COLUMN_MAPPING.machineDry] = item.machineDry ? 'Yes' : 'No';
    row[CSV_COLUMN_MAPPING.material] = item.material;
    row[CSV_COLUMN_MAPPING.brandColor] = item.brandColor;
    
    // Handle up to 4 colors
    if (item.colors.length > 0) row[CSV_COLUMN_MAPPING.color1] = item.colors[0];
    if (item.colors.length > 1) row[CSV_COLUMN_MAPPING.color2] = item.colors[1];
    if (item.colors.length > 2) row[CSV_COLUMN_MAPPING.color3] = item.colors[2];
    if (item.colors.length > 3) row[CSV_COLUMN_MAPPING.color4] = item.colors[3];
    
    return row;
  });
  
  // Convert to CSV format using PapaParse
  return Papa.unparse({
    fields: headers,
    data: rows
  });
}

/**
 * Processes raw CSV data rows into typed YarnItem objects.
 * 
 * @param data - Raw CSV data rows
 * @returns Array of properly typed YarnItem objects
 */
function processResults(data: any[]): YarnItem[] {
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
      row[CSV_COLUMN_MAPPING.color4]
    ].filter(color => color && color.trim() !== '');

    // Convert string values to boolean
    const isMulticolor = convertToBoolean(row[CSV_COLUMN_MAPPING.multicolor]);
    const isVintage = convertToBoolean(row[CSV_COLUMN_MAPPING.vintage]);
    const isMachineWash = convertToBoolean(row[CSV_COLUMN_MAPPING.machineWash]);
    const isMachineDry = convertToBoolean(row[CSV_COLUMN_MAPPING.machineDry]);
    
    // Validate and normalize weight value
    const weightValue = normalizeYarnWeight(row[CSV_COLUMN_MAPPING.weight]);
    
    // Create YarnItem object with validated properties
    return {
      id: `yarn-${index}`,
      brand: row[CSV_COLUMN_MAPPING.brand] || '',
      subBrand: row[CSV_COLUMN_MAPPING.subBrand] || '',
      vintage: isVintage,
      qty: parseInt(row[CSV_COLUMN_MAPPING.qty], 10) || 0,
      length: parseInt(row[CSV_COLUMN_MAPPING.length], 10) || 0,
      multicolor: isMulticolor,
      softnessRanking: row[CSV_COLUMN_MAPPING.softnessRanking] || '', // Keep as string
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

/**
 * Helper function to convert various string representations to boolean.
 * 
 * @param value - String value that might represent a boolean
 * @returns Converted boolean value
 */
function convertToBoolean(value?: string): boolean {
  if (!value) return false;
  
  const normalized = value.toLowerCase().trim();
  return normalized === 'yes' || normalized === 'true' || normalized === '1';
}

/**
 * Normalizes yarn weight values to ensure they match the YarnWeight type.
 * 
 * @param weightValue - Raw weight value from CSV
 * @returns Normalized weight value that conforms to YarnWeight type
 */
function normalizeYarnWeight(weightValue?: string): YarnWeight {
  const normalized = (weightValue?.toLowerCase() || 'other') as string;
  
  // List of valid YarnWeight values
  const validWeights: YarnWeight[] = [
    "lace", "super fine", "fine", "light", "medium", 
    "bulky", "super bulky", "jumbo", "other"
  ];
  
  // Return the normalized value if valid, or "other" if not
  return validWeights.includes(normalized as YarnWeight) 
    ? normalized as YarnWeight 
    : "other";
}
