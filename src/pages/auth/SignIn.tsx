// src/pages/auth/SignIn.tsx

import React, { useState } from 'react';
import { Activity, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient'; // Centralized Supabase client import

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Specific error handling for "Email not confirmed"
        if (error.message === 'Email not confirmed') {
          toast.error('Please check your email to confirm your account first.');
        } else {
          toast.error(error.message || 'An unexpected error occurred during sign in.');
        }
        throw error; // Still throw to log the full error for debugging
      }

      if (data.user) {
        toast.success('Logged in successfully!');
        navigate('/'); // CORRECTED: Navigate to the root path which is handled by ProtectedRoute to show Dashboard
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Sign In Error:', error);
      // The toast.error is already handled inside the try block for specific messages.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <Activity size={40} className="text-secondary" />
            <h1 className="text-3xl font-bold text-white">Canventory</h1>
          </div>
          <p className="text-primary-200 mt-2">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Enter your email"
                  required
                />
                <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Enter your password"
                  required
                />
                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 group"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-primary-700"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-primary-200">
          &copy; {new Date().getFullYear()} Canventory. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SignIn;
