/**
 * AI-powered recipe suggestion using Google Gemini 2.0 Flash (FREE)
 */

export interface Recipe {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    prep_time: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    suitability_score: number;
    suitability_reason: string;
}

export interface SuggestRecipeResponse {
    success: boolean;
    recipes: Recipe[];
    ingredients_detected?: string[];
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Suggest recipes based on ingredients and user profile using Gemini
 */
export async function suggestRecipes(params: {
    ingredients?: string[];
    image_base64?: string;
    meal_type?: string;
    profile?: any;
}): Promise<SuggestRecipeResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your environment.');
    }

    const { ingredients, image_base64, meal_type, profile } = params;

    const dietaryInfo = profile?.dietary_preferences?.length
        ? `Dietary preferences: ${profile.dietary_preferences.join(', ')}`
        : '';
    const healthInfo = profile?.health_focus?.length
        ? `Health focus: ${profile.health_focus.join(', ')}`
        : '';
    const kitchenInfo = profile?.kitchen_preferences?.length
        ? `Kitchen preferences: ${profile.kitchen_preferences.join(', ')}`
        : '';
    const isDiabetic = profile?.is_diabetic ? 'User is diabetic - suggest low-carb recipes.' : '';

    const prompt = `You are a creative chef AI. Suggest 3 recipes based on the user's input.

Your response MUST be ONLY valid JSON (no markdown, no code fences, no extra text) with this structure:
{
  "success": true,
  "recipes": [
    {
      "title": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["Step 1...", "Step 2..."],
      "prep_time": 30,
      "calories": 450,
      "protein": 25,
      "carbs": 40,
      "fat": 15,
      "difficulty": "Easy",
      "suitability_score": 85,
      "suitability_reason": "Why this recipe suits the user"
    }
  ],
  "ingredients_detected": ["detected ingredient 1"]
}

Rules:
- Suggest 3 diverse recipes
- prep_time in minutes
- difficulty: Easy/Medium/Hard
- suitability_score: 0-100
- Give Turkish recipe names and descriptions
- ${isDiabetic}
- ${dietaryInfo}
- ${healthInfo}
- ${kitchenInfo}
- Meal type: ${meal_type || 'any'}
${ingredients?.length ? `- User ingredients: ${ingredients.join(', ')}` : '- Suggest popular healthy recipes'}
- Return ONLY valid JSON`;

    const parts: any[] = [{ text: prompt }];

    if (image_base64) {
        parts.push({
            inline_data: {
                mime_type: 'image/jpeg',
                data: image_base64,
            },
        });
    }

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
        throw new Error('Gemini returned an empty response.');
    }

    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let result: SuggestRecipeResponse;
    try {
        result = JSON.parse(cleanContent);
    } catch (e) {
        throw new Error(`Failed to parse AI response: ${cleanContent.substring(0, 200)}`);
    }

    result.success = true;
    return result;
}
