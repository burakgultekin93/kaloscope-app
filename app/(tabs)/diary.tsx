import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRecentMeals, FoodLogRow } from '../../lib/meals';
import { useI18n } from '../../lib/i18n';

export default function DiaryScreen() {
    const { t, lang } = useI18n();
    const [meals, setMeals] = useState<FoodLogRow[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    useFocusEffect(
        useCallback(() => {
            loadMeals();
        }, [])
    );

    const loadMeals = async () => {
        setLoading(true);
        const data = await getRecentMeals(50);
        const todayStr = new Date().toISOString().split('T')[0];
        setMeals(data.filter(m => m.created_at.startsWith(todayStr)));
        setLoading(false);
    };

    const mealTypes = [
        { label: t('breakfast'), icon: '🌅', key: 'breakfast' },
        { label: t('lunch'), icon: '☀️', key: 'lunch' },
        { label: t('dinner'), icon: '🌙', key: 'dinner' },
        { label: t('snacks'), icon: '🍿', key: 'snack' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{t('diary_title')}</Text>
                <Text style={styles.date}>{today}</Text>

                {loading ? (
                    <ActivityIndicator color="#22d3ee" style={{ marginTop: 40 }} />
                ) : meals.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📝</Text>
                        <Text style={styles.emptyTitle}>{t('no_meals_logged')}</Text>
                        <Text style={styles.emptyDesc}>{t('diary_empty_desc')}</Text>
                    </View>
                ) : null}

                {/* Meal slots */}
                {mealTypes.map((type, i) => {
                    const filtered = meals.filter(m => m.meal_type === type.key);
                    return (
                        <View key={i} style={styles.mealSlot}>
                            <View style={styles.mealHeader}>
                                <Text style={styles.mealIcon}>{type.icon}</Text>
                                <Text style={styles.mealTitle}>{type.label}</Text>
                            </View>

                            {filtered.length > 0 ? (
                                filtered.map(item => (
                                    <View key={item.id} style={styles.foodRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.foodName}>{item.food_name}</Text>
                                            <Text style={styles.foodMacros}>{item.protein}g P • {item.carbs}g C • {item.fat}g F</Text>
                                        </View>
                                        <Text style={styles.foodCals}>{item.calories} kcal</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.mealEmpty}>
                                    <Text style={styles.mealEmptyText}>{t('no_items_logged')}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
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
    date: {
        color: '#52525b',
        fontSize: 14,
        marginBottom: 24,
    },
    emptyCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        marginBottom: 28,
    },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
    emptyDesc: { color: '#71717a', fontSize: 14, textAlign: 'center', lineHeight: 22 },
    mealSlot: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
    },
    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
    },
    mealIcon: { fontSize: 20 },
    mealTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
    mealEmpty: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
    },
    mealEmptyText: { color: '#3f3f46', fontSize: 13 },
    foodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.04)',
    },
    foodName: { color: '#fff', fontSize: 14, fontWeight: '500', marginBottom: 2 },
    foodMacros: { color: '#52525b', fontSize: 12 },
    foodCals: { color: '#22d3ee', fontSize: 15, fontWeight: '700' },
});
