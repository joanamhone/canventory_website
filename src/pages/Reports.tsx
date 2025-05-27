import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Download,
  Calendar,
  ArrowRight,
  CreditCard,
  TrendingUp,
  Package,
  Users
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { addDays, subDays, format, differenceInDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Reports: React.FC = () => {
  // Destructure data from AppContext
  const { patients, treatments, inventoryItems, payments, inventoryTransactions } = useAppContext();

  // State for date range and report type
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reportType, setReportType] = useState<'financial' | 'inventory' | 'patient'>('financial');

  // Helper to ensure dates are treated as start/end of day for interval checks
  const getStartOfDay = (date: Date) => startOfDay(date);
  const getEndOfDay = (date: Date) => endOfDay(date);

  // --- Memoized Data Filtering and Aggregation ---

  // Filter payments and treatments based on the selected date range
  const filteredPayments = useMemo(() => {
    return payments.filter(payment =>
      isWithinInterval(new Date(payment.paymentDate), { start: getStartOfDay(startDate), end: getEndOfDay(endDate) })
    );
  }, [payments, startDate, endDate]);

  const filteredTreatments = useMemo(() => {
    const filtered = treatments.filter(treatment =>
      isWithinInterval(new Date(treatment.date), { start: getStartOfDay(startDate), end: getEndOfDay(endDate) })
    );
    // Log filtered treatments to inspect their content
    console.log('Filtered Treatments:', filtered);
    return filtered;
  }, [treatments, startDate, endDate]);

  const filteredInventoryTransactions = useMemo(() => {
    return inventoryTransactions.filter(transaction =>
      isWithinInterval(new Date(transaction.createdAt), { start: getStartOfDay(startDate), end: getEndOfDay(endDate) })
    );
  }, [inventoryTransactions, startDate, endDate]);

  // Financial Report Data
  const financialReportData = useMemo(() => {
    const dataMap: { [key: string]: { date: string; revenue: number; medication: number; services: number } } = {};

    // Initialize data points for each day in the range
    const numDays = differenceInDays(endDate, startDate) + 1;
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      const formattedDate = format(date, 'MMM dd');
      dataMap[formattedDate] = { date: formattedDate, revenue: 0, medication: 0, services: 0 };
    }

    // Aggregate payments for total revenue
    filteredPayments.forEach(payment => {
      const formattedDate = format(new Date(payment.paymentDate), 'MMM dd');
      if (dataMap[formattedDate]) {
        dataMap[formattedDate].revenue += payment.amount;
      }
    });

    // Aggregate treatment costs for medication and services revenue
    filteredTreatments.forEach(treatment => {
      const formattedDate = format(new Date(treatment.date), 'MMM dd');
      if (dataMap[formattedDate]) {
        // Ensure medications and services are arrays before reducing
        const medsCost = treatment.medications?.reduce((sum, med) => sum + (med.totalCost ?? 0), 0) || 0;
        const servicesCost = treatment.services?.reduce((sum, service) => sum + (service.cost ?? 0), 0) || 0;
        dataMap[formattedDate].medication += medsCost;
        dataMap[formattedDate].services += servicesCost;
      }
    });

    const aggregatedData = Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Log financial report data to inspect values
    console.log('Financial Report Data:', aggregatedData);
    return aggregatedData;
  }, [filteredPayments, filteredTreatments, startDate, endDate]);

  const revenueDistributionData = useMemo(() => {
    const totalMedicationRevenue = financialReportData.reduce((sum, item) => sum + item.medication, 0);
    const totalServicesRevenue = financialReportData.reduce((sum, item) => sum + item.services, 0);
    return [
      { name: 'Medication', value: totalMedicationRevenue },
      { name: 'Services', value: totalServicesRevenue }
    ];
  }, [financialReportData]);

  const topServicesByRevenueData = useMemo(() => {
    const serviceRevenueMap: { [key: string]: number } = {};
    filteredTreatments.forEach(treatment => {
      treatment.services?.forEach(service => {
        serviceRevenueMap[service.name] = (serviceRevenueMap[service.name] || 0) + service.cost;
      });
    });
    return Object.entries(serviceRevenueMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 services
  }, [filteredTreatments]);

  // Inventory Report Data
  const inventoryByCategoryData = useMemo(() => {
    const categoryValueMap: { [key: string]: number } = {};
    inventoryItems.forEach(item => {
      categoryValueMap[item.category] = (categoryValueMap[item.category] || 0) + (item.currentStock * item.unitCost);
    });
    return Object.entries(categoryValueMap).map(([name, value]) => ({ name, value }));
  }, [inventoryItems]);

  const topProductsByUsageData = useMemo(() => {
    const productUsageMap: { [key: string]: number } = {};
    filteredTreatments.forEach(treatment => {
      treatment.medications?.forEach(med => {
        productUsageMap[med.name] = (productUsageMap[med.name] || 0) + med.quantity;
      });
    });
    return Object.entries(productUsageMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 products
  }, [filteredTreatments]);

  const inventoryTransactionsTrendData = useMemo(() => {
    const dataMap: { [key: string]: { date: string; additions: number; deductions: number } } = {};

    const numDays = differenceInDays(endDate, startDate) + 1;
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      const formattedDate = format(date, 'MMM dd');
      dataMap[formattedDate] = { date: formattedDate, additions: 0, deductions: 0 };
    }

    filteredInventoryTransactions.forEach(transaction => {
      const formattedDate = format(new Date(transaction.createdAt), 'MMM dd');
      if (dataMap[formattedDate]) {
        if (transaction.type === 'addition') {
          dataMap[formattedDate].additions += transaction.quantity;
        } else if (transaction.type === 'deduction') {
          dataMap[formattedDate].deductions += transaction.quantity;
        }
      }
    });
    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredInventoryTransactions, startDate, endDate]);

  // Patient Report Data
  const patientDemographicsData = useMemo(() => {
    const genderCounts = { male: 0, female: 0, other: 0 };
    patients.forEach(patient => {
      if (patient.gender in genderCounts) {
        genderCounts[patient.gender as 'male' | 'female' | 'other']++;
      } else {
        genderCounts.other++;
      }
    });
    return Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const patientAgeDistributionData = useMemo(() => {
    const ageRanges = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0
    };
    patients.forEach(patient => {
      if (patient.age >= 0 && patient.age <= 18) ageRanges['0-18']++;
      else if (patient.age >= 19 && patient.age <= 35) ageRanges['19-35']++;
      else if (patient.age >= 36 && patient.age <= 50) ageRanges['36-50']++;
      else if (patient.age >= 51 && patient.age <= 65) ageRanges['51-65']++;
      else if (patient.age >= 65) ageRanges['65+']++;
    });
    return Object.entries(ageRanges).map(([name, value]) => ({ name, value }));
  }, [patients]);

  const patientVisitsTrendData = useMemo(() => {
    const dataMap: { [key: string]: { date: string; newPatients: number; returnPatients: number } } = {};
    const patientFirstVisit: { [patientId: string]: Date } = {};

    const numDays = differenceInDays(endDate, startDate) + 1;
    for (let i = 0; i < numDays; i++) {
      const date = addDays(startDate, i);
      const formattedDate = format(date, 'MMM dd');
      dataMap[formattedDate] = { date: formattedDate, newPatients: 0, returnPatients: 0 };
    }

    // Sort treatments by date to correctly identify first visits
    const sortedTreatments = [...filteredTreatments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTreatments.forEach(treatment => {
      const formattedDate = format(new Date(treatment.date), 'MMM dd');
      if (dataMap[formattedDate]) {
        if (!patientFirstVisit[treatment.patientId]) {
          // This is the first visit for this patient within the overall dataset
          patientFirstVisit[treatment.patientId] = new Date(treatment.date);
        }

        // Check if this is the first visit for this patient within the *current report's date range*
        // This is a simplified "new patient" for the report period.
        // A more robust check would involve looking at all treatments for the patient,
        // even those outside the current report range, to determine if they are truly new.
        const isNewPatientInPeriod = isWithinInterval(new Date(treatment.date), { start: getStartOfDay(startDate), end: getEndOfDay(endDate) }) &&
                                     patientFirstVisit[treatment.patientId].getTime() === new Date(treatment.date).getTime();

        if (isNewPatientInPeriod) {
          dataMap[formattedDate].newPatients++;
        } else {
          dataMap[formattedDate].returnPatients++;
        }
      }
    });

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTreatments, patients, startDate, endDate]);


  // Calculate summary metrics using the actual data
  const totalRevenue = financialReportData.reduce((sum, item) => sum + item.revenue, 0);
  const days = differenceInDays(endDate, startDate) + 1; // Ensure at least 1 day
  const avgDailyRevenue = totalRevenue / (days || 1);
  const totalPatients = patients.length; // Total registered patients
  const activePatientsInPeriod = new Set(filteredTreatments.map(t => t.patientId)).size; // Unique patients with treatments in period
  const inventoryValue = inventoryItems.reduce(
    (sum, item) => sum + (item.currentStock * item.unitCost),
    0
  );

  // Colors for the charts
  const COLORS = ['#42052d', '#6c5dd3', '#ffa84a', '#4CAF50', '#F44336', '#8884d8', '#82ca9d', '#ffc658']; // Expanded colors

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-600">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              <span className="font-semibold">{entry.name}:</span> {
                entry.name.includes('Revenue') || entry.name.includes('Value') || entry.name.includes('Cost')
                  ? `K${entry.value.toFixed(2)}`
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-2 shadow-sm">
            <Calendar size={16} className="text-gray-500" />
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border-0 focus:outline-none text-sm w-28"
              dateFormat="MMM dd,yyyy"
            />
            <ArrowRight size={16} className="text-gray-500" />
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="border-0 focus:outline-none text-sm w-28"
              dateFormat="MMM dd,yyyy"
            />
          </div>

          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
        <button
          onClick={() => setReportType('financial')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            reportType === 'financial'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Financial Reports
        </button>
        <button
          onClick={() => setReportType('inventory')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            reportType === 'inventory'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Inventory Reports
        </button>
        <button
          onClick={() => setReportType('patient')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            reportType === 'patient'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Patient Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-2">K{totalRevenue.toFixed(2)}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd,yyyy')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary text-white">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg. Daily Revenue</p>
              <h3 className="text-2xl font-bold mt-2">K{avgDailyRevenue.toFixed(2)}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Per day over {days} days
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent text-white">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {reportType === 'financial' && 'Active Patients'}
                {reportType === 'inventory' && 'Total Inventory Value'}
                {reportType === 'patient' && 'Total Registered Patients'}
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {reportType === 'financial' && activePatientsInPeriod}
                {reportType === 'inventory' && `K${inventoryValue.toFixed(2)}`}
                {reportType === 'patient' && totalPatients}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {reportType === 'financial' && 'With treatments in period'}
                {reportType === 'inventory' && `${inventoryItems.length} unique items`}
                {reportType === 'patient' && 'Across all time'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary text-white">
              {reportType === 'financial' && <Users size={20} />}
              {reportType === 'inventory' && <Package size={20} />}
              {reportType === 'patient' && <Users size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {reportType === 'financial' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg">Revenue Trend</h3>
            </div>
            <div className="p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={financialReportData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#f0f0f0' }}
                  />
                  <YAxis
                    tickFormatter={(value) => `K${value}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS[0]}
                    name="Total Revenue"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="medication"
                    stroke={COLORS[1]}
                    name="Medication Revenue"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="services"
                    stroke={COLORS[2]}
                    name="Services Revenue"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg">Revenue Distribution</h3>
              </div>
              <div className="p-4 h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueDistributionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `K${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg">Top Services by Revenue</h3>
              </div>
              <div className="p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topServicesByRevenueData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `K${value}`} />
                    <Tooltip formatter={(value: number) => `K${value.toFixed(2)}`} />
                    <Bar dataKey="value" name="Revenue" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg">Inventory by Category (Value)</h3>
              </div>
              <div className="p-4 h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryByCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryByCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `K${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg">Top Products by Usage (Quantity)</h3>
              </div>
              <div className="p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsByUsageData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" name="Units Used" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg">Inventory Transactions Trend</h3>
            </div>
            <div className="p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={inventoryTransactionsTrendData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="additions"
                    stroke={COLORS[3]}
                    name="Additions"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deductions"
                    stroke={COLORS[4]}
                    name="Deductions"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {reportType === 'patient' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg">Patient Demographics (Gender)</h3>
              </div>
              <div className="p-4 h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patientDemographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {patientDemographicsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-lg">Patient Age Distribution</h3>
              </div>
              <div className="p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={patientAgeDistributionData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Patients" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-lg">Patient Visits Trend</h3>
            </div>
            <div className="p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={patientVisitsTrendData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newPatients"
                    stroke={COLORS[0]}
                    name="New Patients"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="returnPatients"
                    stroke={COLORS[2]}
                    name="Return Patients"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
