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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || ''; // Support both for safety
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    health_tip: string;
}

// Smart Agent Configuration
const TIMEOUT_MS = 30000; // 30 seconds max wait
const MAX_RETRIES = 3;

/**
 * Helper to handle timeouts
 */
function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number }): Promise<Response> {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    return fetch(resource, {
        ...options,
        signal: controller.signal
    }).then(response => {
        clearTimeout(id);
        return response;
    }).catch(error => {
        clearTimeout(id);
        throw error;
    });
}

/**
 * Helper to delay between retries
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze a food image using OpenAI GPT-4o with strict single-object schema
 * Includes "Smart Agent" features: Timeout, Retry, and Error Recovery
 */
export async function analyzeFood(
    base64Image: string,
    mealType: string = 'snack',
    dietaryPreferences: string[] = [],
    healthFocus: string[] = []
): Promise<AnalyzeResponse> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Set process.env.OPENAI_API_KEY.');
    }

    const startTime = Date.now();

    const systemPrompt = `You are an expert nutritionist. Analyze the food in the image. Return ONLY a raw JSON object (no markdown, no backticks) with this structure: { "food_name": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "health_tip": "string" }. If unsure, estimate based on standard portion sizes.`;

    const userPrompt = `Meal type: ${mealType}
${dietaryPreferences.length > 0 ? `- Dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${healthFocus.length > 0 ? `- Health focus: ${healthFocus.join(', ')}` : ''}`;

    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[AI Agent] Attempt ${attempt}/${MAX_RETRIES} - Sending request to OpenAI GPT-4o...`);

            const response = await fetchWithTimeout(OPENAI_URL, {
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
                    max_tokens: 1000,
                    temperature: 0.1
                }),
                timeout: TIMEOUT_MS
            });

            if (!response.ok) {
                const errorBody = await response.text();
                const status = response.status;
                console.error(`[AI Agent] Attempt ${attempt} failed with status ${status}:`, errorBody.substring(0, 200));

                if (status >= 500 || status === 429) {
                    // Retryable errors
                    throw new Error(`Server Error (${status})`);
                } else {
                    // Non-retryable errors (400, 401, etc.)
                    throw new Error(`API Error (${status}): ${errorBody}`);
                }
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('AI returned empty content.');
            }

            let parsed: OpenAIResponse;
            try {
                parsed = JSON.parse(content);
            } catch (e: any) {
                console.error('[AI Agent] JSON Parse Error:', e.message);
                throw new Error('Invalid JSON format from AI');
            }

            // Map strict single/simple object to App's rich UpdateFood structure
            const mappedResult: AnalyzeResponse = {
                success: true,
                foods: [{
                    name_tr: parsed.food_name,
                    name_en: parsed.food_name,
                    estimated_grams: 100, // Default reference
                    confidence: 1.0,
                    calories: parsed.calories,
                    protein: parsed.protein,
                    carbs: parsed.carbs,
                    fat: parsed.fat,
                    fiber: 0
                }],
                total_calories: parsed.calories,
                total_protein: parsed.protein,
                total_carbs: parsed.carbs,
                total_fat: parsed.fat,
                total_fiber: 0,
                health_score: 85,
                insight: parsed.health_tip,
                processing_time_ms: Date.now() - startTime
            };

            console.log(`[AI Agent] Success on attempt ${attempt}. Food: ${parsed.food_name}`);
            return mappedResult;

        } catch (err: any) {
            lastError = err;
            console.warn(`[AI Agent] Attempt ${attempt} failed: ${err.message}`);

            if (attempt < MAX_RETRIES) {
                const waitTime = attempt * 1000; // Linear backoff: 1s, 2s, 3s...
                console.log(`[AI Agent] Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            } else {
                console.error('[AI Agent] All retries failed.');
            }
        }
    }

    // If we get here, all retries failed
    if (lastError?.name === 'AbortError') {
        throw new Error('Zaman aşımı: İnternet bağlantınız yavaş olabilir veya sunucu yanıt vermiyor. Lütfen tekrar deneyin.');
    }

    throw new Error(lastError?.message || 'Bağlantı hatası: Lütfen internetinizi kontrol edip tekrar deneyin.');
}
