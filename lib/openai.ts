const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export interface NutritionResult {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: string;
    details: string;
}

/**
 * Analyze a food image using OpenAI GPT-4o Vision
 * @param base64Image - base64-encoded JPEG image (without data:image prefix)
 */
export async function analyzeFood(base64Image: string): Promise<NutritionResult> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
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
                {
                    role: 'system',
                    content: `You are a professional nutrition analyst. Analyze the food in the image and estimate its nutritional content.

IMPORTANT: Respond ONLY with valid JSON in this exact format, no extra text:
{
  "food_name": "Name of the food/meal (in English)",
  "calories": 350,
  "protein": 25.5,
  "carbs": 40.2,
  "fat": 12.3,
  "confidence": "high",
  "details": "Brief description of what you see and how you estimated"
}

Rules:
- calories should be an integer (kcal)
- protein, carbs, fat should be numbers with 1 decimal (grams)
- confidence should be "high", "medium", or "low"
- If you cannot identify food in the image, set food_name to "Unrecognized" and all values to 0
- Estimate based on typical portion sizes visible in the image`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analyze the nutrition content of this food image.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: 'low'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} — ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('No response from OpenAI');
    }

    // Parse JSON from the response (handle potential markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    try {
        const result = JSON.parse(jsonStr) as NutritionResult;
        return {
            food_name: result.food_name || 'Unknown Food',
            calories: Math.round(result.calories || 0),
            protein: Math.round((result.protein || 0) * 10) / 10,
            carbs: Math.round((result.carbs || 0) * 10) / 10,
            fat: Math.round((result.fat || 0) * 10) / 10,
            confidence: result.confidence || 'medium',
            details: result.details || '',
        };
    } catch (e) {
        throw new Error('Failed to parse AI response: ' + jsonStr.slice(0, 200));
    }
}
