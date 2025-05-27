// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import { 
  Activity, 
  Users, 
  Package, 
  LineChart, 
  Settings, 
  Home,
  LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // Import supabase client

const Sidebar: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/patients', icon: <Users size={20} />, label: 'Patients' },
    { path: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { path: '/reports', icon: <LineChart size={20} />, label: 'Reports' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut(); // Call Supabase signOut
      if (error) {
        console.error('Error logging out:', error.message);
        // Optionally, show a toast notification for the error
        // toast.error('Failed to log out.');
      } else {
        // Redirect to the sign-in page after successful logout
        navigate('/signin'); 
      }
    } catch (error) {
      console.error('An unexpected error occurred during logout:', error);
      // toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="bg-primary h-screen w-64 fixed left-0 top-0 text-white flex flex-col transition-all duration-300 shadow-lg">
      <div className="p-6 flex items-center gap-3">
        <Activity size={30} className="text-secondary" />
        <h1 className="text-2xl font-bold">Canventory</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-6 py-3 transition-colors duration-200 ${
                    isActive 
                      ? 'bg-primary-700 border-r-4 border-secondary' 
                      : 'hover:bg-primary-700'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-primary-700">
        <button 
          onClick={handleLogout} // Attach the handleLogout function here
          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-200 w-full" // Added w-full for full width button
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
