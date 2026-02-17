import React, { useEffect, useState } from 'react';
import {
    View, Text, SafeAreaView, ScrollView, StyleSheet,
    TouchableOpacity, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saveMeal } from '../lib/meals';
import { NutritionResult } from '../lib/openai';

export default function AnalysisResultScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [result, setResult] = useState<NutritionResult | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (params.resultJson) {
            try {
                setResult(JSON.parse(params.resultJson as string));
            } catch (e) {
                console.error('Failed to parse result', e);
            }
        }
    }, [params]);

    const handleSave = async () => {
        if (!result) return;
        setSaving(true);
        try {
            await saveMeal({
                food_name: result.food_name,
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fat: result.fat,
                meal_type: 'snack',
                ai_response: result,
            });

            Alert.alert('Success ✅', 'Meal saved to your diary!', [
                { text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)') },
            ]);
        } catch (e: any) {
            Alert.alert('Save Failed', e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!result) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color="#22d3ee" />
                    <Text style={styles.loadingText}>Loading analysis...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const confidenceColor = result.confidence === 'high' ? '#22c55e' : result.confidence === 'medium' ? '#f59e0b' : '#ef4444';

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
                        <Text style={styles.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Analysis Result</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Result Card */}
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.checkIcon}>✅</Text>
                        <Text style={styles.resultTitle}>Analysis Complete</Text>
                    </View>

                    <Text style={styles.foodName}>{result.food_name}</Text>

                    <View style={styles.confidenceBadge}>
                        <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                        <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                            {result.confidence} confidence
                        </Text>
                    </View>
                </View>

                {/* Macro Cards */}
                <View style={styles.macroGrid}>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🔥</Text>
                        <Text style={[styles.macroValue, { color: '#22d3ee' }]}>{result.calories}</Text>
                        <Text style={styles.macroLabel}>Calories</Text>
                    </View>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🥩</Text>
                        <Text style={[styles.macroValue, { color: '#22d3ee' }]}>{result.protein}g</Text>
                        <Text style={styles.macroLabel}>Protein</Text>
                    </View>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🍞</Text>
                        <Text style={[styles.macroValue, { color: '#3b82f6' }]}>{result.carbs}g</Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                    </View>
                    <View style={styles.macroCard}>
                        <Text style={styles.macroEmoji}>🧈</Text>
                        <Text style={[styles.macroValue, { color: '#8b5cf6' }]}>{result.fat}g</Text>
                        <Text style={styles.macroLabel}>Fat</Text>
                    </View>
                </View>

                {/* Details */}
                {result.details ? (
                    <View style={styles.detailsCard}>
                        <Text style={styles.detailsTitle}>🤖 AI Notes</Text>
                        <Text style={styles.detailsText}>{result.details}</Text>
                    </View>
                ) : null}

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator size="small" color="#000" />
                            <Text style={styles.saveBtnText}> Saving...</Text>
                        </View>
                    ) : (
                        <Text style={styles.saveBtnText}>💾 Save to Diary</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.discardBtn} onPress={() => router.back()}>
                    <Text style={styles.discardBtnText}>Discard & Scan Again</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 20 : 8,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    loadingState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#71717a',
        marginTop: 12,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backBtn: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    backBtnText: {
        color: '#71717a',
        fontSize: 14,
        fontWeight: '500',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    // Result Card
    resultCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    checkIcon: {
        fontSize: 20,
    },
    resultTitle: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    foodName: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    confidenceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    confidenceText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize',
    },

    // Macro Grid
    macroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    macroCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    macroEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    macroValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    macroLabel: {
        color: '#52525b',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },

    // Details
    detailsCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
    },
    detailsTitle: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    detailsText: {
        color: '#71717a',
        fontSize: 13,
        lineHeight: 20,
    },

    // Save Button
    saveBtn: {
        backgroundColor: '#22d3ee',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discardBtn: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    discardBtnText: {
        color: '#52525b',
        fontSize: 14,
        fontWeight: '500',
    },
});
