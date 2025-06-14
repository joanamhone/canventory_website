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

//Format for the money
const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);


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
    if (!medication) {
      toast.error('Please select a valid medication from the inventory.');
      return;
    }
    if (selectedMedication.quantity === '' || isNaN(parseInt(selectedMedication.quantity))) {
      toast.error('Please enter a valid quantity for the medication.');
      return;
    }
    if (selectedMedication.dosage === '') {
      toast.error('Please enter a dosage for the medication.');
      return;
    }

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
    if (selectedService.name === '') {
      toast.error('Please enter a name for the service.');
      return;
    }
    if (selectedService.cost === '' || isNaN(parseFloat(selectedService.cost))) {
      toast.error('Please enter a valid cost for the service.');
      return;
    }

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
    if (!selectedPatient || !user) {
      toast.error('Patient or user not selected.');
      return;
    }

    if (treatmentData.medications.length === 0 && treatmentData.services.length === 0) {
      toast.error('Please add at least one medication or service to the treatment.');
      return;
    }

    // totalCost is now calculated in AppContext, so we don't need to pass it here.
    // The type definition for addTreatment in AppContextType has been updated.
    const treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt' | 'amountPaid' | 'paymentStatus' | 'totalCost'> = {
      ...treatmentData,
      patientId: selectedPatient.id,
      userId: user.id, // Explicitly add userId
    };

    console.log('Treatment data being sent to addTreatment:', treatment); // DEBUG LOG

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
        toast.error("Payment amount must be greater than zero.");
        return;
    }
    if (newAmountPaid > selectedTreatment.totalCost + 0.01) { // Allow for small floating point errors
        console.error("Payment amount exceeds outstanding balance.");
        toast.error("Payment amount exceeds outstanding balance.");
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
        toast.success('Payment recorded successfully!');
    } catch (error) {
        console.error("Failed to record payment:", error);
        toast.error('Failed to record payment.');
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

  const calculateTotalPaid = (patientId: string) => {
  return getPatientTreatments(patientId).reduce(
    (sum, treatment) => sum + treatment.amountPaid,
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-black">Patients</h1>
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
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
      </div>

      {/* Patient List Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No patients found</h3>
            <p className="text-gray-500">
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
              <thead className="bg-gray-50 text-gray-700 text-sm">
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
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map(patient => {
                  const totalOwed = calculateTotalOwed(patient.id);
                  const hasOutstandingBalance = totalOwed > 0.01;
                  return (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        {hasOutstandingBalance && (
                          <div className="flex items-center gap-1 text-xs text-error mt-1">
                            <AlertTriangle size={12} />
                            <span>Has outstanding balance</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{patient.age}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{patient.gender}</td>
                      <td className="px-6 py-4 text-gray-500">{patient.residence}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {patient.phone || patient.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const totalPaid = calculateTotalPaid(patient.id);
                          const totalOwed = calculateTotalOwed(patient.id);
                          const totalCost = totalPaid + totalOwed;

                          if (totalPaid === 0) {
                            return <span className="text-yellow-400 font-medium">Pending</span>;
                          } else if (totalPaid < totalCost) {
                            return (
                              <span className="text-orange-500 font-medium">
                                {/* Partial (K{formatMoney(totalPaid)} / K{formatMoney(totalCost)}) */}
                                Partial
                              </span>
                            );
                          } else {
                            return <span className="text-green-600 font-medium">Paid</span>;
                          }
                        })()}
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
                            className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                            title="Add Treatment"
                          >
                            <FileText size={18} />
                          </button>
                          {/* Edit Patient Button (existing) */}
                          <button
                            className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                            onClick={() => openEditModal(patient)}
                            title="Edit Patient"
                          >
                            <Edit size={18} />
                          </button>
                          {/* Delete Patient Button (existing) */}
                          <button
                            onClick={() => deletePatient(patient.id)}
                            className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
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
                            className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    {/* Main modal content container */}
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">Add New Patient</h2>
        <button
          onClick={() => setShowAddForm(false)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      {/* Modal Form Content */}
      <form onSubmit={handleSubmit} className="p-4 flex-grow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={patientData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={patientData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Residence
            </label>
            <input
              type="text"
              name="residence"
              value={patientData.residence}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={patientData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={patientData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      

      {/* Modal Footer */}
      <div className="mt-6 flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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

      {/* Edit Patient Modal */}
      {isEditOpen && editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Main modal content container with responsiveness */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">Edit Patient</h2>
              <button
                onClick={() => { setIsEditOpen(false); setEditingPatient(null); }}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Content - now scrolls if needed */}
            <form onSubmit={handleEditSubmit} className="p-4 flex-grow overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editingPatient.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={editingPatient.gender}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Residence
                  </label>
                  <input
                    type="text"
                    name="residence"
                    value={editingPatient.residence}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editingPatient.phone}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editingPatient.email}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => { setIsEditOpen(false); setEditingPatient(null); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
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


           {/* Add Treatment Modal */}
      {showTreatmentForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Add New Treatment</h2>
                <p className="text-sm text-gray-500">
                  Patient: {selectedPatient.name}
                </p>
              </div>
              <button
                onClick={() => setShowTreatmentForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTreatmentSubmit} className="p-4">
              <div className="space-y-6">
                {/* Basic Treatment Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment Date
                    </label>
                    <DatePicker
                      selected={treatmentData.date}
                      onChange={(date: Date) => setTreatmentData(prev => ({ ...prev, date: date || new Date() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      name="diagnosis"
                      value={treatmentData.diagnosis}
                      onChange={handleTreatmentInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={treatmentData.notes}
                      onChange={handleTreatmentInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                    ></textarea>
                  </div>
                </div>

                {/* Medications Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-md text-gray-800 mb-3">Medications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Medication
                      </label>
                      <select
                        name="id"
                        value={selectedMedication.id}
                        onChange={handleMedicationChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">-- Select --</option>
                        {inventoryItems
                          .filter(item => item.category === 'medication')
                          .map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.currentStock} {item.unit} left)
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={selectedMedication.quantity}
                        onChange={handleMedicationChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        name="dosage"
                        value={selectedMedication.dosage}
                        onChange={handleMedicationChange}
                        placeholder="e.g., 1 tablet twice daily"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="lg:col-span-3"> {/* Full width for instructions */}
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        name="instructions"
                        value={selectedMedication.instructions}
                        onChange={handleMedicationChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary-700 transition-colors text-sm"
                  >
                    Add Medication
                  </button>

                  {/* Display Added Medications */}
                  {treatmentData.medications.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Added Medications:</h4>
                      <ul className="space-y-2">
                        {treatmentData.medications.map((med, index) => (
                          <li key={med.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-800 text-sm">
                              {med.name} - {med.quantity} {med.quantity > 1 ? 'units' : 'unit'} ({med.dosage})
                            </span>
                            <button
                              type="button"
                              onClick={() => setTreatmentData(prev => ({
                                ...prev,
                                medications: prev.medications.filter((_, i) => i !== index)
                              }))}
                              className="text-error hover:text-red-700 p-1 rounded-full"
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Services Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-md text-gray-800 mb-3">Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={selectedService.name}
                        onChange={handleServiceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost (K)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        value={selectedService.cost}
                        onChange={handleServiceChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="md:col-span-2"> {/* Full width for description */}
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        name="description"
                        value={selectedService.description}
                        onChange={handleServiceChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      ></textarea>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary-700 transition-colors text-sm"
                  >
                    Add Service
                  </button>

                  {/* Display Added Services */}
                  {treatmentData.services.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Added Services:</h4>
                      <ul className="space-y-2">
                        {treatmentData.services.map((service, index) => (
                          <li key={service.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-800 text-sm">
                              {service.name} - K{(service.cost ?? 0).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTreatmentData(prev => ({
                                ...prev,
                                services: prev.services.filter((_, i) => i !== index)
                              }))}
                              className="text-error hover:text-red-700 p-1 rounded-full"
                            >
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTreatmentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Record Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


            {/* Patient Details Modal */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Patient Details: {selectedPatient.name}</h2>
              <button
                onClick={() => setShowPatientDetails(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-semibold">Name:</span> {selectedPatient.name}</p>
                    <p><span className="font-semibold">Age:</span> {selectedPatient.age}</p>
                    <p><span className="font-semibold">Gender:</span> {selectedPatient.gender}</p>
                    <p><span className="font-semibold">Residence:</span> {selectedPatient.residence}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Phone:</span> {selectedPatient.phone || 'N/A'}</p>
                    <p><span className="font-semibold">Email:</span> {selectedPatient.email || 'N/A'}</p>
                    <p><span className="font-semibold">Address:</span> {selectedPatient.address || 'N/A'}</p>
                  {(() => {
                        const totalPaid = calculateTotalPaid(selectedPatient.id);
                        const totalOwed = calculateTotalOwed(selectedPatient.id);
                        const totalCost = totalPaid + totalOwed;

                        let status: JSX.Element;
                        if (totalPaid === 0) {
                          status = <span className="text-yellow-400 font-medium">Pending </span>;
                        } else if (totalPaid < totalCost) {
                          status = (
                            <span className="text-orange-500 font-medium">
                              Partial
                            </span>
                          );
                        } else {
                          status = <span className="text-green-600 font-medium">Paid</span>;
                        }

                        return (
                          <p className="flex items-center gap-1">
                            <span className="font-semibold">Balance Status:</span>
                            {status}
                          </p>
                        );
                      })()}

                  </div>
                </div>
              </div>

              {/* Treatments History Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Treatment History</h3>
                {getPatientTreatments(selectedPatient.id).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No treatments recorded for this patient.</p>
                ) : (
                  <div className="space-y-4">
                    {getPatientTreatments(selectedPatient.id).map(treatment => (
                      <div key={treatment.id} className="bg-white rounded-md shadow-sm p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">{treatment.diagnosis}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(treatment.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-md font-bold text-primary">K{new Intl.NumberFormat().format(Number(treatment.totalCost.toFixed(2)))}</p>

                            <span className={`text-sm font-medium ${
                              treatment.paymentStatus === 'paid' ? 'text-green-600' :
                              treatment.paymentStatus === 'partial' ? 'text-orange-500' : 'text-error'
                            }`}>
                              {treatment.paymentStatus.charAt(0).toUpperCase() + treatment.paymentStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTreatment(treatment);
                              setShowRecordPayment(true);
                            }}
                            disabled={treatment.paymentStatus === 'paid'}
                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs flex items-center gap-1"
                          >
                            <CreditCard size={14} /> Record Payment
                          </button>
                          <button
                            onClick={() => setSelectedTreatment(treatment)} // Set selected treatment to show details
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs flex items-center gap-1"
                          >
                            <FileText size={14} /> View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowPatientDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Record Payment Modal */}
      {showRecordPayment && selectedTreatment && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Record Payment</h2>
              <button
                onClick={() => setShowRecordPayment(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700">
                      Patient: <span className="font-medium">{selectedPatient.name}</span>
                    </p>
                    <p className="text-gray-700">
                      Treatment for: <span className="font-medium">{selectedTreatment.diagnosis}</span>
                    </p>
                    <p className="text-gray-700">
                      Total Cost: 
                      <span className="font-medium">
                        K{new Intl.NumberFormat().format(Number(selectedTreatment.totalCost.toFixed(2)))}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Amount Paid: 
                      <span className="font-medium">
                        K{new Intl.NumberFormat().format(Number(selectedTreatment.amountPaid.toFixed(2)))}
                      </span>
                    </p>
                    <p className="text-gray-700 text-lg font-bold mt-2">
                      Outstanding: 
                      <span className="text-error">
                        K{new Intl.NumberFormat().format(
                          Number((selectedTreatment.totalCost - selectedTreatment.amountPaid).toFixed(2))
                        )}
                      </span>
                    </p>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount (K)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handlePaymentInputChange}
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <DatePicker
                    selected={paymentData.paymentDate}
                    onChange={(date: Date) => setPaymentData(prev => ({ ...prev, paymentDate: date || new Date() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecordPayment(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Treatment Details Modal (re-used from RecentTreatments, adapted for Patients page) */}
      {selectedTreatment && !showRecordPayment && ( // Only show if not recording payment
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Treatment Details</h2>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Patient Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    const patient = patients.find(p => p.id === selectedTreatment.patientId);
                    return patient ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{patient.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span>{patient.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="capitalize">{patient.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Residence:</span>
                          <span>{patient.residence}</span>
                        </div>
                        {patient.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Patient information not found</p>
                    );
                  })()}
                </div>
              </div>

              {/* Treatment Information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Treatment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{format(new Date(selectedTreatment.date), 'MMMM dd,yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diagnosis:</span>
                      <span className="font-medium">{selectedTreatment.diagnosis}</span>
                    </div>
                    {selectedTreatment.notes && (
                      <div>
                        <span className="text-gray-600 block mb-1">Notes:</span>
                        <p className="text-gray-800 bg-white p-2 rounded">{selectedTreatment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Prescribed Medications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedTreatment.medications.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTreatment.medications.map(medication => (
                        <div key={medication.id} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{medication.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {medication.quantity} units @ K{formatMoney((medication.unitCost ?? 0))} each
                              </p>
                              <p className="text-sm text-gray-600">Dosage: {medication.dosage}</p>
                              {medication.instructions && (
                                <p className="text-sm text-gray-600">
                                  Instructions: {medication.instructions}
                                </p>
                              )}
                            </div>
                            <span className="text-primary font-medium">
                              K{formatMoney(medication.totalCost ?? 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 text-sm font-medium">
                        <span>Total Medications Cost:</span>
                        <span>K{formatMoney(selectedTreatment.medications.reduce((sum, med) => sum + (med.totalCost ?? 0), 0))}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-2">No medications prescribed</p>
                  )}
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Services Provided</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedTreatment.services.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTreatment.services.map(service => (
                        <div key={service.id} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                              )}
                            </div>
                            <span className="text-secondary font-medium">
                              K{formatMoney(service.cost ?? 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 text-sm font-medium">
                        <span>Total Services Cost:</span>
                        <span>K{formatMoney(selectedTreatment.services.reduce((sum, service) => sum + (service.cost ?? 0), 0))}</span>

                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-2">No services provided</p>
                  )}
                </div>
              </div>

              {/* Total Cost */}
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Treatment Cost:</span>
                  <span className="text-xl font-bold text-primary">
                    K{formatMoney(selectedTreatment.totalCost ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedTreatment(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
