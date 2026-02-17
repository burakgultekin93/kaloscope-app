import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StyleSheet,
    TouchableOpacity, Animated, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { getRecentMeals, getTodayTotals, MealRow } from '../../lib/meals';

// ── Progress Bar ─────────────────────────────────────────────────
const MacroBar = ({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <View style={styles.macroBarItem}>
            <View style={styles.macroBarTrack}>
                <View style={[styles.macroBarFill, { backgroundColor: color, width: `${pct}%` }]} />
            </View>
            <Text style={[styles.macroBarValue, { color }]}>{Math.round(value)}<Text style={styles.macroBarUnit}>{unit}</Text></Text>
            <Text style={styles.macroBarLabel}>{label}</Text>
        </View>
    );
};

// ── Quick Action ─────────────────────────────────────────────────
const QuickAction = ({ icon, title, desc, onPress }: { icon: string; title: string; desc: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionDesc}>{desc}</Text>
        </View>
        <Text style={styles.actionArrow}>→</Text>
    </TouchableOpacity>
);

// ── Meal Row ─────────────────────────────────────────────────────
const MealItem = ({ meal }: { meal: MealRow }) => {
    const time = new Date(meal.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return (
        <View style={styles.mealItem}>
            <View style={styles.mealItemLeft}>
                <Text style={styles.mealItemName}>{meal.food_name}</Text>
                <Text style={styles.mealItemMeta}>{time} • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F</Text>
            </View>
            <View style={styles.mealItemRight}>
                <Text style={styles.mealItemCal}>{meal.calories}</Text>
                <Text style={styles.mealItemCalUnit}>kcal</Text>
            </View>
        </View>
    );
};

export default function HomeScreen() {
    const router = useRouter();
    const fadeIn = useRef(new Animated.Value(0)).current;
    const [userName, setUserName] = useState('');
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
    const [recentMeals, setRecentMeals] = useState<MealRow[]>([]);

    // Load data when screen is focused (so it refreshes after saving a meal)
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    useEffect(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();

        supabase.auth.getUser().then(({ data }) => {
            const name = data?.user?.user_metadata?.full_name || data?.user?.email?.split('@')[0] || 'User';
            setUserName(name);
        }).catch(() => setUserName('User'));
    }, []);

    const loadData = async () => {
        const [t, meals] = await Promise.all([
            getTodayTotals(),
            getRecentMeals(5),
        ]);
        setTotals(t);
        setRecentMeals(meals);
    };

    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={{ flex: 1, opacity: fadeIn }}>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 18 ? 'Afternoon' : 'Evening'} 👋</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateDay}>{dayName}</Text>
                            <Text style={styles.dateStr}>{dateStr}</Text>
                        </View>
                    </View>

                    {/* Today's Summary */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>Today's Nutrition</Text>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieBadgeText}>{totals.calories} / 2,000 kcal</Text>
                            </View>
                        </View>

                        <View style={styles.macroRow}>
                            <MacroBar value={totals.protein} max={150} color="#22d3ee" label="Protein" unit="g" />
                            <MacroBar value={totals.carbs} max={250} color="#3b82f6" label="Carbs" unit="g" />
                            <MacroBar value={totals.fat} max={65} color="#8b5cf6" label="Fat" unit="g" />
                        </View>

                        {totals.count === 0 && (
                            <Text style={styles.summaryHint}>📸 Scan your first meal to start tracking!</Text>
                        )}
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <QuickAction
                        icon="📸"
                        title="Scan Food"
                        desc="Take a photo for instant AI analysis"
                        onPress={() => router.push('/camera')}
                    />

                    {/* Recent Scans */}
                    {recentMeals.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Recent Scans</Text>
                            <View style={styles.recentCard}>
                                {recentMeals.map((meal, i) => (
                                    <React.Fragment key={meal.id}>
                                        <MealItem meal={meal} />
                                        {i < recentMeals.length - 1 && <View style={styles.separator} />}
                                    </React.Fragment>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Tip */}
                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>💡</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tipTitle}>Pro Tip</Text>
                            <Text style={styles.tipText}>For best accuracy, take photos in good lighting and include the full plate in frame.</Text>
                        </View>
                    </View>

                    <View style={{ height: 32 }} />
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 32 : 16,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
    },
    greeting: { color: '#71717a', fontSize: 14, marginBottom: 4 },
    userName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    dateChip: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    dateDay: { color: '#22d3ee', fontSize: 12, fontWeight: '700' },
    dateStr: { color: '#71717a', fontSize: 12, marginTop: 2 },

    // Summary
    summaryCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 28,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    summaryTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    calorieBadge: {
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    calorieBadgeText: { color: '#22d3ee', fontSize: 12, fontWeight: '700' },
    macroRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    summaryHint: { color: '#52525b', fontSize: 13, textAlign: 'center' },

    // Macro Bars
    macroBarItem: { flex: 1, alignItems: 'center' },
    macroBarTrack: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    macroBarFill: { height: '100%', borderRadius: 3 },
    macroBarValue: { fontSize: 22, fontWeight: '800' },
    macroBarUnit: { fontSize: 13, fontWeight: '500', color: '#71717a' },
    macroBarLabel: { color: '#52525b', fontSize: 12, marginTop: 2 },

    // Section
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },

    // Action Cards
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        gap: 14,
    },
    actionIcon: { fontSize: 28 },
    actionTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
    actionDesc: { color: '#71717a', fontSize: 13 },
    actionArrow: { color: '#3f3f46', fontSize: 18 },

    // Recent Scans
    recentCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    mealItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    mealItemLeft: { flex: 1 },
    mealItemName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    mealItemMeta: { color: '#52525b', fontSize: 12 },
    mealItemRight: { alignItems: 'flex-end' },
    mealItemCal: { color: '#22d3ee', fontSize: 20, fontWeight: '800' },
    mealItemCalUnit: { color: '#52525b', fontSize: 11 },
    separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 16 },

    // Tip
    tipCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(34, 211, 238, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.1)',
        borderRadius: 14,
        padding: 16,
        marginTop: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    tipIcon: { fontSize: 24 },
    tipTitle: { color: '#22d3ee', fontSize: 14, fontWeight: '700', marginBottom: 4 },
    tipText: { color: '#71717a', fontSize: 13, lineHeight: 20 },
});
