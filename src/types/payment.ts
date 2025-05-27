// src/types/payment.ts

export interface Payment {
  id: string;
  treatmentId: string;
  patientId: string;
  amount: number;
  paymentDate: Date;
  method: 'cash' | 'card' | 'mobile' | 'insurance' | 'other'; // Added 'insurance' and 'other' for flexibility
  status: 'completed' | 'pending' | 'failed'; // Added status property
  notes?: string;
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
