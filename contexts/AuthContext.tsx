'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (e: string, p: string) => Promise<void>;
  signup: (e: string, p: string, f: string, l: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  updateProfile: (f: string, l: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profSnap = await getDoc(doc(db, 'users', currentUser.uid, 'profile', 'info'));
          if (profSnap.exists()) {
            setProfile(profSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, first: string, last: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const profileData: UserProfile = {
      uid: cred.user.uid,
      firstName: first,
      lastName: last,
      email: cred.user.email!,
      searchable: true
    };
    // Save to users/{uid} for querying
    await setDoc(doc(db, "users", cred.user.uid), { 
      email: cred.user.email!,
      firstName: first,
      lastName: last,
      uid: cred.user.uid
    }, { merge: true });
    
    await setDoc(doc(db, "users", cred.user.uid, "profile", "info"), profileData);

    // Save to user_lookup
    try {
      await setDoc(doc(db, "user_lookup", cred.user.email!.toLowerCase()), {
        uid: cred.user.uid,
        email: cred.user.email!,
        firstName: first,
        lastName: last
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `user_lookup/${cred.user.email!.toLowerCase()}`);
    }

    setProfile(profileData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!user || !profile) return;
    const updatedProfile = { ...profile, firstName, lastName };
    
    try {
      // Update the root user document
      try {
        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }

      // Update the profile/info document
      try {
        await setDoc(doc(db, "users", user.uid, "profile", "info"), {
          firstName,
          lastName
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/profile/info`);
      }
      
      // Update user_lookup
      if (user.email) {
        try {
          await setDoc(doc(db, "user_lookup", user.email.toLowerCase()), {
            uid: user.uid,
            email: user.email,
            firstName,
            lastName
          }, { merge: true });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `user_lookup/${user.email.toLowerCase()}`);
        }
      }

      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    await firebaseDeleteUser(user);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, login, signup, logout, resetPassword, updateProfile, deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
