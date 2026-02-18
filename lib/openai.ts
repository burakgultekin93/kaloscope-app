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

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Analyze a food image using Gemini 2.5 Flash Vision
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

    const prompt = `You are a professional nutritionist AI. Analyze the food in this image.

Return ONLY a JSON object (no markdown, no explanation, no code fences) with this structure:
{
  "success": true,
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
  "insight": "Kısa beslenme değerlendirmesi"
}

Rules:
- Identify ALL visible food items separately
- Estimate portions in grams
- health_score: 0-100
- confidence: 0-1
- Provide insight in Turkish
- Meal type: ${mealType}
${dietaryPreferences.length > 0 ? `- Dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${healthFocus.length > 0 ? `- Health focus: ${healthFocus.join(', ')}` : ''}`;

    console.log('[AI] Sending request to Gemini API...');

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
                temperature: 0.1,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('[AI] API Error:', response.status, errorBody.substring(0, 500));
        throw new Error(`AI servisi şu anda kullanılamıyor (${response.status}). Lütfen tekrar deneyin.`);
    }

    const data = await response.json();

    // Check for truncation (finishReason === 'MAX_TOKENS')
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') {
        console.error('[AI] Response was truncated due to token limit');
        throw new Error('AI yanıtı çok uzun oldu. Lütfen daha basit bir fotoğraf deneyin.');
    }

    if (finishReason === 'SAFETY') {
        console.error('[AI] Response was blocked by safety filters');
        throw new Error('AI bu görseli analiz edemedi. Lütfen farklı bir fotoğraf deneyin.');
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
        console.error('[AI] Empty response. Full API data:', JSON.stringify(data).substring(0, 1000));
        throw new Error('AI boş yanıt döndü. Lütfen tekrar deneyin.');
    }

    console.log('[AI] Raw response length:', content.length);
    console.log('[AI] Raw response preview:', content.substring(0, 300));
    console.log('[AI] Finish reason:', finishReason);

    // Robust JSON parsing
    let cleanContent = content;

    // 1. Remove markdown code fences if present
    cleanContent = cleanContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

    // 2. Find JSON object boundaries
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
        console.error('[AI] No JSON found in response:', content.substring(0, 500));
        throw new Error('AI yanıtında JSON bulunamadı. Lütfen tekrar deneyin.');
    }

    cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);

    // 3. Try to fix common JSON issues
    // Remove trailing commas before closing braces/brackets
    cleanContent = cleanContent.replace(/,\s*([}\]])/g, '$1');

    let result: AnalyzeResponse;
    try {
        result = JSON.parse(cleanContent);
    } catch (e: any) {
        console.error('[AI] JSON Parse error:', e.message);
        console.error('[AI] Cleaned content:', cleanContent.substring(0, 500));

        // Check if it looks like truncated JSON
        if (!cleanContent.endsWith('}')) {
            throw new Error('AI yanıtı eksik geldi. Lütfen tekrar deneyin.');
        }

        throw new Error('AI yanıtı işlenemedi. Lütfen tekrar deneyin.');
    }

    result.success = true;
    result.processing_time_ms = Date.now() - startTime;

    console.log('[AI] Successfully parsed. Foods detected:', result.foods?.length || 0);

    return result;
}
