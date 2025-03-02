
/**
 * Defines the structure and types for CSV operations in the application.
 * This includes column mappings and service configuration options.
 */

import { YarnItem } from "@/types/yarn";

/**
 * Maps internal data model properties to CSV column headers.
 * This ensures consistent mapping between the CSV file and application data.
 */
export const CSV_COLUMN_MAPPING = {
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

/**
 * Configuration options for the CSVService.
 */
export interface CSVServiceOptions {
  /** Interval in milliseconds to check for CSV file updates. Defaults to 5000 (5 seconds). */
  pollingInterval?: number;
  /** Maximum number of attempts to load the CSV file before giving up. Defaults to 3. */
  maxLoadAttempts?: number;
}

/**
 * Callback function type for handling data updates from the CSV service.
 * @param data The updated array of YarnItem objects.
 */
export interface CSVDataUpdateCallback {
  (data: YarnItem[]): void;
}

/**
 * Result of a CSV update operation.
 */
export interface CSVUpdateResult {
  /** Whether the update was successful. */
  success: boolean;
  /** Optional error message if the update failed. */
  error?: string;
}
