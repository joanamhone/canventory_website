import { Patient, Treatment, TreatmentMedication, TreatmentService } from '../types/patient';
import { InventoryItem, InventoryTransaction, StockAlert } from '../types/inventory';
import { Payment, PaymentAlert } from '../types/payment';
import { addDays, subDays, subMonths, subWeeks } from 'date-fns';

// Helper function to generate random dates within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const generateMockData = () => {
  // Generate random IDs
  const generateId = () => crypto.randomUUID();

  // Create mock inventory items
  const inventoryItems: InventoryItem[] = [
    {
      id: generateId(),
      name: 'Paracetamol 500mg',
      category: 'medication',
      currentStock: 120,
      unit: 'tablets',
      unitCost: 0.5,
      reorderLevel: 30,
      reorderQuantity: 100,
      supplier: 'MedSupply Inc.',
      notes: 'Generic pain reliever',
      createdAt: subMonths(new Date(), 6),
      updatedAt: subDays(new Date(), 15)
    },
    {
      id: generateId(),
      name: 'Amoxicillin 250mg',
      category: 'medication',
      currentStock: 45,
      unit: 'capsules',
      unitCost: 1.2,
      reorderLevel: 20,
      reorderQuantity: 50,
      supplier: 'PharmaPlus',
      notes: 'Antibiotic',
      createdAt: subMonths(new Date(), 4),
      updatedAt: subDays(new Date(), 10)
    },
    {
      id: generateId(),
      name: 'Ibuprofen 400mg',
      category: 'medication',
      currentStock: 80,
      unit: 'tablets',
      unitCost: 0.75,
      reorderLevel: 25,
      reorderQuantity: 75,
      supplier: 'MedSupply Inc.',
      notes: 'Anti-inflammatory',
      createdAt: subMonths(new Date(), 5),
      updatedAt: subWeeks(new Date(), 3)
    },
    {
      id: generateId(),
      name: 'Surgical Gloves',
      category: 'supply',
      currentStock: 200,
      unit: 'pairs',
      unitCost: 0.3,
      reorderLevel: 50,
      reorderQuantity: 200,
      supplier: 'MedEquip Ltd.',
      notes: 'Latex-free, Medium size',
      createdAt: subMonths(new Date(), 3),
      updatedAt: subDays(new Date(), 5)
    },
    {
      id: generateId(),
      name: 'Bandages',
      category: 'supply',
      currentStock: 15,
      unit: 'packs',
      unitCost: 3.5,
      reorderLevel: 10,
      reorderQuantity: 20,
      supplier: 'MedEquip Ltd.',
      notes: 'Sterile, 10 per pack',
      createdAt: subMonths(new Date(), 2),
      updatedAt: subDays(new Date(), 2)
    },
    {
      id: generateId(),
      name: 'Blood Pressure Monitor',
      category: 'equipment',
      currentStock: 5,
      unit: 'units',
      unitCost: 45.0,
      reorderLevel: 2,
      reorderQuantity: 3,
      supplier: 'MedTech Solutions',
      notes: 'Digital, automatic',
      createdAt: subMonths(new Date(), 8),
      updatedAt: subMonths(new Date(), 1)
    }
  ];

  // Generate inventory item ID map for easier reference
  const inventoryMap = inventoryItems.reduce((acc, item) => {
    acc[item.name] = item.id;
    return acc;
  }, {} as Record<string, string>);

  // Create mock patients
  const patients: Patient[] = [
    {
      id: generateId(),
      name: 'John Smith',
      age: 45,
      gender: 'male',
      residence: '123 Main St, Cityville',
      phone: '555-123-4567',
      email: 'john.smith@example.com',
      hasOutstandingBalance: true,
      totalOutstanding: 60,
      createdAt: subMonths(new Date(), 5),
      updatedAt: subDays(new Date(), 10)
    },
    {
      id: generateId(),
      name: 'Sarah Johnson',
      age: 32,
      gender: 'female',
      residence: '456 Oak Ave, Townsburg',
      phone: '555-987-6543',
      email: 'sarah.j@example.com',
      hasOutstandingBalance: true,
      totalOutstanding: 110.20,
      createdAt: subMonths(new Date(), 3),
      updatedAt: subDays(new Date(), 5)
    },
    {
      id: generateId(),
      name: 'Michael Chen',
      age: 28,
      gender: 'male',
      residence: '789 Pine Rd, Villageton',
      phone: '555-456-7890',
      hasOutstandingBalance: false,
      totalOutstanding: 0,
      createdAt: subMonths(new Date(), 2),
      updatedAt: subWeeks(new Date(), 1)
    }
  ];

  // Generate patient ID map for easier reference
  const patientMap = patients.reduce((acc, patient) => {
    acc[patient.name] = patient.id;
    return acc;
  }, {} as Record<string, string>);

  // Create mock treatments
  const treatments: Treatment[] = [
    {
      id: generateId(),
      patientId: patientMap['John Smith'],
      date: subDays(new Date(), 10),
      diagnosis: 'Common cold',
      notes: 'Patient reported sore throat and runny nose',
      medications: [
        {
          id: generateId(),
          inventoryItemId: inventoryMap['Paracetamol 500mg'],
          name: 'Paracetamol 500mg',
          quantity: 20,
          dosage: '1 tablet every 6 hours',
          instructions: 'Take with food',
          unitCost: 0.5,
          totalCost: 10
        }
      ],
      services: [
        {
          id: generateId(),
          name: 'Consultation',
          description: 'General checkup',
          cost: 50
        }
      ],
      totalCost: 60,
      amountPaid: 0,
      paymentStatus: 'pending',
      dueDate: addDays(subDays(new Date(), 10), 30),
      createdAt: subDays(new Date(), 10),
      updatedAt: subDays(new Date(), 10)
    },
    {
      id: generateId(),
      patientId: patientMap['Sarah Johnson'],
      date: subDays(new Date(), 5),
      diagnosis: 'Bacterial infection',
      notes: 'Suspected urinary tract infection',
      medications: [
        {
          id: generateId(),
          inventoryItemId: inventoryMap['Amoxicillin 250mg'],
          name: 'Amoxicillin 250mg',
          quantity: 20,
          dosage: '1 capsule three times daily',
          instructions: 'Take with food',
          unitCost: 1.2,
          totalCost: 24
        }
      ],
      services: [
        {
          id: generateId(),
          name: 'Consultation',
          description: 'General checkup',
          cost: 50
        },
        {
          id: generateId(),
          name: 'Lab Test',
          description: 'Urine analysis',
          cost: 36.20
        }
      ],
      totalCost: 110.20,
      amountPaid: 0,
      paymentStatus: 'pending',
      dueDate: addDays(subDays(new Date(), 5), 30),
      createdAt: subDays(new Date(), 5),
      updatedAt: subDays(new Date(), 5)
    }
  ];

  // Create mock inventory transactions
  const inventoryTransactions: InventoryTransaction[] = [
    {
      id: generateId(),
      inventoryItemId: inventoryMap['Paracetamol 500mg'],
      type: 'addition',
      quantity: 100,
      balance: 100,
      reason: 'Initial stock',
      referenceType: 'manual',
      createdAt: subMonths(new Date(), 2),
      createdBy: 'admin'
    },
    {
      id: generateId(),
      inventoryItemId: inventoryMap['Paracetamol 500mg'],
      type: 'deduction',
      quantity: 20,
      balance: 80,
      reason: 'Used for treatment',
      referenceId: treatments[0].id,
      referenceType: 'treatment',
      createdAt: subDays(new Date(), 10),
      createdBy: 'admin'
    }
  ];

  // Create mock stock alerts
  const stockAlerts: StockAlert[] = [
    {
      id: generateId(),
      inventoryItemId: inventoryMap['Bandages'],
      type: 'low',
      message: 'Bandages is low in stock (15 packs remaining)',
      isRead: false,
      createdAt: new Date()
    }
  ];

  // Create mock payment alerts
  const paymentAlerts: PaymentAlert[] = [
    {
      id: generateId(),
      patientId: patientMap['John Smith'],
      treatmentId: treatments[0].id,
      dueAmount: 60,
      dueDate: addDays(subDays(new Date(), 10), 30),
      status: 'pending',
      isRead: false,
      createdAt: new Date()
    }
  ];

  // Create mock payments
  const payments: Payment[] = [];

  return {
    patients,
    treatments,
    inventoryItems,
    inventoryTransactions,
    stockAlerts,
    payments,
    paymentAlerts
  };
};