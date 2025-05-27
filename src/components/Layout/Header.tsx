import React, { useState } from 'react';
import { Bell, Search, Menu, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { stockAlerts, markAlertAsRead, user } = useAppContext(); // Get user from context
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadAlerts = stockAlerts.filter(alert => !alert.isRead);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = (id: string) => {
    markAlertAsRead(id, 'stock'); 
  };

  // Function to get user initials
  const getUserInitials = () => {
    if (user && user.user_metadata && user.user_metadata.full_name) {
      const fullName = user.user_metadata.full_name as string;
      const names = fullName.split(' ').filter(n => n.length > 0);
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      } else if (names.length > 1) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
    }
    return 'AD'; // Default initials if name not available
  };

  // Function to get user display name
  const getUserDisplayName = () => {
    if (user && user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata.full_name as string;
    }
    return 'Admin User'; // Default display name
  };

  return (
    <header className={`bg-white h-16 fixed top-0 right-0 left-0 z-10 flex items-center justify-between px-6 shadow-sm transition-all duration-300 ${isSidebarOpen ? 'lg:left-64' : ''}`}>
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 mr-4 lg:hidden"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 w-64"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <Bell size={20} />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-0 right-0 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold">Notifications</h3>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {unreadAlerts.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">No new notifications</div>
                ) : (
                  unreadAlerts.map(alert => (
                    <div key={alert.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <p className="text-sm text-error font-medium">{alert.type === 'low' ? 'Low Stock Alert' : 'Alert'}</p>
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="text-xs text-gray-500 hover:text-primary"
                        >
                          Mark as read
                        </button>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-gray-200">
                <button className="text-sm text-primary hover:text-primary-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary font-medium">
            {getUserInitials()} {/* Display user initials here */}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{getUserDisplayName()}</p> {/* Display user full name here */}
            <p className="text-xs text-gray-500">Administrator</p> {/* This role is static for now */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
