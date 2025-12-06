
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChartDataPoint {
  name: string;
  percentage: number;
}

export interface AnalysisResult {
  chartData: ChartDataPoint[];
  imageUrl: string;
  visualDescription: string;
  // Structured Analysis Fields
  theme: string;
  vibeCheck: string;
  deepDive: string[];
  realityCheck: string;
  healingRoadmap: string[];
}

export enum AppState {
  WELCOME,
  IN_PROGRESS,
  ANALYZING,
  RESULTS,
  ERROR,
}
