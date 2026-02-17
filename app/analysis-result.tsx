import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { NeonButton } from '../components/ui/NeonButton';
import { CheckCircle, AlertCircle, Save } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

// Define types matching the Edge Function response
interface DetectedFood {
    name_tr: string;
    name_en: string;
    estimated_grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    confidence: number;
}

interface AnalysisResponse {
    success: boolean;
    foods: DetectedFood[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
}

export default function AnalysisResultScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [imageUri, setImageUri] = useState<string>('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (params.analysisResult) {
            try {
                const parsed = JSON.parse(params.analysisResult as string);
                setResult(parsed);
            } catch (e) {
                console.error("Failed to parse result", e);
            }
        }
        if (params.imageUri) {
            setImageUri(params.imageUri as string);
        }
    }, [params]);

    const handleSaveDecorated = async () => {
        setSaving(true);
        try {
            // 1. Get User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // 2. Prepare Log Entry (Summary)
            const totalCalories = result?.total_calories || 0;

            // 3. Insert into food_logs (One entry per food item detected)
            if (result?.foods) {
                const logs = result.foods.map(food => ({
                    user_id: user.id,
                    food_name: food.name_tr,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat,
                    details: food, // Store full JSON details
                    image_url: imageUri, // Local URI for now, would be storage URL in prod
                    log_date: new Date().toISOString().split('T')[0],
                    meal_type: 'lunch' // Default or passed from params
                }));

                const { error } = await supabase.from('food_logs').insert(logs);
                if (error) throw error;
            }

            // 4. Update Daily Summary (This interacts with the DB Trigger usually, or manual)
            // We assume DB triggers handle daily_summaries aggregation from food_logs

            Alert.alert("Success", "Meal logged successfully!", [
                { text: "OK", onPress: () => router.push('/(tabs)/diary') }
            ]);

        } catch (e: any) {
            Alert.alert("Error", "Failed to save meal: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!result) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#40D3F4" />
                <Text className="text-white mt-4">Loading Analysis...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Image */}
                <View className="h-64 w-full relative">
                    <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
                    />
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-6 bg-black/50 p-2 rounded-full border border-white/20"
                    >
                        <Text className="text-white font-bold">← Back</Text>
                    </TouchableOpacity>
                </View>

                <View className="p-6 -mt-6">
                    {/* Total Summary Card */}
                    <View className="bg-zinc-900 border border-cyan-500/30 rounded-3xl p-6 shadow-lg shadow-cyan-500/10 mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-2xl font-bold">Analysis Complete</Text>
                            <CheckCircle size={24} color="#40D3F4" />
                        </View>

                        <View className="flex-row justify-between">
                            <View className="items-center">
                                <Text className="text-3xl font-bold text-white">{result.total_calories}</Text>
                                <Text className="text-gray-400 text-xs uppercase">Calories</Text>
                            </View>
                            <View className="w-[1px] bg-white/10" />
                            <View className="items-center">
                                <Text className="text-xl font-bold text-cyan-400">{result.total_protein}g</Text>
                                <Text className="text-gray-400 text-xs uppercase">Protein</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-xl font-bold text-blue-400">{result.total_carbs}g</Text>
                                <Text className="text-gray-400 text-xs uppercase">Carbs</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-xl font-bold text-purple-400">{result.total_fat}g</Text>
                                <Text className="text-gray-400 text-xs uppercase">Fat</Text>
                            </View>
                        </View>
                    </View>

                    {/* Detected Items List */}
                    <Text className="text-gray-400 text-sm uppercase mb-4 tracking-wider">Detected Items</Text>

                    <View className="space-y-4">
                        {result.foods.map((food, index) => (
                            <View key={index} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex-row justify-between items-center">
                                <View className="flex-1">
                                    <Text className="text-white font-semibold text-lg">{food.name_tr}</Text>
                                    <Text className="text-gray-500 text-xs">{food.estimated_grams}g • {Math.round(food.confidence * 100)}% Match</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white font-bold">{food.calories} kcal</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Save Button */}
            <View className="absolute bottom-10 left-6 right-6">
                <NeonButton onPress={handleSaveDecorated} loading={saving} variant="primary">
                    <View className="flex-row items-center gap-2">
                        <Save size={20} color="black" />
                        <Text className="text-black font-bold">LOG MEAL</Text>
                    </View>
                </NeonButton>
            </View>
        </SafeAreaView>
    );
}
