import React, { useEffect, useState } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnalyzeResponse } from '../lib/openai';
import { saveFoodLog } from '../lib/meals';
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
            await saveFoodLog({
                food_name: result.foods.map(f => lang === 'tr' ? f.name_tr : f.name_en).join(', '),
                calories: result.total_calories,
                protein: result.total_protein,
                carbs: result.total_carbs,
                fat: result.total_fat,
                fiber: result.total_fiber,
                meal_type: (params.mealType as string) || 'snack',
                ai_details: result,
            });

            setSaveStatus('success');
        } catch (e: any) {
            console.error('Save error:', e);
            setSaveError(e.message === 'Not authenticated' ? (lang === 'tr' ? "Giriş yapılmamış." : "Not logged in.") : (e.message || "Kaydedilemedi."));
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

    const highCarb = isDiabetic && result.total_carbs > 30;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← {t('back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{t('analysis_result')}</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreValue}>{result.total_calories}</Text>
                        <Text style={styles.scoreLabel}>kcal</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.mealTitle}>
                            {result.foods.map(f => lang === 'tr' ? f.name_tr : f.name_en).join(', ')}
                        </Text>
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
                        <Text style={styles.macroLabel}>{t('fat')}</Text>
                    </View>
                    <View style={[styles.macroItem, { backgroundColor: 'rgba(248, 113, 113, 0.1)' }]}>
                        <Text style={[styles.macroValue, { color: '#f87171' }]}>{result.total_carbs}g</Text>
                        <Text style={styles.macroLabel}>{t('carbs')}</Text>
                    </View>
                </View>

                {/* Warnings (Diabetic) */}
                {isDiabetic && (
                    <View style={[styles.warningCard, highCarb && styles.warningCardHighCarb]}>
                        <Text style={styles.warningTitle}>⚠️ {t('diabetic_warning_title') || 'Diabetic Warning'}</Text>
                        <Text style={styles.warningText}>
                            {highCarb ? (t('high_carb_msg') || 'High carbs detected.') : (t('low_carb_msg') || 'Carbs are within safe limits.')}
                        </Text>
                    </View>
                )}

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

                {/* Detected Items */}
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
                    style={[styles.saveBtn, (saving || saveStatus === 'success') && styles.saveBtnDisabled, saveStatus === 'success' && styles.saveBtnSuccess]}
                    onPress={handleSave}
                    disabled={saving || saveStatus === 'success'}
                >
                    {saving ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#000" />
                            <Text style={styles.saveBtnText}> {t('loading')}...</Text>
                        </View>
                    ) : saveStatus === 'success' ? (
                        <Text style={styles.saveBtnText}>✅ {lang === 'tr' ? 'Kaydedildi' : 'Saved'}</Text>
                    ) : (
                        <Text style={styles.saveBtnText}>{t('save_diary')}</Text>
                    )}
                </TouchableOpacity>

                {saveError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{saveError}</Text>
                    </View>
                )}

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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    backBtn: { padding: 8 },
    backBtnText: { color: '#22d3ee', fontSize: 16 },
    title: { color: '#fff', fontSize: 18, fontWeight: '600' },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },

    scoreCard: { alignItems: 'center', marginBottom: 24 },
    scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#22d3ee', justifyContent: 'center', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(34, 211, 238, 0.05)' },
    scoreValue: { color: '#fff', fontSize: 32, fontWeight: '800' },
    scoreLabel: { color: '#a1a1aa', fontSize: 14, fontWeight: '500' },
    scoreInfo: { paddingHorizontal: 20 },
    mealTitle: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },

    macrosRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 10 },
    macroItem: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' },
    macroValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    macroLabel: { color: '#d4d4d8', fontSize: 12 },

    warningCard: { backgroundColor: 'rgba(250, 204, 21, 0.1)', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(250, 204, 21, 0.2)' },
    warningCardHighCarb: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' },
    warningTitle: { color: '#e4e4e7', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    warningText: { color: '#d4d4d8', fontSize: 13, lineHeight: 18 },

    insightCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, marginBottom: 24, borderLeftWidth: 3, borderLeftColor: '#22d3ee' },
    insightTitle: { color: '#22d3ee', fontSize: 15, fontWeight: '700', marginBottom: 8 },
    insightText: { color: '#e4e4e7', fontSize: 14, lineHeight: 22 },
    healthScoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    healthScoreLabel: { color: '#a1a1aa', fontSize: 13, marginRight: 8 },
    healthScoreValue: { fontSize: 14, fontWeight: '700' },

    detailsCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 24 },
    detailsTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
    foodItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    foodItemName: { color: '#e4e4e7', fontSize: 14, flex: 2 },
    foodItemGrams: { color: '#a1a1aa', fontSize: 13, flex: 1, textAlign: 'center' },
    foodItemCals: { color: '#22d3ee', fontSize: 14, flex: 1, textAlign: 'right', fontWeight: '600' },

    saveBtn: { backgroundColor: '#22d3ee', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16, shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 4 },
    saveBtnSuccess: { backgroundColor: '#4ade80' },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },

    errorContainer: { marginBottom: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12 },
    errorText: { color: '#fca5a5', textAlign: 'center', fontSize: 14 },

    discardBtn: { paddingVertical: 14, alignItems: 'center' },
    discardBtnText: { color: '#71717a', fontSize: 14, fontWeight: '500' },
});
