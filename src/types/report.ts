export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FinancialSummary {
  totalRevenue: number;
  medicationRevenue: number;
  serviceRevenue: number;
  averagePerPatient: number;
  patientCount: number;
  treatmentCount: number;
}

export interface InventorySummary {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  mostUsedItems: { name: string; quantity: number; value: number }[];
  recentTransactions: { date: Date; itemName: string; quantity: number; type: string }[];
}

export interface PatientSummary {
  totalPatients: number;
  newPatients: number;
  returnPatients: number;
  genderDistribution: { male: number; female: number; other: number };
  ageDistribution: { [range: string]: number };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
