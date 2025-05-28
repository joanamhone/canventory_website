// src/types/payment.ts

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'insurance' | 'other';
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'partial'; // Added 'partial' as it's used in AppContext

export interface Payment {
  id: string;
  treatmentId: string;
  patientId: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod; // Using the exported type
  status: PaymentStatus; // Using the exported type
  notes?: string | null; // Changed to allow null
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentAlert {
  id: string;
  patientId: string;
  treatmentId: string;
  dueAmount: number;
  dueDate: Date;
  status: 'overdue' | 'due_soon';
  isRead: boolean;
  createdAt: Date;
}

export interface PaymentSettings {
  gracePeriod: number; // Days
  reminderIntervals: number[]; // Days before due date to send reminders
  autoNotify: boolean;
}
