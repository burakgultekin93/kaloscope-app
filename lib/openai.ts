/**
 * Direct OpenAI GPT-4o Vision integration
 * Calls OpenAI API directly from the client using EXPO_PUBLIC_OPENAI_API_KEY
 */

export interface DetectedFood {
    name_tr: string;
    name_en: string;
    estimated_grams: number;
    confidence: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}

export interface AnalyzeResponse {
    success: boolean;
    foods: DetectedFood[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    total_fiber: number;
    health_score: number;
    insight: string;
    processing_time_ms: number;
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

/**
 * Analyze a food image using GPT-4o Vision
 * @param base64Image - base64-encoded image (JPEG/PNG)
 * @param mealType - breakfast/lunch/dinner/snack
 * @param dietaryPreferences - user dietary preferences
 * @param healthFocus - user health focus areas
 */
export async function analyzeFood(
    base64Image: string,
    mealType: string = 'snack',
    dietaryPreferences: string[] = [],
    healthFocus: string[] = []
): Promise<AnalyzeResponse> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your environment.');
    }

    const startTime = Date.now();

    const systemPrompt = `You are a professional nutritionist AI. Analyze the food in the image and return a JSON response.

Your response MUST be valid JSON with this exact structure:
{
  "success": true,
  "foods": [
    {
      "name_tr": "Turkish name of the food",
      "name_en": "English name of the food",
      "estimated_grams": 150,
      "confidence": 0.85,
      "calories": 250,
      "protein": 12.5,
      "carbs": 30.0,
      "fat": 8.0,
      "fiber": 3.0
    }
  ],
  "total_calories": 250,
  "total_protein": 12.5,
  "total_carbs": 30.0,
  "total_fat": 8.0,
  "total_fiber": 3.0,
  "health_score": 75,
  "insight": "A brief nutritional insight about this meal in the user's context"
}

Rules:
- Identify ALL visible food items separately
- Estimate portions in grams realistically
- Calculate macros per item accurately
- health_score is 0-100 (100 = very healthy)
- confidence is 0-1 (1 = very confident)
- Provide insight in Turkish if meal context suggests Turkish user
- Consider the meal type: ${mealType}
${dietaryPreferences.length > 0 ? `- User dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${healthFocus.length > 0 ? `- User health focus: ${healthFocus.join(', ')}` : ''}
- Return ONLY valid JSON, no markdown, no code fences, no extra text`;

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
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this food image and return nutritional information as JSON.' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: 'low',
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            temperature: 0.3,
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

    // Parse JSON — handle possible markdown code fences
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let result: AnalyzeResponse;
    try {
        result = JSON.parse(cleanContent);
    } catch (e) {
        throw new Error(`Failed to parse AI response: ${cleanContent.substring(0, 200)}`);
    }

    result.success = true;
    result.processing_time_ms = Date.now() - startTime;

    return result;
}
