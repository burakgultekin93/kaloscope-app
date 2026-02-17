import React, { useEffect, useState } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, StyleSheet,
    TouchableOpacity, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { saveFoodLog } from '../lib/meals';
import { AnalyzeResponse } from '../lib/openai';
import { useI18n } from '../lib/i18n';

export default function AnalysisResultScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { t, lang } = useI18n();
    const [result, setResult] = useState<AnalyzeResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [isDiabetic, setIsDiabetic] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
    const [healthFocus, setHealthFocus] = useState<string[]>([]);

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
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_diabetic, dietary_preferences, health_focus')
                    .eq('id', user.id)
                    .single();
                if (profile) {
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

            Alert.alert(t('success') + ' ✅', lang === 'tr' ? 'Öğün günlüğüne kaydedildi!' : 'Meal saved to your diary!', [
                { text: lang === 'tr' ? 'Dashboard\'a Git' : 'Go to Dashboard', onPress: () => router.replace('/(tabs)') },
            ]);
        } catch (e: any) {
            Alert.alert(t('error'), e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!result || loadingProfile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const avgConfidence = result.foods.reduce((acc, f) => acc + f.confidence, 0) / result.foods.length;
    const confidenceColor = avgConfidence > 0.8 ? '#22c55e' : avgConfidence > 0.5 ? '#f59e0b' : '#ef4444';

    const highCarb = isDiabetic && result.total_carbs > 30;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← {t('back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('analysis_result')}</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Diabetic Warning Card */}
                {isDiabetic && (
                    <View style={[styles.diabeticCard, highCarb && styles.diabeticCardWarning]}>
                        <Text style={styles.diabeticTitle}>{t('diabetic_warning_title')}</Text>
                        <Text style={styles.diabeticDesc}>
                            {highCarb ? t('high_carb_msg') : t('low_carb_msg')}
                        </Text>
                    </View>
                )}

                {/* Health & Diet Preference Badges */}
                {(dietaryPrefs.length > 0 || healthFocus.length > 0) && (
                    <View style={styles.prefsContainer}>
                        <View style={styles.prefsRow}>
                            {dietaryPrefs.map(p => (
                                <View key={p} style={styles.prefBadge}>
                                    <Text style={styles.prefBadgeText}>🥗 {p}</Text>
                                </View>
                            ))}
                            {healthFocus.map(f => (
                                <View key={f} style={styles.prefBadge}>
                                    <Text style={styles.prefBadgeText}>🎯 {f}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={styles.prefsHint}>{t('ai_insight_desc')}</Text>
                    </View>
                )}

                {/* Result Card */}
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.checkIcon}>✅</Text>
                        <Text style={styles.resultTitle}>{t('analysis_complete')}</Text>
                    </View>

                    <Text style={styles.foodName}>
                        {result.foods.map(f => lang === 'tr' ? f.name_tr : f.name_en).join(', ')}
                    </Text>

                    <View style={styles.confidenceBadge}>
                        <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                            {Math.round(avgConfidence * 100)}% {t('confidence')}
                        </Text>
                    </View>
                </View>

                {/* Macro Grid */}
                <View style={styles.macroGrid}>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🔥</Text>
                        <Text style={[styles.macroValue, { color: '#4CAF50' }]}>{result.total_calories}</Text>
                        <Text style={styles.macroLabel}>{t('calories')}</Text>
                    </View>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🥩</Text>
                        <Text style={[styles.macroValue, { color: '#4CAF50' }]}>{result.total_protein}g</Text>
                        <Text style={styles.macroLabel}>{t('protein')}</Text>
                    </View>
                    <View style={[styles.macroCard, highCarb && styles.macroCardWarning]}>
                        <Text style={styles.macroEmoji}>🍞</Text>
                        <Text style={[styles.macroValue, { color: highCarb ? '#ef4444' : '#3b82f6' }]}>{result.total_carbs}g</Text>
                        <Text style={styles.macroLabel}>{t('carbs')}</Text>
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
                            <Text style={[styles.healthScoreValue, { color: result.health_score > 70 ? '#4CAF50' : '#f59e0b' }]}>
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
    prefBadge: { backgroundColor: 'rgba(76, 175, 80, 0.1)', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    prefBadgeText: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
    prefsHint: { color: '#52525b', fontSize: 11, fontStyle: 'italic' },
    diabeticCard: { backgroundColor: 'rgba(76, 175, 80, 0.05)', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)', borderRadius: 16, padding: 16, marginBottom: 20 },
    diabeticCardWarning: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' },
    diabeticTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
    diabeticDesc: { color: '#a1a1aa', fontSize: 12, lineHeight: 18 },
    resultCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.2)', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    checkIcon: { fontSize: 20 },
    resultTitle: { color: '#4CAF50', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
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
    foodItemCals: { color: '#4CAF50', fontSize: 14, flex: 1, textAlign: 'right', fontWeight: '600' },
    saveBtn: { backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
    discardBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    discardBtnText: { color: '#52525b', fontSize: 14, fontWeight: '500' },
});
