
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
  length: number;
  multicolor: boolean;
  weight: YarnWeight;
  rows: number;
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
  multicolor: boolean | null;
  colorGroups: string[];
  minLength: number | null;
  maxLength: number | null;
  minRows: number | null;
  maxRows: number | null;
  search: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: Date;
}
