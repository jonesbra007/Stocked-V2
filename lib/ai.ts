import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function extractRecipeFromText(text: string) {
  const recipeSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      ingredients: { type: Type.STRING, description: "List of ingredients separated by newlines" },
      instructions: { type: Type.STRING, description: "Step-by-step instructions separated by newlines" },
      cuisine: { type: Type.STRING, description: "Suggest one category: Italian, Mexican, Asian, American, Healthy, Breakfast, Dessert, Other" },
      servings: { type: Type.NUMBER, description: "Number of servings this recipe makes" }
    }
  };
  const prompt = `Extract the recipe from the following text into JSON format. If it's a URL, extract the likely recipe content associated with it: \n\n${text}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: recipeSchema }
  });
  
  return JSON.parse(response.text || "{}");
}

export async function parseIngredientsWithAI(rawText: string) {
  if(!rawText.trim()) return [];
  try {
    const prompt = `Convert the following list of ingredients into a clean shopping list. Remove preparation methods... Input: ${rawText} Return ONLY a JSON array of strings.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.warn("AI parsing failed", e);
    return rawText.split('\n').filter(l => l.trim());
  }
}
