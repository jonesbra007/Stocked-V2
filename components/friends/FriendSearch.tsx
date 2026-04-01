'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Search, UserPlus } from 'lucide-react';

export default function FriendSearch({ onFriendAdded }: { onFriendAdded: () => void }) {
  const { user } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !searchEmail.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const emailLower = searchEmail.trim().toLowerCase();
      
      if (emailLower === user.email?.toLowerCase()) {
        setError("You can't add yourself as a friend.");
        setLoading(false);
        return;
      }

      const lookupRef = doc(db, 'user_lookup', emailLower);
      const lookupSnap = await getDoc(lookupRef);

      if (!lookupSnap.exists()) {
        setError('User not found with that email address.');
        setLoading(false);
        return;
      }

      const friendData = lookupSnap.data();

      // Add to current user's following
      await setDoc(doc(db, 'users', user.uid, 'following', friendData.uid), {
        uid: friendData.uid,
        email: friendData.email,
        firstName: friendData.firstName,
        lastName: friendData.lastName,
        addedAt: new Date().toISOString()
      });

      // Add to friend's followers
      await setDoc(doc(db, 'users', friendData.uid, 'followers', user.uid), {
        uid: user.uid,
        email: user.email,
        addedAt: new Date().toISOString()
      });

      setSuccess(`Added ${friendData.firstName} ${friendData.lastName} to your friends!`);
      setSearchEmail('');
      onFriendAdded();
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while adding the friend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card-bg p-6 rounded-2xl shadow-soft border border-border-color mb-8">
      <h2 className="font-serif text-2xl text-text-main mb-4">Add a Friend</h2>
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={18} />
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Friend's email address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-color bg-slot-bg text-text-main focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <UserPlus size={18} />
          {loading ? 'Adding...' : 'Add Friend'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      {success && <p className="text-primary text-sm mt-3">{success}</p>}
    </div>
  );
}
