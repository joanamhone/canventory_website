// src/types/inventory.ts

export type InventoryItemCategory = 'medication' | 'supply' | 'equipment';
export type InventoryTransactionType = 'addition' | 'deduction' | 'adjustment';
export type InventoryReferenceType = 'treatment' | 'purchase' | 'manual';
export type StockAlertType = 'low' | 'expired' | 'expiring';

export interface InventoryItem {
  type: string;
  id: string;
  name: string;
  category: InventoryItemCategory;
  currentStock: number;
  unit: string;
  unitCost: number;
  reorderLevel: number;
  reorderQuantity: number;
  supplier?: string | null; // Changed to allow null
  notes?: string | null; // Changed to allow null
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// New interface to represent the database schema (snake_case)
export interface InventoryItemDB {
  id: string;
  name: string;
  category: InventoryItemCategory;
  current_stock: number; // snake_case
  unit: string;
  unit_cost: number; // snake_case
  reorder_level: number; // snake_case
  reorder_quantity: number; // snake_case
  supplier?: string | null; // Changed to allow null
  notes?: string | null; // Changed to allow null
  expiry_date?: Date; // snake_case
  created_at: Date; // snake_case
  updated_at: Date; // snake_case
  user_id: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  type: InventoryTransactionType;
  quantity: number;
  balance: number;
  reason: string;
  referenceId?: string | null; // Changed to string | null
  referenceType?: InventoryReferenceType; // Changed to allow undefined, but also handles null via Supabase mapping
  createdAt: Date;
  createdBy: string;
}

export interface StockAlert {
  id: string;
  inventoryItemId: string;
  type: StockAlertType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
