import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash,
  ChevronRight,
  Users,
  X,
  Check,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Patient, Treatment, TreatmentMedication, TreatmentService } from '../types/patient';
import toast from 'react-hot-toast'; // Added toast import

// Initial data for the patient form
const initialPatientData = {
  name: '',
  age: '',
  gender: 'male',
  residence: '',
  phone: '',
  email: '',
  userId: '', // Added userId
};

// Initial data for the treatment form
const initialTreatmentData = {
  diagnosis: '',
  notes: '',
  medications: [],
  services: [],
  date: new Date(),
  userId: '', // Added userId
};

// Initial data for the payment form
const initialPaymentData = {
  amount: '',
  paymentDate: new Date(),
};

const Patients: React.FC = () => {
  // Destructure necessary functions and data from AppContext
  const {
    patients,
    treatments,
    inventoryItems, // inventoryItems is still needed for medication selection
    addPatient,
    deletePatient,
    updatePatient,
    addTreatment,
    updateTreatment,
    addPayment,
    user // Destructure user to get current userId
  } = useAppContext();

  // State variables for controlling modal visibility
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');

  // State for adding new patient data
  const [patientData, setPatientData] = useState(initialPatientData);

  // State for adding new treatment data
  const [treatmentData, setTreatmentData] = useState<Omit<Treatment, 'id' | 'createdAt' | 'updatedAt' | 'patientId' | 'totalCost' | 'amountPaid' | 'paymentStatus'>>(initialTreatmentData);

  // States for selected patient and treatment (for details/actions)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  // State for payment data
  const [paymentData, setPaymentData] = useState(initialPaymentData);

  // States for medication and service inputs within treatment form
  const [selectedMedication, setSelectedMedication] = useState({
    id: '',
    quantity: '',
    dosage: '',
    instructions: ''
  });
  const [selectedService, setSelectedService] = useState({
    name: '',
    description: '',
    cost: ''
  });

  // Existing states for editing patient
  const [editingPatient, setEditingPatient] = useState<typeof initialPatientData & { id: string } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.residence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler for patient form input changes (Add Patient)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for treatment form input changes
  const handleTreatmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTreatmentData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for medication input changes within treatment form
  const handleMedicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedMedication(prev => ({ ...prev, [name]: value }));
  };

  // Handler for service input changes within treatment form
  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedService(prev => ({ ...prev, [name]: value }));
  };

  // Handler for payment form input changes
  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for submitting new patient form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Authentication required to add patient.');
      return;
    }

    // Convert age to number and assert gender type
    const formattedData = {
      ...patientData,
      age: parseInt(patientData.age, 10),
      gender: patientData.gender as 'male' | 'female' | 'other',
      hasOutstandingBalance: false, // Default for new patient
      totalOutstanding: 0, // Default for new patient
      userId: user.id, // Explicitly add userId
    };

    addPatient(formattedData);
    setPatientData(initialPatientData);
    setShowAddForm(false);
  };

  // Handler for adding a medication to the current treatment
  const handleAddMedication = () => {
    const medication = inventoryItems.find(item => item.id === selectedMedication.id);
    if (!medication) return;

    const quantity = parseInt(selectedMedication.quantity);
    const newMedication: TreatmentMedication = {
      id: crypto.randomUUID(),
      inventoryItemId: medication.id,
      name: medication.name,
      quantity,
      dosage: selectedMedication.dosage,
      instructions: selectedMedication.instructions,
      unitCost: medication.unitCost,
      totalCost: medication.unitCost * quantity
    };

    setTreatmentData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));

    // Reset selected medication inputs
    setSelectedMedication({
      id: '',
      quantity: '',
      dosage: '',
      instructions: ''
    });
  };

  // Handler for adding a service to the current treatment
  const handleAddService = () => {
    const newService: TreatmentService = {
      id: crypto.randomUUID(),
      name: selectedService.name,
      description: selectedService.description,
      cost: parseFloat(selectedService.cost)
    };

    setTreatmentData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));

    // Reset selected service inputs
    setSelectedService({
      name: '',
      description: '',
      cost: ''
    });
  };

  // Handler for submitting a new treatment
  const handleTreatmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !user) return;

    const totalMedicationsCost = treatmentData.medications.reduce(
      (sum, med) => sum + med.totalCost,
      0
    );

    const totalServicesCost = treatmentData.services.reduce(
      (sum, service) => sum + service.cost,
      0
    );

    const treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt' | 'amountPaid' | 'paymentStatus'> = {
      ...treatmentData,
      patientId: selectedPatient.id,
      totalCost: totalMedicationsCost + totalServicesCost,
      userId: user.id, // Explicitly add userId
    };

    addTreatment(treatment);
    setTreatmentData(initialTreatmentData); // Reset treatment form
    setShowTreatmentForm(false); // Close treatment modal
  };

  // Handler for recording a payment
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTreatment || !selectedPatient) return;

    const paymentAmount = parseFloat(paymentData.amount);
    // Calculate new amount paid, ensuring it doesn't exceed total cost
    const newAmountPaid = Math.min(selectedTreatment.amountPaid + paymentAmount, selectedTreatment.totalCost);

    if (paymentAmount <= 0) {
        console.error("Payment amount must be greater than zero.");
        return;
    }
    if (newAmountPaid > selectedTreatment.totalCost + 0.01) { // Allow for small floating point errors
        console.error("Payment amount exceeds outstanding balance.");
        return;
    }

    try {
        // Update the treatment with the new amount paid and payment date
        await updateTreatment(selectedTreatment.id, {
            amountPaid: newAmountPaid,
            paymentStatus: newAmountPaid >= selectedTreatment.totalCost ? 'paid' : 'partial',
        });

        // Add the payment as a separate record
        await addPayment({
          patientId: selectedPatient.id,
          treatmentId: selectedTreatment.id,
          amount: paymentAmount,
          paymentDate: paymentData.paymentDate,
          method: 'cash', // Default or allow selection
          status: 'completed', // Default or dynamically set
          notes: `Payment for treatment ${selectedTreatment.diagnosis}`,
        });

        setPaymentData(initialPaymentData); // Reset payment form
        setSelectedTreatment(null); // Clear selected treatment
        setShowRecordPayment(false); // Close payment modal
    } catch (error) {
        console.error("Failed to record payment:", error);
    }
  };

  // Utility function to get treatments for a specific patient
  const getPatientTreatments = (patientId: string) => {
    return treatments.filter(treatment => treatment.patientId === patientId);
  };

  // Utility function to calculate total outstanding balance for a patient
  const calculateTotalOwed = (patientId: string) => {
    return getPatientTreatments(patientId).reduce(
      (sum, treatment) => sum + (treatment.totalCost - treatment.amountPaid),
      0
    );
  };

  // Open edit modal and fill form (existing functionality)
  const openEditModal = (patient: Patient) => {
    setEditingPatient({
      id: patient.id,
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      residence: patient.residence,
      phone: patient.phone || '',
      email: patient.email || '',
      userId: patient.userId, // Include userId here
    });
    setIsEditOpen(true);
  };

  // Separate input handler for edit form (existing functionality)
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!editingPatient) return;
    setEditingPatient(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Submit edit form and call updatePatient from context (existing functionality)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    // Prepare updated data
    const formattedData: Partial<Patient> = { // Specify Partial<Patient>
      name: editingPatient.name,
      age: parseInt(editingPatient.age, 10),
      gender: editingPatient.gender as 'male' | 'female' | 'other',
      residence: editingPatient.residence,
      phone: editingPatient.phone,
      email: editingPatient.email,
      userId: editingPatient.userId, // Include userId here
    };

    await updatePatient(editingPatient.id, formattedData);
    setIsEditOpen(false);
    setEditingPatient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Patient Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Patients</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search patients by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
      </div>

      {/* Patient List Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No patients found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "You haven't added any patients yet"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-primary hover:text-primary-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Age</th>
                  <th className="px-6 py-3 text-left font-medium">Gender</th>
                  <th className="px-6 py-3 text-left font-medium">Residence</th>
                  <th className="px-6 py-3 text-left font-medium">Contact</th>
                  <th className="px-6 py-3 text-left font-medium">Balance</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredPatients.map(patient => {
                  const totalOwed = calculateTotalOwed(patient.id);
                  const hasOutstandingBalance = totalOwed > 0.01;
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{patient.name}</div>
                        {hasOutstandingBalance && (
                          <div className="flex items-center gap-1 text-xs text-error mt-1">
                            <AlertTriangle size={12} />
                            <span>Has outstanding balance</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{patient.age}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">{patient.gender}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{patient.residence}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {patient.phone || patient.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {hasOutstandingBalance ? (
                          <span className="text-error font-medium">
                            K{totalOwed.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-success dark:text-green-400">Paid</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Add Treatment Button */}
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setTreatmentData(initialTreatmentData); // Reset form when opening for new treatment
                              setShowTreatmentForm(true);
                            }}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            title="Add Treatment"
                          >
                            <FileText size={18} />
                          </button>
                          {/* Edit Patient Button (existing) */}
                          <button
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={() => openEditModal(patient)}
                            title="Edit Patient"
                          >
                            <Edit size={18} />
                          </button>
                          {/* Delete Patient Button (existing) */}
                          <button
                            onClick={() => deletePatient(patient.id)}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-error dark:hover:text-error-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            title="Delete Patient"
                          >
                            <Trash size={18} />
                          </button>
                          {/* View Details Button */}
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowPatientDetails(true);
                            }}
                            className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                            title="View Details"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Patient Modal (existing) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Add New Patient</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={patientData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={patientData.age}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="150"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={patientData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Residence
                  </label>
                  <input
                    type="text"
                    name="residence"
                    value={patientData.residence}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={patientData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={patientData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal (existing) */}
      {isEditOpen && editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Edit Patient</h2>
              <button
                onClick={() => { setIsEditOpen(false); setEditingPatient(null); }}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingPatient.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={editingPatient.age}
                      onChange={handleEditInputChange}
                      required
                      min="0"
                      max="150"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={editingPatient.gender}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Residence
                  </label>
                  <input
                    type="text"
                    name="residence"
                    value={editingPatient.residence}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editingPatient.phone}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editingPatient.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingPatient(null); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Treatment Modal (from first file) */}
      {showTreatmentForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Add New Treatment</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Patient: {selectedPatient.name}
                </p>
              </div>
              <button
                onClick={() => setShowTreatmentForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTreatmentSubmit} className="p-4">
              <div className="space-y-6">
                {/* Basic Treatment Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Treatment Date
                    </label>
                    <DatePicker
                      selected={treatmentData.date}
                      onChange={(date: Date) => setTreatmentData(prev => ({ ...prev, date }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={treatmentData.diagnosis}
                      onChange={handleTreatmentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={treatmentData.notes || ''}
                      onChange={handleTreatmentInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    ></textarea>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold dark:text-white mb-4">Medications</h3>
                  <div className="space-y-4">
                    {treatmentData.medications.map((med, index) => (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium dark:text-white">{med.name} ({med.dosage})</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {med.quantity} | Cost: K{med.totalCost.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTreatmentData(prev => ({
                            ...prev,
                            medications: prev.medications.filter((_, i) => i !== index)
                          }))}
                          className="p-1 text-error hover:bg-error/10 rounded-full"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Select Medication
                      </label>
                      <select
                        name="id"
                        value={selectedMedication.id}
                        onChange={handleMedicationChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">-- Select --</option>
                        {inventoryItems.filter(item => item.category === 'medication').map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} (Stock: {item.currentStock} {item.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={selectedMedication.quantity}
                        onChange={handleMedicationChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        name="dosage"
                        value={selectedMedication.dosage}
                        onChange={handleMedicationChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        name="instructions"
                        value={selectedMedication.instructions}
                        onChange={handleMedicationChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="mt-4 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    Add Medication
                  </button>
                </div>

                {/* Services Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold dark:text-white mb-4">Services</h3>
                  <div className="space-y-4">
                    {treatmentData.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium dark:text-white">{service.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Cost: K{service.cost.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setTreatmentData(prev => ({
                            ...prev,
                            services: prev.services.filter((_, i) => i !== index)
                          }))}
                          className="p-1 text-error hover:bg-error/10 rounded-full"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={selectedService.name}
                        onChange={handleServiceChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cost (K)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={selectedService.cost}
                        onChange={handleServiceChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={selectedService.description}
                        onChange={handleServiceChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      ></textarea>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="mt-4 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    Add Service
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTreatmentForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Patient Details: {selectedPatient.name}</h2>
              <button
                onClick={() => setShowPatientDetails(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Patient Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-medium">Age:</p>
                  <p>{selectedPatient.age}</p>
                </div>
                <div>
                  <p className="font-medium">Gender:</p>
                  <p className="capitalize">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="font-medium">Residence:</p>
                  <p>{selectedPatient.residence}</p>
                </div>
                <div>
                  <p className="font-medium">Phone:</p>
                  <p>{selectedPatient.phone || '-'}</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{selectedPatient.email || '-'}</p>
                </div>
                <div>
                  <p className="font-medium">Address:</p>
                  <p>{selectedPatient.address || '-'}</p>
                </div>
                <div>
                  <p className="font-medium">Total Outstanding Balance:</p>
                  <p className={`${calculateTotalOwed(selectedPatient.id) > 0.01 ? 'text-error' : 'text-success dark:text-green-400'} font-semibold`}>
                    K{calculateTotalOwed(selectedPatient.id).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Treatments History */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold dark:text-white mb-4">Treatments History</h3>
                {getPatientTreatments(selectedPatient.id).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No treatments recorded for this patient.</p>
                ) : (
                  <div className="space-y-4">
                    {getPatientTreatments(selectedPatient.id).map(treatment => (
                      <div key={treatment.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium dark:text-white">
                            Treatment on {format(new Date(treatment.date), 'PPP')}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            treatment.paymentStatus === 'paid' ? 'bg-success/20 text-success' :
                            treatment.paymentStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-700' :
                            'bg-error/20 text-error'
                          }`}>
                            {treatment.paymentStatus}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">Diagnosis: {treatment.diagnosis}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Notes: {treatment.notes || 'N/A'}</p>
                        <div className="mt-2 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">Total Cost: K{treatment.totalCost.toFixed(2)}</p>
                          <p className="text-gray-700 dark:text-gray-300">Amount Paid: K{treatment.amountPaid.toFixed(2)}</p>
                          <p className="text-gray-700 dark:text-gray-300">Outstanding: K{(treatment.totalCost - treatment.amountPaid).toFixed(2)}</p>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          {treatment.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedTreatment(treatment);
                                setShowRecordPayment(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                              <CreditCard size={16} /> Record Payment
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && selectedTreatment && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Record Payment</h2>
              <button
                onClick={() => setShowRecordPayment(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-4">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Patient: <span className="font-medium">{selectedPatient.name}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Treatment: <span className="font-medium">{selectedTreatment.diagnosis}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Total Cost: <span className="font-medium">K{selectedTreatment.totalCost.toFixed(2)}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Amount Paid: <span className="font-medium">K{selectedTreatment.amountPaid.toFixed(2)}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Outstanding Balance: <span className="font-medium text-error">
                    K{(selectedTreatment.totalCost - selectedTreatment.amountPaid).toFixed(2)}
                  </span>
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handlePaymentInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date
                  </label>
                  <DatePicker
                    selected={paymentData.paymentDate}
                    onChange={(date: Date) => setPaymentData(prev => ({ ...prev, paymentDate: date }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecordPayment(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
