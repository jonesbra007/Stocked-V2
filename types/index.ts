export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  searchable?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  servings: string | number;
  ingredients: string;
  parsedIngredients?: string[];
  instructions: string;
  parsedInstructions?: string[];
  notes?: string;
  category: string | string[];
  favorite: boolean;
  imageUrl?: string;
}

export interface Category {
  name: string;
  color: string;
}

export interface InventoryItem {
  name: string;
  category: string;
}

export interface GroceryItem {
  name: string;
  category: string;
  isManual: boolean;
  originalIdx?: number;
}

export interface Friend {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PlanItem {
  id: string;
  title: string;
}

export interface MealPlan {
  [key: string]: PlanItem; // e.g., "0_break": { id: "123", title: "Pancakes" }
}
