import { supabase } from './supabase';

export interface FoodLogData {
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    meal_type?: string;
    image_url?: string;
    ai_details?: any;
    serving_info?: string;
}

export interface FoodLogRow extends FoodLogData {
    id: string;
    user_id: string;
    created_at: string;
}

/**
 * Save a food log to Supabase
 */
export async function saveFoodLog(data: FoodLogData): Promise<FoodLogRow> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data: row, error } = await supabase
        .from('food_logs')
        .insert({
            user_id: userId,
            food_name: data.food_name,
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fat: data.fat,
            fiber: data.fiber || 0,
            meal_type: data.meal_type || 'snack',
            image_url: data.image_url || null,
            ai_details: data.ai_details || null,
            serving_info: data.serving_info || null
        })
        .select();

    if (error) {
        console.error('[Supabase Save Error]:', error);
        throw error;
    }

    if (!row || row.length === 0) {
        // This can happen if RLS allows INSERT but denies SELECT
        return {
            ...data,
            id: 'local-' + Date.now(),
            user_id: userId,
            created_at: new Date().toISOString()
        } as FoodLogRow;
    }

    return row[0] as FoodLogRow;
}

/**
 * Fetch recent food logs for the current user
 */
export async function getRecentMeals(limit: number = 10): Promise<FoodLogRow[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch food logs:', error);
        return [];
    }
    return (data || []) as FoodLogRow[];
}

/**
 * Get today's nutrition totals from food_logs
 */
export async function getTodayTotals(): Promise<{ calories: number; protein: number; carbs: number; fat: number; count: number }> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data, error } = await supabase
        .from('food_logs')
        .select('calories, protein, carbs, fat')
        .eq('user_id', userId)
        .gte('created_at', startOfToday.toISOString())
        .lt('created_at', endOfToday.toISOString());

    if (error || !data) return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };

    return data.reduce(
        (acc: { calories: number; protein: number; carbs: number; fat: number; count: number }, m) => ({
            calories: acc.calories + (m.calories || 0),
            protein: acc.protein + (m.protein || 0),
            carbs: acc.carbs + (m.carbs || 0),
            fat: acc.fat + (m.fat || 0),
            count: acc.count + 1,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
    );
}

/**
 * Calculate the current day streak from food_logs
 */
export async function getStreak(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return 0;

    const { data, error } = await supabase
        .from('food_logs')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return 0;

    const uniqueDates = [...new Set(data.map(m => {
        const d = new Date(m.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))].sort().reverse();

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 90; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

        if (uniqueDates.includes(dateStr)) {
            streak++;
        } else if (i === 0) {
            continue;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Save a water log entry
 */
export async function saveWaterLog(amountMl: number): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('water_logs')
        .insert({
            user_id: userId,
            amount_ml: amountMl,
            type: 'plain_water'
        });

    if (error) throw error;
}

/**
 * Get total water intake for today
 */
export async function getTodayWater(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data, error } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .gte('created_at', startOfToday.toISOString())
        .lt('created_at', endOfToday.toISOString());

    if (error || !data) return 0;

    return data.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0);
}

/**
 * Get weekly stats (last 7 days) for the stats page
 */
export async function getWeeklyStats(): Promise<{
    dailyCalories: number[];
    totalMeals: number;
    avgCalories: number;
    totalScans: number;
    streak: number;
}> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const defaultResult = { dailyCalories: [0, 0, 0, 0, 0, 0, 0], totalMeals: 0, avgCalories: 0, totalScans: 0, streak: 0 };
    if (!userId) return defaultResult;

    // Get the start of the week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('food_logs')
        .select('calories, created_at')
        .eq('user_id', userId)
        .gte('created_at', monday.toISOString())
        .order('created_at', { ascending: true });

    if (error || !data) return defaultResult;

    // Group by day of week (Mon=0 ... Sun=6)
    const dailyCalories = [0, 0, 0, 0, 0, 0, 0];
    data.forEach(m => {
        const d = new Date(m.created_at);
        let idx = d.getDay() - 1; // Mon=0 ... Sat=5
        if (idx < 0) idx = 6; // Sun=6
        dailyCalories[idx] += (m.calories || 0);
    });

    const totalMeals = data.length;
    const totalCals = dailyCalories.reduce((a, b) => a + b, 0);
    const daysWithData = dailyCalories.filter(c => c > 0).length;
    const avgCalories = daysWithData > 0 ? Math.round(totalCals / daysWithData) : 0;

    const streak = await getStreak();

    return { dailyCalories, totalMeals, avgCalories, totalScans: totalMeals, streak };
}
