// src/components/Dashboard/RecentTreatments.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { Treatment } from '../../types/patient';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const RecentTreatments: React.FC = () => {
  const { treatments, patients } = useAppContext();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  // Sort treatments by date (newest first) and take the first 5
  const recentTreatments = [...treatments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Find patient name by ID
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  // Get patient details
  const getPatientDetails = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  // Calculate total medications cost
  const getMedicationsCost = (treatment: Treatment) => {
    // Ensure medication.totalCost is a number, default to 0 if undefined/null
    return treatment.medications.reduce((sum, med) => sum + (med.totalCost ?? 0), 0);
  };

  // Calculate total services cost
  const getServicesCost = (treatment: Treatment) => {
    // Ensure service.cost is a number, default to 0 if undefined/null
    return treatment.services.reduce((sum, service) => sum + (service.cost ?? 0), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-lg">Recent Treatments</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {recentTreatments.length === 0 ? (
          <div className="p-6 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No treatments recorded yet</p>
          </div>
        ) : (
          recentTreatments.map(treatment => (
            <div
              key={treatment.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedTreatment(treatment)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">{getPatientName(treatment.patientId)}</h4>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(treatment.date), 'MMM dd,yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{treatment.diagnosis}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {treatment.medications.length} Medication{treatment.medications.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                      {/* Changed $ to K */}
                      K{(treatment.totalCost ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => navigate('/patients')} // Navigate to the patients page
          className="text-sm text-primary hover:text-primary-700 font-medium"
        >
          View All Treatments
        </button>
      </div>

      {/* Treatment Details Modal */}
      {selectedTreatment && (
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
                    const patient = getPatientDetails(selectedTreatment.patientId);
                    return patient ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">
                            <button
                              onClick={() => {
                                setSelectedTreatment(null); // Close current modal
                                navigate(`/patients?selectedPatientId=${patient.id}`); // Navigate to patient details
                              }}
                              className="text-primary hover:underline"
                            >
                              {patient.name}
                            </button>
                          </span>
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
                      {/* Added nullish coalescing operator ?? new Date() */}
                      <span>{format(new Date(selectedTreatment.date ?? new Date()), 'MMMM dd,yyyy')}</span>
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
                                {medication.quantity} units @ K{(medication.unitCost ?? 0).toFixed(2)} each {/* Changed $ to K */}
                              </p>
                              <p className="text-sm text-gray-600">Dosage: {medication.dosage}</p>
                              {medication.instructions && (
                                <p className="text-sm text-gray-600">
                                  Instructions: {medication.instructions}
                                </p>
                              )}
                            </div>
                            <span className="text-primary font-medium">
                              {/* Changed $ to K */}
                              K{(medication.totalCost ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 text-sm font-medium">
                        <span>Total Medications Cost:</span>
                        {/* Changed $ to K */}
                        <span>K{(getMedicationsCost(selectedTreatment) ?? 0).toFixed(2)}</span>
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
                              {/* Changed $ to K */}
                              K{(service.cost ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 text-sm font-medium">
                        <span>Total Services Cost:</span>
                        {/* Changed $ to K */}
                        <span>K{(getServicesCost(selectedTreatment) ?? 0).toFixed(2)}</span>
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
                    {/* Changed $ to K */}
                    K{(selectedTreatment.totalCost ?? 0).toFixed(2)}
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

export default RecentTreatments;
