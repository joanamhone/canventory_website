import React from 'react';
import { 
  Users, 
  Activity, 
  Package, 
  CreditCard 
} from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import RevenueChart from '../components/Dashboard/RevenueChart';
import InventoryStatus from '../components/Dashboard/InventoryStatus';
import RecentTreatments from '../components/Dashboard/RecentTreatments';
import { useAppContext } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { patients, treatments, inventoryItems } = useAppContext();
  
  // Calculate total revenue
  const totalRevenue = treatments.reduce((sum, treatment) => sum + treatment.totalCost, 0);
  
  // Calculate low stock items
  const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.reorderLevel);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Today: {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Patients" 
          value={patients.length} 
          icon={<Users size={20} className="text-white" />}
          change={8}
          color="primary"
        />
        <StatsCard 
          title="Active Treatments" 
          value={treatments.length} 
          icon={<Activity size={20} className="text-white" />}
          change={12}
          color="accent"
        />
        <StatsCard 
          title="Low Stock Items" 
          value={lowStockItems.length} 
          icon={<Package size={20} className="text-white" />}
          change={-3}
          color="warning"
        />
        <StatsCard 
          title="Revenue" 
          value={`${totalRevenue.toFixed(2)}`} 
          icon={<CreditCard size={20} className="text-white" />}
          change={15}
          color="secondary"
        />
      </div>
      
      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <InventoryStatus />
        </div>
      </div>
      
      {/* Recent Treatments */}
      <div>
        <RecentTreatments />
      </div>
    </div>
  );
};

export default Dashboard;