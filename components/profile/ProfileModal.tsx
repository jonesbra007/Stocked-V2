'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
    }
  }, [isOpen, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile(firstName.trim(), lastName.trim());
      onClose();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-md">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-color border border-border-color rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-color border border-border-color rounded-xl text-text-main focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border-color mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-semibold text-sm bg-hover-bg text-text-main hover:bg-border-color transition-colors active:scale-95"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full font-semibold text-sm bg-primary text-white hover:bg-primary-dark transition-colors active:scale-95"
            disabled={isSaving || !firstName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
