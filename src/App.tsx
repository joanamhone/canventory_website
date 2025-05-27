import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout/Layout'; // Assuming Layout component exists and renders <Outlet /> for its children
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SignIn from './pages/auth/SignIn'; // Correct import path for SignIn
import SignUp from './pages/auth/SignUp'; // Correct import path for SignUp
import { AppProvider, useAppContext } from './context/AppContext'; // Import useAppContext
import { ThemeProvider } from './context/Themecontext.tsx';
import { Toaster } from 'react-hot-toast'; // Import Toaster for global notifications

// ProtectedRoute component to handle authentication checks
const ProtectedRoute: React.FC = () => {
  // Destructure user and authLoading from your AppContext
  const { user, authLoading } = useAppContext();

  // 1. If authentication state is still loading, show a loading message.
  // This is crucial to prevent a momentary redirect to the sign-in page
  // before Supabase has had a chance to rehydrate the user's session from local storage.
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading application...</p>
      </div>
    );
  }

  // 2. Once authLoading is false (meaning Supabase has finished checking for a session),
  // then check if the user is authenticated.
  // If 'user' exists, render the Layout component which will then render nested routes via <Outlet />
  // Otherwise, navigate the user to the sign-in page.
  return user ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/signin" replace />
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppProvider> {/* AppProvider must wrap components that use its context */}
        <Router>
          <Toaster position="top-right" reverseOrder={false} /> {/* Global toaster for notifications */}
          <Routes>
            {/* Public Auth Routes */}
            <Route 
              path="/signin" 
              element={<SignIn />} 
            />
            <Route 
              path="/signup" 
              element={<SignUp />} 
            />
            {/* Add other public routes like /forgot-password, /terms, /privacy here */}
            <Route path="/forgot-password" element={<div>Forgot Password Page (Implement this)</div>} />
            <Route path="/terms" element={<div>Terms of Service Page (Implement this)</div>} />
            <Route path="/privacy" element={<div>Privacy Policy Page (Implement this)</div>} />

            {/* Protected Routes - only accessible if authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback Route: Redirects to sign-in if no other route matches.
                ProtectedRoute handles authenticated users redirecting to "/". */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
