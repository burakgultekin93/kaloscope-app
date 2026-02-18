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

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Suggest recipes based on ingredients and user profile using OpenAI GPT-4o
 */
export async function suggestRecipes(params: {
    ingredients?: string[];
    image_base64?: string;
    meal_type?: string;
    profile?: any;
}): Promise<SuggestRecipeResponse> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your environment.');
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

    const systemPrompt = `You are a creative chef AI. Suggest 3 recipes based on the user's input.
Your response MUST be ONLY valid JSON with this structure:
{
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
- Give Turkish recipe names and descriptions`;

    const userPrompt = `${isDiabetic}
${dietaryInfo}
${healthInfo}
${kitchenInfo}
- Meal type: ${meal_type || 'any'}
${ingredients?.length ? `- User ingredients: ${ingredients.join(', ')}` : '- Suggest popular healthy recipes'}`;

    const messages: any[] = [
        { role: "system", content: systemPrompt }
    ];

    const userContent: any[] = [
        { type: "text", text: userPrompt }
    ];

    if (image_base64) {
        userContent.push({
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${image_base64}`,
                detail: "high"
            }
        });
    }

    messages.push({ role: "user", content: userContent });

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: messages,
            response_format: { type: "json_object" },
            max_tokens: 4096,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('OpenAI returned an empty response.');
    }

    let result: SuggestRecipeResponse;
    try {
        result = JSON.parse(content);
        result.success = true;
    } catch (e) {
        throw new Error(`Failed to parse AI response: ${content.substring(0, 200)}`);
    }

    return result;
}
