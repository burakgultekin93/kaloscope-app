import { supabase } from './supabase';

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

/**
 * Suggest recipes based on ingredients (or image) and user profile
 */
export async function suggestRecipes(params: {
    ingredients?: string[],
    image_base64?: string,
    meal_type?: string
}): Promise<SuggestRecipeResponse> {
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user profile for context
    let profileData = {};
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profileData = profile || {};
    }

    const { data, error } = await supabase.functions.invoke('suggest-recipes', {
        body: {
            ...params,
            profile: profileData
        },
    });

    if (error) throw error;
    return data;
}
