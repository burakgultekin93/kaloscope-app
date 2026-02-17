/**
 * AI-powered recipe suggestion using direct OpenAI API calls
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

/**
 * Suggest recipes based on ingredients and user profile using GPT-4o
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

Your response MUST be valid JSON with this structure:
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
  "ingredients_detected": ["detected ingredient 1", "detected ingredient 2"]
}

Rules:
- Suggest 3 diverse recipes
- prep_time in minutes
- difficulty: Easy/Medium/Hard
- suitability_score: 0-100
- Give Turkish recipe names and descriptions if user context is Turkish
- ${isDiabetic}
- ${dietaryInfo}
- ${healthInfo}
- ${kitchenInfo}
- Meal type context: ${meal_type || 'any'}
- Return ONLY valid JSON, no markdown, no code fences`;

    const userContent: any[] = [];

    if (ingredients?.length) {
        userContent.push({
            type: 'text',
            text: `Suggest recipes using these ingredients: ${ingredients.join(', ')}`
        });
    } else {
        userContent.push({
            type: 'text',
            text: 'Suggest 3 healthy recipes for me based on my profile.'
        });
    }

    if (image_base64) {
        userContent.push({
            type: 'image_url',
            image_url: {
                url: `data:image/jpeg;base64,${image_base64}`,
                detail: 'low',
            },
        });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            max_tokens: 2000,
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
