
import { YarnItem } from "@/types/yarn";

// Column mapping to match CSV structure
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

export interface CSVServiceOptions {
  pollingInterval?: number;
  maxLoadAttempts?: number;
}

export interface CSVDataUpdateCallback {
  (data: YarnItem[]): void;
}
