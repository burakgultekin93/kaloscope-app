import { supabase } from './supabase';

export interface MealData {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type?: string;
    image_base64?: string;
    ai_response?: any;
}

export interface MealRow extends MealData {
    id: string;
    user_id: string;
    created_at: string;
}

/**
 * Save a meal to Supabase
 */
export async function saveMeal(data: MealData): Promise<MealRow> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: row, error } = await supabase
        .from('meals')
        .insert({
            user_id: userId,
            food_name: data.food_name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            meal_type: data.meal_type || 'snack',
            image_base64: data.image_base64 || null,
            ai_response: data.ai_response || null,
        })
        .select()
        .single();

    if (error) throw error;
    return row as MealRow;
}

/**
 * Fetch recent meals for the current user
 */
export async function getRecentMeals(limit: number = 10): Promise<MealRow[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch meals:', error);
        return [];
    }
    return (data || []) as MealRow[];
}

/**
 * Get today's nutrition totals
 */
export async function getTodayTotals(): Promise<{ calories: number; protein: number; carbs: number; fat: number; count: number }> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('meals')
        .select('calories, protein, carbs, fat')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

    if (error || !data) return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };

    return data.reduce(
        (acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            protein: acc.protein + (m.protein || 0),
            carbs: acc.carbs + (m.carbs || 0),
            fat: acc.fat + (m.fat || 0),
            count: acc.count + 1,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
    );
}
