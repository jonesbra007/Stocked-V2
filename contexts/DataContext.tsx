'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Recipe, Category, InventoryItem, GroceryItem, MealPlan, UserProfile } from '@/types';

const DEFAULT_CATEGORIES: Category[] = [
  { name: "Italian", color: "#E74C3C" }, 
  { name: "Mexican", color: "#2ECC71" }, 
  { name: "Asian", color: "#E67E22" },    
  { name: "American", color: "#3498DB" },
  { name: "Healthy", color: "#A2D729" }, 
  { name: "Breakfast", color: "#F1C40F"},
  { name: "Dessert", color: "#E91E63" }, 
  { name: "Other", color: "#34495E" }     
];

interface DataContextType {
  recipes: Recipe[];
  appCategories: Category[];
  inventory: InventoryItem[];
  manualGrocery: GroceryItem[];
  groceryOverrides: Record<string, string>;
  mealPlan: MealPlan;
  friends: UserProfile[];
  followers: UserProfile[];
  loadingData: boolean;
  
  saveRecipe: (recipe: Omit<Recipe, 'id'>, id?: string) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  
  saveCategories: (categories: Category[]) => Promise<void>;
  saveInventory: (items: InventoryItem[]) => Promise<void>;
  saveManualGrocery: (items: GroceryItem[]) => Promise<void>;
  saveGroceryOverrides: (overrides: Record<string, string>) => Promise<void>;
  
  cookingRecipeId: string | null;
  setCookingRecipeId: (id: string | null) => void;
  
  saveMealPlan: (plan: MealPlan) => Promise<void>;
  clearWeeklyPlan: (week: number) => Promise<void>; // 0 for current, 1 for next
  
  addFriend: (email: string) => Promise<void>;
  removeFriend: (targetUid: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  forceSave: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [appCategories, setAppCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [manualGrocery, setManualGrocery] = useState<GroceryItem[]>([]);
  const [groceryOverrides, setGroceryOverrides] = useState<Record<string, string>>({});
  const [cookingRecipeId, setCookingRecipeId] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setAppCategories(DEFAULT_CATEGORIES);
      setInventory([]);
      setManualGrocery([]);
      setGroceryOverrides({});
      setMealPlan({});
      setFriends([]);
      setFollowers([]);
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch Categories
        const catSnap = await getDoc(doc(db, "users", user.uid, "data", "categories"));
        if (catSnap.exists()) setAppCategories(catSnap.data().list || DEFAULT_CATEGORIES);

        // Fetch Recipes
        const q = query(collection(db, "users", user.uid, "recipes"));
        const querySnapshot = await getDocs(q);
        const fetchedRecipes: Recipe[] = [];
        querySnapshot.forEach((doc) => { fetchedRecipes.push({ id: doc.id, ...doc.data() } as Recipe); });
        setRecipes(fetchedRecipes);

        // Fetch Inventory
        const invSnap = await getDoc(doc(db, "users", user.uid, "data", "inventory"));
        if (invSnap.exists()) setInventory(invSnap.data().items || []);

        // Fetch Manual Grocery
        const grocSnap = await getDoc(doc(db, "users", user.uid, "data", "grocery"));
        if (grocSnap.exists()) setManualGrocery(grocSnap.data().items || []);

        // Fetch Grocery Overrides
        const overridesSnap = await getDoc(doc(db, "users", user.uid, "data", "grocery_overrides"));
        if (overridesSnap.exists()) setGroceryOverrides(overridesSnap.data().map || {});

        // Fetch Meal Plan
        const planSnap = await getDoc(doc(db, "users", user.uid, "data", "plan"));
        if (planSnap.exists()) setMealPlan(planSnap.data() as MealPlan);

        // Fetch Friends & Followers
        await refreshFriends();

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setLoadingData(false);
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const refreshFriends = async () => {
    if (!user) return;
    try {
      const followsSnap = await getDocs(collection(db, "users", user.uid, "following"));
      const fetchedFriends: UserProfile[] = [];
      followsSnap.forEach(d => fetchedFriends.push({ uid: d.id, ...d.data() } as UserProfile));
      setFriends(fetchedFriends);

      const followersSnap = await getDocs(collection(db, "users", user.uid, "followers"));
      const fetchedFollowers: UserProfile[] = [];
      followersSnap.forEach(d => fetchedFollowers.push({ uid: d.id, ...d.data() } as UserProfile));
      setFollowers(fetchedFollowers);
    } catch (e) {
      console.error("Error fetching friends:", e);
    }
  };

  const saveRecipe = async (recipeData: Omit<Recipe, 'id'>, id?: string) => {
    if (!user) return;
    if (id) {
      await setDoc(doc(db, "users", user.uid, "recipes", id), recipeData, { merge: true });
      setRecipes(prev => prev.map(r => r.id === id ? { id, ...recipeData } as Recipe : r));
    } else {
      const ref = await addDoc(collection(db, "users", user.uid, "recipes"), recipeData);
      setRecipes(prev => [...prev, { id: ref.id, ...recipeData } as Recipe]);
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "recipes", id));
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const toggleFavorite = async (id: string) => {
    if (!user) return;
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    const newFav = !recipe.favorite;
    await setDoc(doc(db, "users", user.uid, "recipes", id), { favorite: newFav }, { merge: true });
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, favorite: newFav } : r));
  };

  const saveCategories = async (categories: Category[]) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "categories"), { list: categories });
    setAppCategories(categories);
  };

  const saveInventory = async (items: InventoryItem[]) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "inventory"), { items });
    setInventory(items);
  };

  const saveManualGrocery = async (items: GroceryItem[]) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "grocery"), { items });
    setManualGrocery(items);
  };

  const saveGroceryOverrides = async (overrides: Record<string, string>) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "grocery_overrides"), { map: overrides });
    setGroceryOverrides(overrides);
  };

  const saveMealPlan = async (plan: MealPlan) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "data", "plan"), plan);
    setMealPlan(plan);
  };

  const forceSave = async () => {
    if (!user) return;
    
    // Save all current state to Firestore
    await Promise.all([
      setDoc(doc(db, "users", user.uid, "data", "categories"), { list: appCategories }),
      setDoc(doc(db, "users", user.uid, "data", "inventory"), { items: inventory }),
      setDoc(doc(db, "users", user.uid, "data", "grocery"), { items: manualGrocery }),
      setDoc(doc(db, "users", user.uid, "data", "grocery_overrides"), { map: groceryOverrides }),
      setDoc(doc(db, "users", user.uid, "data", "plan"), mealPlan),
    ]);
  };

  const clearWeeklyPlan = async (week: number) => {
    if (!user) return;
    const prefix = week === 1 ? 'next_' : '';
    const newPlan = { ...mealPlan };
    
    Object.keys(newPlan).forEach(k => {
      const isNext = k.startsWith('next_');
      if ((week === 0 && !isNext) || (week === 1 && isNext)) {
        delete newPlan[k];
      }
    });

    await saveMealPlan(newPlan);
  };

  const addFriend = async (email: string) => {
    if (!user || !profile) throw new Error("Not authenticated");
    
    try {
      // Query the users collection for the email
      const usersRef = collection(db, "users");
      
      // Try exact lowercase match first
      let q = query(usersRef, where("email", "==", email.toLowerCase()));
      let querySnapshot = await getDocs(q);

      // Try exact typed match
      if (querySnapshot.empty) {
        q = query(usersRef, where("email", "==", email));
        querySnapshot = await getDocs(q);
      }

      let targetUserDoc = null;

      if (!querySnapshot.empty) {
        targetUserDoc = querySnapshot.docs[0];
      } else {
        // Fallback: fetch all users and filter manually for case-insensitivity
        // (Useful for existing users who signed up before we enforced lowercase emails)
        const allUsersSnapshot = await getDocs(usersRef);
        for (const docSnap of allUsersSnapshot.docs) {
          const data = docSnap.data();
          if (data.email && data.email.toLowerCase() === email.toLowerCase()) {
            targetUserDoc = docSnap;
            break;
          }
        }
      }

      if (!targetUserDoc) {
        throw new Error("User not found or hasn't saved profile.");
      }

      const targetData = targetUserDoc.data() as UserProfile;
      const targetUid = targetUserDoc.id;

      // Add to CURRENT USER'S 'following' list
      const followingData = {
        uid: targetUid,
        firstName: targetData.firstName || '',
        lastName: targetData.lastName || '',
        email: targetData.email || email
      };
      await setDoc(doc(db, "users", user.uid, "following", targetUid), followingData);

      await refreshFriends();
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        throw new Error("Permission denied. Please update your Firebase Security Rules to allow reading user profiles. Add this rule: match /users/{userId} { allow read: if request.auth != null; }");
      }
      throw error;
    }
  };

  const removeFriend = async (targetUid: string) => {
    if (!user) throw new Error("Not authenticated");
    try {
      await deleteDoc(doc(db, "users", user.uid, "following", targetUid));
      await refreshFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      recipes, appCategories, inventory, manualGrocery, groceryOverrides, mealPlan, friends, followers, loadingData,
      saveRecipe, deleteRecipe, toggleFavorite, saveCategories, saveInventory, saveManualGrocery, saveGroceryOverrides,
      saveMealPlan, clearWeeklyPlan, addFriend, removeFriend, refreshFriends, cookingRecipeId, setCookingRecipeId, forceSave
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
