// src/pages/Auth/SignUp.tsx

import React, { useState } from 'react';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import toast from 'react-hot-toast'; // Import toast for notifications

import { supabase } from '../../lib/supabaseClient'; // Adjust path if necessary for your file structure

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name, // Store full name in user_metadata
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success('Sign up successful! Please check your email to confirm your account.');
        // Optionally redirect to a page indicating email confirmation is needed
        navigate('/signin'); // Redirect to sign-in page after successful signup
      } else {
        // This case can happen if email confirmation is enabled and the user
        // needs to confirm their email before data.user is fully populated.
        toast.success('Sign up successful! Check your email for a confirmation link.');
        navigate('/signin'); // Redirect to sign-in page
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred during sign up.');
      console.error('Sign Up Error:', error);
    } finally {
      setLoading(false); // Set loading to false
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
          <p className="text-primary-200 mt-2">Create your account</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Enter your name"
                  required
                />
                <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

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
                  placeholder="Create a password"
                  required
                />
                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Confirm your password"
                  required
                />
                <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:text-primary-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading} // Disable button when loading
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 group"
            >
              {loading ? 'Creating Account...' : 'Create Account'} {/* Change button text */}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-primary hover:text-primary-700"
              >
                Sign in instead
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

export default SignUp;
