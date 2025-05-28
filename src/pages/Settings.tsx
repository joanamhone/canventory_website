import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const Settings: React.FC = () => {
  const { user } = useAppContext();

  const [activeTab, setActiveTab] = useState('general'); // Keep a dummy tab for structure

  // Removed all local settings states for clinic, notifications, inventory, account password

  // Removed all useEffects related to settings

  // Removed all handle functions related to settings
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully!');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to log out.');
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Sidebar - Minimal version */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 border-r border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Settings
            </h3>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('general')} // Keep one tab for structure
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                  activeTab === 'general'
                    ? 'bg-primary-100 text-primary dark:bg-primary-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <SettingsIcon size={18} className="mr-3" />
                General
              </button>
              {/* Removed other tab buttons */}
            </nav>
          </div>
          
          {/* Content - Display message that settings are removed */}
          <div className="col-span-3 p-6 dark:text-white">
            {activeTab === 'general' && (
              <div className="text-center py-10">
                <X size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
           
                </p>

                {/* Account Section (minimal) */}
                <div className="space-y-6 max-w-md mx-auto mt-8">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={user?.user_metadata?.full_name || 'N/A'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || 'N/A'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                      disabled
                    />
                  </div>
                  
                  {/* Password change form (retained for user account management) */}
                  {/* Re-adding password change form, ensuring it's self-contained */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // Dummy password change logic since AppContext no longer handles it
                    toast.error('Password change functionality is currently disabled.');
                  }} className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      Change Password (Disabled)
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value="" // Always empty as it's not handled
                        onChange={() => {}} // No-op
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                        disabled // Disable input
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value="" // Always empty as it's not handled
                        onChange={() => {}} // No-op
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                        disabled // Disable input
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value="" // Always empty as it's not handled
                        onChange={() => {}} // No-op
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                        disabled // Disable input
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed flex items-center gap-2"
                        disabled // Disable button
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 border border-error text-error rounded-md hover:bg-error/5 transition-colors flex items-center gap-2"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Removed other activeTab content blocks */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
