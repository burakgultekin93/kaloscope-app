import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useI18n } from '../../lib/i18n';
import { getWeeklyStats } from '../../lib/meals';

export default function StatsScreen() {
    const { t } = useI18n();
    const [loading, setLoading] = useState(true);
    const [weekData, setWeekData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [totalMeals, setTotalMeals] = useState(0);
    const [avgCalories, setAvgCalories] = useState(0);
    const [streak, setStreak] = useState(0);
    const [totalScans, setTotalScans] = useState(0);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        setLoading(true);
        try {
            const stats = await getWeeklyStats();
            setWeekData(stats.dailyCalories);
            setTotalMeals(stats.totalMeals);
            setAvgCalories(stats.avgCalories);
            setStreak(stats.streak);
            setTotalScans(stats.totalScans);
        } catch (e) {
            console.error('Failed to load stats:', e);
        } finally {
            setLoading(false);
        }
    };

    const maxCal = Math.max(...weekData, 1); // avoid division by zero

    // Determine today's index (Mon=0 ... Sun=6)
    const todayIdx = (() => {
        const d = new Date().getDay();
        return d === 0 ? 6 : d - 1;
    })();

    const hasData = totalMeals > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{t('stats_title')}</Text>
                <Text style={styles.subtitle}>{t('stats_subtitle')}</Text>

                {loading ? (
                    <ActivityIndicator color="#22d3ee" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Weekly Bar Chart */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{t('this_week')}</Text>
                                {hasData && (
                                    <Text style={styles.cardBadge}>
                                        {weekData.reduce((a, b) => a + b, 0).toLocaleString()} kcal
                                    </Text>
                                )}
                            </View>
                            <View style={styles.weekChart}>
                                {weekDays.map((day, i) => {
                                    const pct = maxCal > 0 ? (weekData[i] / maxCal) * 100 : 0;
                                    const isToday = i === todayIdx;
                                    return (
                                        <View key={i} style={styles.barCol}>
                                            {weekData[i] > 0 && (
                                                <Text style={styles.barValue}>{weekData[i]}</Text>
                                            )}
                                            <View style={styles.barTrack}>
                                                <View
                                                    style={[
                                                        styles.barFill,
                                                        { height: `${Math.max(pct, 3)}%` },
                                                        isToday && styles.barFillToday,
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[styles.barDay, isToday && styles.barDayToday]}>{day}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Stat Cards */}
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>🍽️</Text>
                                <Text style={styles.statValue}>{totalMeals}</Text>
                                <Text style={styles.statLabel}>{t('meals_logged')}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>🔥</Text>
                                <Text style={[styles.statValue, { color: '#22d3ee' }]}>{avgCalories}</Text>
                                <Text style={styles.statLabel}>{t('avg_calories')}</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>⚡</Text>
                                <Text style={[styles.statValue, { color: '#fb923c' }]}>{streak}</Text>
                                <Text style={styles.statLabel}>{t('day_streak')}</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>🤖</Text>
                                <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{totalScans}</Text>
                                <Text style={styles.statLabel}>{t('ai_scans')}</Text>
                            </View>
                        </View>

                        {/* Empty state hint */}
                        {!hasData && (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyIcon}>📊</Text>
                                <Text style={styles.emptyTitle}>{t('stats_empty_title')}</Text>
                                <Text style={styles.emptyDesc}>{t('stats_empty_desc')}</Text>
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 32 : 16,
        paddingBottom: 32,
        maxWidth: 600, width: '100%', alignSelf: 'center',
    },
    title: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
    subtitle: { color: '#52525b', fontSize: 14, marginBottom: 24 },

    // Card
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20, padding: 24, marginBottom: 16,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    cardBadge: { color: '#22d3ee', fontSize: 13, fontWeight: '700' },

    // Week Chart
    weekChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
    barCol: { flex: 1, alignItems: 'center', gap: 6 },
    barValue: { color: '#52525b', fontSize: 10, fontWeight: '600' },
    barTrack: {
        width: 28, height: 100, backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14, justifyContent: 'flex-end', overflow: 'hidden',
    },
    barFill: { width: '100%', backgroundColor: '#22d3ee', borderRadius: 14, opacity: 0.6 },
    barFillToday: { opacity: 1, backgroundColor: '#22d3ee' },
    barDay: { color: '#52525b', fontSize: 11, fontWeight: '600' },
    barDayToday: { color: '#22d3ee', fontWeight: '800' },

    // Stat Cards
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, alignItems: 'center',
    },
    statEmoji: { fontSize: 24, marginBottom: 8 },
    statValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 4 },
    statLabel: { color: '#52525b', fontSize: 12, fontWeight: '500' },

    // Empty State
    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 8,
    },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { color: '#a1a1aa', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    emptyDesc: { color: '#52525b', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
