'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthModal() {
  const { login, signup, resetPassword } = useAuth();
  
  const [isSignup, setIsSignup] = useState(false);
  const [isResetView, setIsResetView] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignup) {
        if (!firstName || !lastName) {
          throw new Error("Please enter your name.");
        }
        await signup(email, password, firstName, lastName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      alert("Password reset email sent!");
      setIsResetView(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] backdrop-blur-sm">
      <div className="bg-card-bg p-10 rounded-3xl w-[95%] max-w-[400px] shadow-soft-dark border border-border-color text-center relative">
        
        {!isResetView ? (
          <>
            <h2 className="font-serif text-3xl text-text-main mb-2 tracking-wide">
              {isSignup ? "Create Account" : "Welcome to Stocked"}
            </h2>
            <p className="text-text-light mb-6 text-sm">
              Login to save your recipes and plans.
            </p>
            
            {error && <div className="text-danger mt-4 mb-4 text-sm">{error}</div>}
            
            <form onSubmit={handleAuth} className="text-left">
              {isSignup && (
                <div className="flex gap-3 mb-5">
                  <div className="flex-1">
                    <label className="block mb-2 font-semibold text-xs uppercase text-text-light tracking-wide">First Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={isSignup}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 font-semibold text-xs uppercase text-text-light tracking-wide">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={isSignup}
                    />
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block mb-2 font-semibold text-xs uppercase text-text-light tracking-wide">Email</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-xs uppercase text-text-light tracking-wide">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full p-3 pr-10 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isSignup && (
                  <button 
                    type="button"
                    className="text-sm text-primary text-right block w-full mt-2 font-medium hover:underline"
                    onClick={() => setIsResetView(true)}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white border-none py-3 px-8 rounded-full font-semibold text-base hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(92,141,137,0.3)] transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Processing...' : (isSignup ? "Sign Up" : "Log In")}
              </button>
            </form>
            
            <button 
              className="mt-4 text-sm text-text-light hover:underline"
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
            >
              {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
          </>
        ) : (
          <>
            <h2 className="font-serif text-3xl text-text-main mb-2 tracking-wide">Reset Password</h2>
            <p className="text-text-light mb-6 text-sm">
              Enter your email to receive a secure password reset link.
            </p>
            
            {error && <div className="text-danger mt-4 mb-4 text-sm">{error}</div>}
            
            <form onSubmit={handlePasswordReset} className="text-left">
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-xs uppercase text-text-light tracking-wide">Email</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  className="w-full p-3 border border-border-color rounded-lg bg-input-bg font-sans text-text-main transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white border-none py-3 px-8 rounded-full font-semibold text-base hover:bg-primary-dark hover:shadow-[0_4px_12px_rgba(92,141,137,0.3)] transition-all disabled:opacity-70 mt-4"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <button 
              className="mt-4 text-sm text-text-light hover:underline"
              onClick={() => { setIsResetView(false); setError(''); }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
