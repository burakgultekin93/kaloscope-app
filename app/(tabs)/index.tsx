import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StyleSheet,
    TouchableOpacity, Animated, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { getRecentMeals, getTodayTotals, getStreak, MealRow } from '../../lib/meals';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════════════
//  MACRO PIE CHART — Pure RN View-based donut chart
// ═══════════════════════════════════════════════════════════════════
const MacroPieChart = ({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) => {
    const total = protein + carbs + fat;
    const pP = total > 0 ? (protein / total) * 100 : 33;
    const pC = total > 0 ? (carbs / total) * 100 : 33;
    const pF = total > 0 ? (fat / total) * 100 : 34;

    return (
        <View style={pieStyles.container}>
            <View style={pieStyles.chart}>
                {/* Background ring */}
                <View style={pieStyles.ring} />

                {/* Center label */}
                <View style={pieStyles.center}>
                    <Text style={pieStyles.centerValue}>{total > 0 ? total.toFixed(0) : '—'}</Text>
                    <Text style={pieStyles.centerLabel}>grams</Text>
                </View>
            </View>

            {/* Legend */}
            <View style={pieStyles.legend}>
                <View style={pieStyles.legendItem}>
                    <View style={[pieStyles.legendDot, { backgroundColor: '#22d3ee' }]} />
                    <Text style={pieStyles.legendLabel}>Protein</Text>
                    <Text style={[pieStyles.legendValue, { color: '#22d3ee' }]}>{protein.toFixed(0)}g</Text>
                    <Text style={pieStyles.legendPct}>{pP.toFixed(0)}%</Text>
                </View>
                <View style={pieStyles.legendItem}>
                    <View style={[pieStyles.legendDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={pieStyles.legendLabel}>Carbs</Text>
                    <Text style={[pieStyles.legendValue, { color: '#3b82f6' }]}>{carbs.toFixed(0)}g</Text>
                    <Text style={pieStyles.legendPct}>{pC.toFixed(0)}%</Text>
                </View>
                <View style={pieStyles.legendItem}>
                    <View style={[pieStyles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                    <Text style={pieStyles.legendLabel}>Fat</Text>
                    <Text style={[pieStyles.legendValue, { color: '#8b5cf6' }]}>{fat.toFixed(0)}g</Text>
                    <Text style={pieStyles.legendPct}>{pF.toFixed(0)}%</Text>
                </View>
            </View>

            {/* Horizontal stacked bar (visual pie alternative) */}
            <View style={pieStyles.stackedBar}>
                <View style={[pieStyles.barSegment, { flex: pP || 1, backgroundColor: '#22d3ee', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
                <View style={[pieStyles.barSegment, { flex: pC || 1, backgroundColor: '#3b82f6' }]} />
                <View style={[pieStyles.barSegment, { flex: pF || 1, backgroundColor: '#8b5cf6', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
            </View>
        </View>
    );
};

const pieStyles = StyleSheet.create({
    container: { marginBottom: 4 },
    chart: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, height: 120 },
    ring: {
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 10, borderColor: 'rgba(255,255,255,0.04)',
        position: 'absolute',
    },
    center: { alignItems: 'center' },
    centerValue: { color: '#fff', fontSize: 28, fontWeight: '800' },
    centerLabel: { color: '#52525b', fontSize: 12 },
    legend: { gap: 10, marginBottom: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { color: '#a1a1aa', fontSize: 13, flex: 1 },
    legendValue: { fontSize: 14, fontWeight: '700' },
    legendPct: { color: '#52525b', fontSize: 12, width: 36, textAlign: 'right' },
    stackedBar: { flexDirection: 'row', height: 10, borderRadius: 6, overflow: 'hidden' },
    barSegment: { height: '100%' },
});

// ═══════════════════════════════════════════════════════════════════
//  WATER TRACKER — tap to add glasses, stored locally
// ═══════════════════════════════════════════════════════════════════
const WATER_GOAL = 8;

const WaterTracker = () => {
    const [glasses, setGlasses] = useState(0);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        AsyncStorage.getItem(`water_${today}`).then(val => {
            if (val) setGlasses(parseInt(val, 10));
        }).catch(() => { });
    }, []);

    const addGlass = async () => {
        const newVal = glasses + 1;
        setGlasses(newVal);
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`water_${today}`, String(newVal));
    };

    const removeGlass = async () => {
        if (glasses <= 0) return;
        const newVal = glasses - 1;
        setGlasses(newVal);
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`water_${today}`, String(newVal));
    };

    const pct = Math.min((glasses / WATER_GOAL) * 100, 100);

    return (
        <View style={waterStyles.container}>
            <View style={waterStyles.header}>
                <Text style={waterStyles.title}>💧 Water Intake</Text>
                <Text style={waterStyles.count}>
                    <Text style={waterStyles.countValue}>{glasses}</Text>/{WATER_GOAL} glasses
                </Text>
            </View>

            {/* Progress bar */}
            <View style={waterStyles.trackBar}>
                <View style={[waterStyles.trackFill, { width: `${pct}%` }]} />
            </View>

            {/* Glass dots */}
            <View style={waterStyles.dotsRow}>
                {Array.from({ length: WATER_GOAL }).map((_, i) => (
                    <View key={i} style={[waterStyles.dot, i < glasses && waterStyles.dotFilled]} />
                ))}
            </View>

            {/* Buttons */}
            <View style={waterStyles.btnRow}>
                <TouchableOpacity style={waterStyles.minusBtn} onPress={removeGlass}>
                    <Text style={waterStyles.minusBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={waterStyles.addBtn} onPress={addGlass}>
                    <Text style={waterStyles.addBtnText}>+ Add Glass</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const waterStyles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 20, marginBottom: 16,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    title: { color: '#fff', fontSize: 15, fontWeight: '700' },
    count: { color: '#52525b', fontSize: 13 },
    countValue: { color: '#38bdf8', fontWeight: '800', fontSize: 15 },
    trackBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
    trackFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: 3 },
    dotsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 14 },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
    dotFilled: { backgroundColor: '#38bdf8' },
    btnRow: { flexDirection: 'row', gap: 10 },
    minusBtn: {
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
    },
    minusBtnText: { color: '#52525b', fontSize: 18, fontWeight: '700' },
    addBtn: {
        flex: 1, backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)',
        borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    },
    addBtnText: { color: '#38bdf8', fontSize: 14, fontWeight: '700' },
});

// ═══════════════════════════════════════════════════════════════════
//  STREAK BADGE
// ═══════════════════════════════════════════════════════════════════
const StreakBadge = ({ streak }: { streak: number }) => (
    <View style={streakStyles.badge}>
        <Text style={streakStyles.fire}>🔥</Text>
        <Text style={streakStyles.count}>{streak}</Text>
        <Text style={streakStyles.label}>day{streak !== 1 ? 's' : ''}</Text>
    </View>
);

const streakStyles = StyleSheet.create({
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 1, borderColor: 'rgba(251, 146, 60, 0.2)',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    },
    fire: { fontSize: 16 },
    count: { color: '#fb923c', fontSize: 15, fontWeight: '800' },
    label: { color: '#9a6434', fontSize: 12, fontWeight: '500' },
});

// ═══════════════════════════════════════════════════════════════════
//  QUICK ACTION
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
//  MEAL ROW
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════════════════════
export default function HomeScreen() {
    const router = useRouter();
    const fadeIn = useRef(new Animated.Value(0)).current;
    const [userName, setUserName] = useState('');
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
    const [recentMeals, setRecentMeals] = useState<MealRow[]>([]);
    const [streak, setStreak] = useState(0);

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
        const [t, meals, s] = await Promise.all([
            getTodayTotals(),
            getRecentMeals(5),
            getStreak(),
        ]);
        setTotals(t);
        setRecentMeals(meals);
        setStreak(s);
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
                    {/* ── Header with Streak ── */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 18 ? 'Afternoon' : 'Evening'} 👋</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <StreakBadge streak={streak} />
                            <View style={styles.dateChip}>
                                <Text style={styles.dateDay}>{dayName}</Text>
                                <Text style={styles.dateStr}>{dateStr}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Calorie Summary ── */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>Today's Nutrition</Text>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieBadgeText}>{totals.calories} / 2,000 kcal</Text>
                            </View>
                        </View>

                        {/* Calorie progress bar */}
                        <View style={styles.calorieBar}>
                            <View style={[styles.calorieBarFill, { width: `${Math.min((totals.calories / 2000) * 100, 100)}%` }]} />
                        </View>

                        {totals.count === 0 && (
                            <Text style={styles.summaryHint}>📸 Scan your first meal to start tracking!</Text>
                        )}
                    </View>

                    {/* ── Macro Breakdown Chart ── */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Macro Breakdown</Text>
                        <MacroPieChart protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
                    </View>

                    {/* ── Water Tracker ── */}
                    <WaterTracker />

                    {/* ── Quick Actions ── */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <QuickAction
                        icon="📸"
                        title="Scan Food"
                        desc="Take a photo for instant AI analysis"
                        onPress={() => router.push('/camera')}
                    />

                    {/* ── Recent Scans ── */}
                    {recentMeals.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Scans</Text>
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

                    <View style={{ height: 32 }} />
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 32 : 16,
        maxWidth: 600, width: '100%', alignSelf: 'center',
    },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { color: '#71717a', fontSize: 14, marginBottom: 4 },
    userName: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    headerRight: { alignItems: 'flex-end', gap: 8 },
    dateChip: {
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'flex-end',
    },
    dateDay: { color: '#22d3ee', fontSize: 11, fontWeight: '700' },
    dateStr: { color: '#71717a', fontSize: 11, marginTop: 2 },

    // Summary
    summaryCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20, padding: 24, marginBottom: 16,
    },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    summaryTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    calorieBadge: {
        backgroundColor: 'rgba(34, 211, 238, 0.08)', borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
    },
    calorieBadgeText: { color: '#22d3ee', fontSize: 12, fontWeight: '700' },
    calorieBar: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    calorieBarFill: { height: '100%', backgroundColor: '#22d3ee', borderRadius: 4 },
    summaryHint: { color: '#52525b', fontSize: 13, textAlign: 'center', marginTop: 4 },

    // Chart
    chartCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20, padding: 24, marginBottom: 16,
    },
    chartTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },

    // Section
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },

    // Action Cards
    actionCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14, padding: 16, marginBottom: 10, gap: 14,
    },
    actionIcon: { fontSize: 28 },
    actionTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
    actionDesc: { color: '#71717a', fontSize: 13 },
    actionArrow: { color: '#3f3f46', fontSize: 18 },

    // Recent Scans
    recentCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16, overflow: 'hidden',
    },
    mealItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    mealItemLeft: { flex: 1 },
    mealItemName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    mealItemMeta: { color: '#52525b', fontSize: 12 },
    mealItemRight: { alignItems: 'flex-end' },
    mealItemCal: { color: '#22d3ee', fontSize: 20, fontWeight: '800' },
    mealItemCalUnit: { color: '#52525b', fontSize: 11 },
    separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 16 },
});
