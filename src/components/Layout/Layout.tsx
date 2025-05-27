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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        <Sidebar />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        <main className={`flex-1 p-6 mt-16 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>
      
      {/* Toast container */}
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;