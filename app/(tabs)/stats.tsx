import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Platform } from 'react-native';
import { useI18n } from '../../lib/i18n';

export default function StatsScreen() {
    const { t } = useI18n();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = [0, 0, 0, 0, 0, 0, 0]; // Placeholder data

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{t('stats_title')}</Text>
                <Text style={styles.subtitle}>{t('stats_subtitle')}</Text>

                {/* Weekly Overview */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('this_week')}</Text>
                    <View style={styles.weekChart}>
                        {weekDays.map((day, i) => (
                            <View key={i} style={styles.barCol}>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, { height: `${weekData[i]}%` }]} />
                                </View>
                                <Text style={styles.barDay}>{day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Summary Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>{t('meals_logged')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#4CAF50' }]}>0</Text>
                        <Text style={styles.statLabel}>{t('avg_calories')}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#3b82f6' }]}>0</Text>
                        <Text style={styles.statLabel}>{t('day_streak')}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: '#8b5cf6' }]}>0</Text>
                        <Text style={styles.statLabel}>{t('ai_scans')}</Text>
                    </View>
                </View>

                {/* Empty State */}
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📊</Text>
                    <Text style={styles.emptyTitle}>{t('stats_empty_title')}</Text>
                    <Text style={styles.emptyDesc}>{t('stats_empty_desc')}</Text>
                </View>
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
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        color: '#52525b',
        fontSize: 14,
        marginBottom: 24,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 20,
    },
    weekChart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barCol: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    barTrack: {
        width: 24,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    barFill: {
        width: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 12,
    },
    barDay: {
        color: '#52525b',
        fontSize: 11,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        color: '#52525b',
        fontSize: 12,
        fontWeight: '500',
    },
    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginTop: 8,
    },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { color: '#a1a1aa', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    emptyDesc: { color: '#52525b', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
