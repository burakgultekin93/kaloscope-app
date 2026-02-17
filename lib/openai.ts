import { supabase } from './supabase';

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

/**
 * Analyze a food image using Supabase Edge Function (GPT-4o Vision)
 * @param base64Image - base64-encoded JPEG image
 */
export async function analyzeFood(
    base64Image: string,
    mealType: string = 'snack',
    dietaryPreferences: string[] = [],
    healthFocus: string[] = []
): Promise<AnalyzeResponse> {
    const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
            image_base64: base64Image,
            meal_type: mealType,
            dietary_preferences: dietaryPreferences,
            health_focus: healthFocus,
        },
    });

    if (error) {
        throw new Error(`AI Analysis failed: ${error.message}`);
    }

    if (!data || !data.success) {
        throw new Error('AI Analysis failed to return a successful result.');
    }

    return data as AnalyzeResponse;
}
