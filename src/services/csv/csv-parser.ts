
import Papa from "papaparse";
import { YarnItem, YarnWeight } from "@/types/yarn";
import { CSV_COLUMN_MAPPING } from "./csv-types";

export function parseCSVToYarnItems(csvText: string): YarnItem[] {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  
  if (results.errors && results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }
  
  return processResults(results.data);
}

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
    row[CSV_COLUMN_MAPPING.softnessRanking] = item.softnessRanking.toString();
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
  
  // Use PapaParse to convert the data to CSV
  return Papa.unparse({
    fields: headers,
    data: rows
  });
}

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
