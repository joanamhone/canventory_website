// src/types/patient.ts

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  residence: string;
  phone?: string;
  email?: string;
  address?: string; // Added address for completeness
  hasOutstandingBalance: boolean; // Indicates if patient has any outstanding payments
  totalOutstanding: number; // Total amount outstanding across all treatments
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Link to the user who created/owns this patient record
}

export interface TreatmentMedication {
  id: string; // Unique ID for this medication entry in the treatment
  inventoryItemId: string; // Link to the actual inventory item
  name: string;
  quantity: number;
  dosage: string;
  instructions?: string;
  unitCost: number; // Cost per unit at the time of treatment
  totalCost: number; // quantity * unitCost
}

export interface TreatmentService {
  id: string; // Unique ID for this service entry in the treatment
  name: string;
  description?: string;
  cost: number;
}

export interface Treatment {
  id: string;
  patientId: string; // Link to the patient
  diagnosis: string;
  notes?: string;
  medications: TreatmentMedication[];
  services: TreatmentService[];
  date: Date; // Date of treatment
  totalCost: number; // Sum of all medication and service costs
  amountPaid: number; // Amount paid towards this specific treatment
  paymentStatus: 'paid' | 'partial' | 'pending'; // Status of payment for this treatment
  dueDate?: Date; // Optional due date for payment
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Link to the user who created/owns this treatment record
}

// NEW: Interface to represent the exact structure of data coming from Supabase 'treatments' table
// This helps TypeScript with deep inference issues for jsonb columns
export interface SupabaseTreatment {
  id: string;
  patient_id: string;
  diagnosis: string;
  notes: string | null;
  medications: any[]; // Use 'any[]' or a more specific type if the JSON structure is consistent and simple
  services: any[];    // Use 'any[]' or a more specific type if the JSON structure is consistent and simple
  date: string; // Supabase date/timestamp columns are often returned as strings
  total_cost: number;
  amount_paid: number;
  payment_status: 'paid' | 'partial' | 'pending';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}
