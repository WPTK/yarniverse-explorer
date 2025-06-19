
export interface ScannerConfig {
  enabledFormats: string[];
  tryHarder: boolean;
  resultPointCallback?: (point: any) => void;
}

export interface ScanResult {
  text: string;
  format: string;
  timestamp: number;
  confidence?: number;
}

export interface CameraError {
  name: string;
  message: string;
  constraint?: string;
}
