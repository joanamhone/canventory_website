import React, { useState, ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Handle responsive sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      // On larger screens (lg and up), sidebar is always open by default
      // On smaller screens, it starts closed and acts as a drawer
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Now always fixed, and uses transform for drawer effect */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-primary text-white z-50
          transition-transform duration-300 ease-in-out shadow-lg
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-none
        `}
      >
        <Sidebar />
      </div>

      {/* Overlay for mobile sidebar when open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content wrapper - Adjusts margin based on sidebar state */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        `}
      >
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Main content area - Padded for header and has its own scroll */}
        <main className="flex-1 p-6 mt-16 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Toast container */}
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
