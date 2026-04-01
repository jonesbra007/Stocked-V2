'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  Utensils, 
  MessageSquareMore, 
  Save, 
  Check,
  Users, 
  Settings, 
  Info, 
  Book, 
  User as UserIcon, 
  Moon, 
  Sun, 
  LogOut, 
  Trash2 
} from 'lucide-react';
import ProfileModal from '@/components/profile/ProfileModal';
import AskChefModal from '@/components/chef/AskChefModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTutorial } from '@/contexts/TutorialContext';

export default function TopNav() {
  const pathname = usePathname();
  const { profile, logout, deleteAccount } = useAuth();
  const { forceSave } = useData();
  const { startTutorial } = useTutorial();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAskChefOpen, setIsAskChefOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  // Handle clicking outside settings dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSettingsOpen(false);
    }, 500);
  };

  const handleDeleteAccount = async () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteAccount();
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        alert("For security, please log out and log back in before deleting your account.");
      } else {
        alert("Failed to delete account: " + e.message);
      }
    }
    setIsConfirmDeleteOpen(false);
  };

  const handleForceSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await forceSave();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to force save:", e);
      alert("Failed to save data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Planner', path: '/planner' },
    { name: 'Conversions', path: '/tools' },
  ];

  return (
    <nav className="sticky top-0 z-[100] flex justify-between items-center px-8 py-4 bg-nav-bg border-b border-black/5 backdrop-blur-md transition-colors duration-300">
      {/* Brand */}
      <div className="flex items-center gap-3 text-text-main font-serif text-[1.8rem] tracking-wide">
        <Utensils className="text-primary" size={24} />
        <span>Stocked</span>
      </div>

      {/* Desktop Center Tabs */}
      <div className="hidden md:flex gap-1 bg-hover-bg p-1 rounded-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              href={link.path}
              id={`tour-${link.name.toLowerCase()}`}
              className={`px-6 py-2.5 text-[0.9rem] font-semibold rounded-full transition-all duration-300 font-sans active:scale-95 ${
                isActive 
                  ? 'bg-card-bg text-text-main shadow-[0_2px_8px_rgba(0,0,0,0.05)]' 
                  : 'text-text-light hover:text-text-main'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 relative">
        <span className="hidden md:block font-semibold text-primary text-[0.95rem] mr-4">
          Hi, {profile?.firstName || 'Chef'}
        </span>

        <button 
          id="tour-ask-chef"
          onClick={() => setIsAskChefOpen(true)}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-text-light hover:text-primary hover:bg-hover-bg transition-colors" 
          title="Ask Chef"
        >
          <MessageSquareMore size={20} />
        </button>

        <div className="relative flex items-center">
          <button 
            onClick={handleForceSave}
            disabled={isSaving}
            className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-colors ${saveSuccess ? 'text-green-500 bg-green-500/10' : 'text-text-light hover:text-primary hover:bg-hover-bg'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`} 
            title="Force Save"
          >
            {saveSuccess ? <Check size={20} /> : <Save size={20} />}
          </button>
          
          {/* Save Confirmation Toast */}
          {saveSuccess && (
            <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-card-bg border border-border-color shadow-md rounded-lg px-3 py-1.5 text-sm text-text-main font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              All data saved!
            </div>
          )}
        </div>

        <Link href="/friends" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-text-light hover:text-primary hover:bg-hover-bg transition-colors" title="Friends">
          <Users size={20} />
        </Link>

        {/* Settings Dropdown */}
        <div 
          className="relative" 
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button 
            id="tour-settings"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              settingsOpen 
                ? 'text-primary bg-hover-bg shadow-[inset_0_0_0_1px_var(--primary)]' 
                : 'text-text-light hover:text-primary hover:bg-hover-bg'
            }`}
          >
            <Settings size={20} />
          </button>

          {settingsOpen && (
            <div className="absolute top-[120%] right-0 w-[180px] bg-card-bg border border-border-color rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { setSettingsOpen(false); startTutorial(); }}
                className="flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-text-main hover:bg-hover-bg hover:text-primary transition-colors text-left"
              >
                <Info size={16} /> Tutorial
              </button>
              <Link href="/cookbook" className="flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-text-main hover:bg-hover-bg hover:text-primary transition-colors text-left">
                <Book size={16} /> Book View
              </Link>
              <button 
                onClick={() => { setSettingsOpen(false); setIsProfileOpen(true); }}
                className="flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-text-main hover:bg-hover-bg hover:text-primary transition-colors text-left"
              >
                <UserIcon size={16} /> Profile
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-text-main hover:bg-hover-bg hover:text-primary transition-colors text-left justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Moon size={16} /> Dark Mode
                </div>
                {isDarkMode ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-text-light" />}
              </button>
              <button 
                onClick={logout}
                className="flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-text-main hover:bg-hover-bg hover:text-primary transition-colors text-left"
              >
                <LogOut size={16} /> Logout
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="flex items-center gap-2.5 px-4 py-3 text-[0.9rem] text-danger border-t border-border-color hover:bg-danger/10 transition-colors text-left"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      <AskChefModal 
        isOpen={isAskChefOpen} 
        onClose={() => setIsAskChefOpen(false)} 
      />

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost."
        confirmText="Delete Account"
        isDestructive={true}
        onConfirm={confirmDeleteAccount}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </nav>
  );
}
