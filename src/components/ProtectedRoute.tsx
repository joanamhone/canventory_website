// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext'; // Ensure this path is correct based on your file structure

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
  // If 'user' exists, render the protected content (Outlet).
  // Otherwise, navigate the user to the sign-in page.
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
