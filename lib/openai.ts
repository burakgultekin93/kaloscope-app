/**
 * AI Food Analysis using Google Gemini 1.5 Flash (FREE)
 * Calls Gemini API directly from the client using EXPO_PUBLIC_GEMINI_API_KEY
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

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Analyze a food image using Gemini 1.5 Flash Vision
 */
export async function analyzeFood(
    base64Image: string,
    mealType: string = 'snack',
    dietaryPreferences: string[] = [],
    healthFocus: string[] = []
): Promise<AnalyzeResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your environment.');
    }

    const startTime = Date.now();

    const prompt = `You are a professional nutritionist AI. Analyze the food in this image and return a JSON response.

Your response MUST be ONLY valid JSON (no markdown, no code fences, no extra text) with this exact structure:
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
  "insight": "A brief nutritional insight about this meal"
}

Rules:
- Identify ALL visible food items separately
- Estimate portions in grams realistically
- Calculate macros per item accurately
- health_score is 0-100 (100 = very healthy)
- confidence is 0-1 (1 = very confident)
- Provide insight in Turkish
- Meal type context: ${mealType}
${dietaryPreferences.length > 0 ? `- User dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${healthFocus.length > 0 ? `- User health focus: ${healthFocus.join(', ')}` : ''}
- Return ONLY valid JSON`;

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: base64Image,
                        },
                    },
                ],
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1000,
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
