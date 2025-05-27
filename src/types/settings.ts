// src/types/settings.ts

export interface ClinicSettings {
  id: string; // Assuming a single row for clinic settings, ID could be '1'
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventorySettings {
  id: string; // Assuming a single row for inventory settings, ID could be '1'
  lowStockThreshold: number; // Percentage
  enableAutoReorder: boolean;
  autoReorderThreshold: number; // Percentage
  createdAt: Date;
  updatedAt: Date;
}
