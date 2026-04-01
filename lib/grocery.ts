export const INVENTORY_CATEGORIES = [
  "Produce", 
  "Meat & Protein", 
  "Dairy & Fridge", 
  "Pantry & Grains", 
  "Condiments", 
  "Spices & Seasonings", 
  "Other"
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Produce": ["onion", "garlic", "lemon", "lime", "tomato", "potato", "carrot", "lettuce", "spinach", "pepper", "fruit", "veg", "avocado", "banana", "herb", "cilantro", "parsley", "basil", "chive", "apple", "orange", "pear", "grape", "strawberry", "berry", "melon", "cucumber", "zucchini", "squash", "broccoli", "cauliflower", "kale", "chard", "salad", "celery", "mushroom", "corn", "ginger", "mint", "rosemary", "thyme"],
  "Meat & Protein": ["chicken", "beef", "pork", "steak", "fish", "salmon", "tuna", "shrimp", "tofu", "meat", "bacon", "sausage", "turkey", "ham", "lamb", "ground", "fillet"],
  "Dairy & Fridge": ["milk", "cheese", "butter", "egg", "cream", "yogurt", "cheddar", "mozzarella", "parmesan", "sour cream", "cottage", "margarine"],
  "Pantry & Grains": ["rice", "pasta", "noodle", "bread", "flour", "sugar", "cereal", "oat", "can", "bean", "lentil", "jar", "honey", "nut", "stock", "broth", "soup", "cracker", "chip", "snack", "oil", "vinegar", "baking", "cake", "cookie", "mix"],
  "Condiments": ["ketchup", "mustard", "mayo", "mayonnaise", "relish", "bbq", "barbecue", "hot sauce", "sriracha", "soy sauce", "soy", "teriyaki", "hoisin", "worcestershire", "fish sauce", "ranch", "dressing", "vinaigrette", "salsa", "pesto", "jam", "jelly", "pickle", "pickles", "olives", "capers", "maple syrup", "syrup"],
  "Spices & Seasonings": ["salt", "pepper", "spice", "paprika", "cumin", "oregano", "thyme", "basil", "chili", "cinnamon", "nutmeg", "seasoning", "garlic powder", "onion powder", "extract", "vanilla"]
};

export function categorizeIngredient(name: string, overrides: Record<string, string> = {}): string {
  const lower = name.toLowerCase();
  
  if (overrides[lower]) {
    return overrides[lower];
  }
  
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  
  return "Other";
}
