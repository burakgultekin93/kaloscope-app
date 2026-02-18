```javascript
import React, { useEffect, useState } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Platform
} from 'react-native';
// Removed showAlert import
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnalyzeResponse } from '../lib/openai';
import { supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';

export default function AnalysisResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t, lang } = useI18n();
    const [result, setResult] = useState<AnalyzeResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);

    const [isDiabetic, setIsDiabetic] = useState(false);
    const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
    const [healthFocus, setHealthFocus] = useState<string[]>([]);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (params.resultJson) {
            try {
                setResult(JSON.parse(params.resultJson as string));
            } catch (e) {
                console.error('Failed to parse result', e);
            }
        }
        loadUserProfile();
    }, [params]);

    const loadUserProfile = async () => {
        setLoadingProfile(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_diabetic, dietary_preferences, health_focus')
                    .eq('id', user.id)
                    .limit(1);
                if (data && data.length > 0) {
                    const profile = data[0];
                    setIsDiabetic(!!profile.is_diabetic);
                    setDietaryPrefs(profile.dietary_preferences || []);
                    setHealthFocus(profile.health_focus || []);
                }
            }
        } catch (e) {
            console.error('Profile load error:', e);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSave = async () => {
        if (!result || result.foods.length === 0) return;
        setSaving(true);
        setSaveStatus('idle');
        setSaveError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSaveError("Giriş yapılmamış. Lütfen tekrar giriş yapın.");
                setSaveStatus('error');
                setSaving(false);
                return;
            }

            const { error } = await supabase.from('meals').insert({
                user_id: user.id,
                name: result.foods.map(f => lang === 'tr' ? f.name_tr : f.name_en).join(', '),
                calories: result.total_calories,
                protein: result.total_protein,
                carbs: result.total_carbs,
                fat: result.total_fat,
                fiber: result.total_fiber, // Added fiber back as it was in original saveFoodLog
                image_url: null, // We are not saving image to storage for MVP to save bandwidth
                date: new Date().toISOString(),
                meal_type: (params.mealType as string) || 'snack', // Ensure mealType is string
                ai_details: result, // Added ai_details back as it was in original saveFoodLog
            });

            if (error) throw error;

            setSaveStatus('success');
            // Auto navigate back after short delay? Optional. User might want to read.
        } catch (e: any) {
            console.error('Save error:', e);
            setSaveError(e.message || "Kaydedilemedi.");
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    if (!result) return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#22d3ee" style={{ marginTop: 50 }} />
        </SafeAreaView>
    );

    // The original `loadingProfile` check was here, but the instruction removed it from the `if` condition.
    // If `loadingProfile` is true, the UI will render with placeholders or default values for profile-dependent elements.
    // The instruction's provided UI doesn't seem to have a specific loading state for profile after initial result load.

    // Re-implementing the warning logic based on variables.
    const highCarb = isDiabetic && result.total_carbs > 30; // Using original threshold from the provided file

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← {t('back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{t('analysis_result')}</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreValue}>{result.health_score}</Text>
                        <Text style={styles.scoreLabel}>Health Score</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.mealTitle}>
                            {result.foods.map(f => lang === 'tr' ? f.name_tr : f.name_en).join(', ') || 'Unknown Meal'}
                        </Text>
                        <Text style={styles.calories}>{result.total_calories} kcal</Text>
                    </View>
                </View>

                {/* Macros */}
                <View style={styles.macrosRow}>
                    <View style={[styles.macroItem, { backgroundColor: 'rgba(34, 211, 238, 0.1)' }]}>
                        <Text style={[styles.macroValue, { color: '#22d3ee' }]}>{result.total_protein}g</Text>
                        <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={[styles.macroItem, { backgroundColor: 'rgba(250, 204, 21, 0.1)' }]}>
                        <Text style={[styles.macroValue, { color: '#facc15' }]}>{result.total_fat}g</Text>
                        <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                    <View style={[styles.macroItem, { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
                        <Text style={[styles.macroValue, { color: '#f87171' }]}>{result.total_carbs}g</Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                </View>

                {/* Warnings (Diabetic/Allergies) */}
                {isDiabetic && (
                    <View style={[styles.warningCard, highCarb && styles.warningCardHighCarb]}>
                        <Text style={styles.warningTitle}>⚠️ {t('diabetic_warning_title')}</Text>
                        <Text style={styles.warningText}>
                            {highCarb ? t('high_carb_msg') : t('low_carb_msg')}
                        </Text>
                    </View>
                )}

                    </View>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🧈</Text>
                        <Text style={[styles.macroValue, { color: '#8b5cf6' }]}>{result.total_fat}g</Text>
                        <Text style={styles.macroLabel}>{t('fat')}</Text>
                    </View>
                </View>

                {/* AI Insight */}
                {result.insight && (
                    <View style={styles.insightCard}>
                        <Text style={styles.insightTitle}>{t('ai_insight_title')}</Text>
                        <Text style={styles.insightText}>{result.insight}</Text>
                        <View style={styles.healthScoreRow}>
                            <Text style={styles.healthScoreLabel}>{t('health_score')}:</Text>
                            <Text style={[styles.healthScoreValue, { color: result.health_score > 70 ? '#22d3ee' : '#f59e0b' }]}>
                                {result.health_score}/100
                            </Text>
                        </View>
                    </View>
                )}

                {/* Individual Foods */}
                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>{t('detected_items')}</Text>
                    {result.foods.map((food, i) => (
                        <View key={i} style={styles.foodItemRow}>
                            <Text style={styles.foodItemName}>{lang === 'tr' ? food.name_tr : food.name_en}</Text>
                            <Text style={styles.foodItemGrams}>{food.estimated_grams}g</Text>
                            <Text style={styles.foodItemCals}>{food.calories} kcal</Text>
                        </View>
                    ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#000" />
                            <Text style={styles.saveBtnText}> {t('loading')}</Text>
                        </View>
                    ) : (
                        <Text style={styles.saveBtnText}>{t('save_diary')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.discardBtn} onPress={() => router.back()}>
                    <Text style={styles.discardBtnText}>{t('discard_scan')}</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : 8, maxWidth: 500, width: '100%', alignSelf: 'center' },
    loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#71717a', marginTop: 12, fontSize: 14 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
    backBtnText: { color: '#71717a', fontSize: 14, fontWeight: '500' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    prefsContainer: { marginBottom: 20 },
    prefsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    prefBadge: { backgroundColor: 'rgba(34, 211, 238, 0.1)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    prefBadgeText: { color: '#22d3ee', fontSize: 12, fontWeight: '600' },
    prefsHint: { color: '#52525b', fontSize: 11, fontStyle: 'italic' },
    diabeticCard: { backgroundColor: 'rgba(34, 211, 238, 0.05)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', borderRadius: 16, padding: 16, marginBottom: 20 },
    diabeticCardWarning: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' },
    diabeticTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
    diabeticDesc: { color: '#a1a1aa', fontSize: 12, lineHeight: 18 },
    resultCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    checkIcon: { fontSize: 20 },
    resultTitle: { color: '#22d3ee', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    foodName: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
    confidenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    confidenceDot: { width: 8, height: 8, borderRadius: 4 },
    confidenceText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
    macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    macroCard: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, alignItems: 'center' },
    macroCardWarning: { borderColor: 'rgba(239, 68, 68, 0.3)' },
    macroEmoji: { fontSize: 24, marginBottom: 8 },
    macroValue: { fontSize: 28, fontWeight: '800' },
    macroLabel: { color: '#52525b', fontSize: 12, marginTop: 4, fontWeight: '500' },
    insightCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, marginBottom: 16 },
    insightTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 },
    insightText: { color: '#a1a1aa', fontSize: 13, lineHeight: 22, marginBottom: 14 },
    healthScoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    healthScoreLabel: { color: '#71717a', fontSize: 13 },
    healthScoreValue: { fontSize: 16, fontWeight: '800' },
    detailsCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 24 },
    detailsTitle: { color: '#a1a1aa', fontSize: 14, fontWeight: '600', marginBottom: 12 },
    foodItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
    foodItemName: { color: '#fff', fontSize: 14, flex: 2 },
    foodItemGrams: { color: '#71717a', fontSize: 13, flex: 1, textAlign: 'center' },
    foodItemCals: { color: '#22d3ee', fontSize: 14, flex: 1, textAlign: 'right', fontWeight: '600' },
    saveBtn: { backgroundColor: '#22d3ee', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
    discardBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    discardBtnText: { color: '#52525b', fontSize: 14, fontWeight: '500' },
});
