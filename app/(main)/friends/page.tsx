'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Friend } from '@/types';
import FriendSearch from '@/components/friends/FriendSearch';
import FriendCookbook from '@/components/friends/FriendCookbook';
import { Users, BookOpen } from 'lucide-react';

export default function FriendsPage() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const fetchFollowing = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'following'));
      const friends: Friend[] = [];
      snapshot.forEach(doc => {
        friends.push(doc.data() as Friend);
      });
      setFollowing(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, [user]);

  if (selectedFriend) {
    return <FriendCookbook friend={selectedFriend} onBack={() => setSelectedFriend(null)} />;
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
        <h1 className="font-serif text-3xl text-text-main">
          Friends
        </h1>
      </div>

      <FriendSearch onFriendAdded={fetchFollowing} />

      <div className="bg-card-bg p-6 rounded-2xl shadow-soft border border-border-color">
        <h2 className="font-serif text-2xl text-text-main mb-6 flex items-center gap-2">
          <Users size={24} className="text-primary" /> My Friends
        </h2>

        {loading ? (
          <div className="text-center py-8 text-text-light">Loading friends...</div>
        ) : following.length === 0 ? (
          <div className="text-center py-12 text-text-light border border-dashed border-border-color rounded-xl">
            You haven&apos;t added any friends yet. Search by email above to find them!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {following.map(friend => (
              <div 
                key={friend.uid}
                className="flex items-center justify-between p-4 rounded-xl border border-border-color hover:border-primary transition-colors bg-slot-bg"
              >
                <div>
                  <h3 className="font-semibold text-text-main">{friend.firstName} {friend.lastName}</h3>
                  <p className="text-sm text-text-light">{friend.email}</p>
                </div>
                <button
                  onClick={() => setSelectedFriend(friend)}
                  className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
                  title="View Cookbook"
                >
                  <BookOpen size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
