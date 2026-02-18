/**
 * AI Food Analysis using Google Gemini 2.5 Flash (FREE)
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

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Analyze a food image using OpenAI GPT-4o
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

    const systemPrompt = `You are a professional nutritionist AI. Analyze the food in this image.
Return ONLY a JSON object with this structure:
{
  "foods": [
    {
      "name_tr": "Yemek adı",
      "name_en": "Food name",
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
  "insight": "Kısa beslenme değerlendirmesi (Türkçe)"
}

Rules:
- Identify ALL visible food items separately
- Estimate portions in grams
- health_score: 0-100
- confidence: 0-1
- Provide insight in Turkish`;

    const userPrompt = `Meal type: ${mealType}
${dietaryPreferences.length > 0 ? `- Dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${healthFocus.length > 0 ? `- Health focus: ${healthFocus.join(', ')}` : ''}`;

    console.log('[AI] Sending request to OpenAI API (GPT-4o)...');

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: userPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 4096,
            temperature: 0.1
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('[AI] API Error Status:', response.status);
        console.error('[AI] API Error Body:', errorBody.substring(0, 1000));
        throw new Error(`OpenAI Hatası (${response.status}): ${errorBody.substring(0, 100) || 'Sunucu yanıt vermedi'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('AI boş yanıt döndü. Lütfen tekrar deneyin.');
    }

    let result: AnalyzeResponse;
    try {
        result = JSON.parse(content);
        result.success = true;
        result.processing_time_ms = Date.now() - startTime;
    } catch (e: any) {
        console.error('[AI] JSON Parse error:', e.message);
        throw new Error('AI yanıtı işlenemedi. Lütfen tekrar deneyin.');
    }

    console.log('[AI] Successfully parsed. Foods detected:', result.foods?.length || 0);

    return result;
}
