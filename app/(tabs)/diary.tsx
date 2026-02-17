import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Platform } from 'react-native';

export default function DiaryScreen() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Food Diary</Text>
                <Text style={styles.date}>{today}</Text>

                {/* Empty State */}
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📝</Text>
                    <Text style={styles.emptyTitle}>No meals logged yet</Text>
                    <Text style={styles.emptyDesc}>Scan your first meal to start building your food diary.</Text>
                </View>

                {/* Meal slots */}
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal, i) => (
                    <View key={i} style={styles.mealSlot}>
                        <View style={styles.mealHeader}>
                            <Text style={styles.mealIcon}>{['🌅', '☀️', '🌙', '🍿'][i]}</Text>
                            <Text style={styles.mealTitle}>{meal}</Text>
                        </View>
                        <View style={styles.mealEmpty}>
                            <Text style={styles.mealEmptyText}>No items • Tap + to add</Text>
                        </View>
                    </View>
                ))}
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
        marginBottom: 10,
    },
    mealIcon: { fontSize: 20 },
    mealTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
    mealEmpty: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    mealEmptyText: { color: '#3f3f46', fontSize: 13 },
});
