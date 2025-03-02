
export type YarnWeight = 
  | "lace"
  | "super fine"
  | "fine"
  | "light"
  | "medium"
  | "bulky"
  | "super bulky"
  | "jumbo"
  | "other";

export interface YarnItem {
  id: string;
  brand: string;
  subBrand: string;
  vintage: boolean;
  qty: number;
  length: number;
  multicolor: boolean;
  softnessRanking: number;
  weight: YarnWeight;
  hookSize: string;
  rows: number;
  machineWash: boolean;
  machineDry: boolean;
  material: string;
  brandColor: string;
  colors: string[];
}

export interface ColorGroup {
  name: string;
  colors: string[];
  hue: number;
}

export interface FilterState {
  brands: string[];
  subBrands: string[];
  weights: YarnWeight[];
  materials: string[];
  hookSizes: string[];
  vintage: boolean | null;
  machineWash: boolean | null;
  machineDry: boolean | null;
  multicolor: boolean | null;
  colorGroups: string[];
  minLength: number | null;
  maxLength: number | null;
  minQty: number | null;
  maxQty: number | null;
  minRows: number | null;
  maxRows: number | null;
  minSoftness: number | null;
  maxSoftness: number | null;
  search: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: Date;
}
