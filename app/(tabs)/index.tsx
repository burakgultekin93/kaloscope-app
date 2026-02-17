import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StyleSheet,
    TouchableOpacity, Animated, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { getRecentMeals, getTodayTotals, getStreak, FoodLogRow } from '../../lib/meals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../../lib/i18n';
import { getTodayWater, saveWaterLog } from '../../lib/meals';

// ═══════════════════════════════════════════════════════════════════
//  MACRO PIE CHART
// ═══════════════════════════════════════════════════════════════════
const MacroPieChart = ({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) => {
    const { t } = useI18n();
    const total = protein + carbs + fat;
    const pP = total > 0 ? (protein / total) * 100 : 33;
    const pC = total > 0 ? (carbs / total) * 100 : 33;
    const pF = total > 0 ? (fat / total) * 100 : 34;

    return (
        <View style={pieStyles.container}>
            <View style={pieStyles.chart}>
                <View style={pieStyles.ring} />
                <View style={pieStyles.center}>
                    <Text style={pieStyles.centerValue}>{total > 0 ? total.toFixed(0) : '—'}</Text>
                    <Text style={pieStyles.centerLabel}>grams</Text>
                </View>
            </View>

            <View style={pieStyles.legend}>
                <View style={pieStyles.legendItem}>
                    <View style={[pieStyles.legendDot, { backgroundColor: '#22d3ee' }]} />
                    <Text style={pieStyles.legendLabel}>{t('protein')}</Text>
                    <Text style={[pieStyles.legendValue, { color: '#22d3ee' }]}>{protein.toFixed(0)}g</Text>
                    <Text style={pieStyles.legendPct}>{pP.toFixed(0)}%</Text>
                </View>
                <View style={pieStyles.legendItem}>
                    <View style={[pieStyles.legendDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={pieStyles.legendLabel}>{t('carbs')}</Text>
                    <Text style={[pieStyles.legendValue, { color: '#3b82f6' }]}>{carbs.toFixed(0)}g</Text>
                    <Text style={pieStyles.legendPct}>{pC.toFixed(0)}%</Text>
                </View>
                <View style={pieStyles.legendItem}>
                    <View style={[pieStyles.legendDot, { backgroundColor: '#8b5cf6' }]} />
                    <Text style={pieStyles.legendLabel}>{t('fat')}</Text>
                    <Text style={[pieStyles.legendValue, { color: '#8b5cf6' }]}>{fat.toFixed(0)}g</Text>
                    <Text style={pieStyles.legendPct}>{pF.toFixed(0)}%</Text>
                </View>
            </View>

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

const WATER_GOAL = 8;
const ML_PER_GLASS = 250;

const WaterTracker = () => {
    const { t } = useI18n();
    const [totalMl, setTotalMl] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadWater();
        }, [])
    );

    const loadWater = async () => {
        const ml = await getTodayWater();
        setTotalMl(ml);
    };

    const addGlass = async () => {
        try {
            await saveWaterLog(ML_PER_GLASS);
            setTotalMl(prev => prev + ML_PER_GLASS);
        } catch (error) {
            console.error('Error adding water:', error);
        }
    };

    const glasses = Math.floor(totalMl / ML_PER_GLASS);
    const pct = Math.min((totalMl / (WATER_GOAL * ML_PER_GLASS)) * 100, 100);

    return (
        <View style={waterStyles.container}>
            <View style={waterStyles.header}>
                <Text style={waterStyles.title}>💧 {t('water_intake')}</Text>
                <Text style={waterStyles.count}>
                    <Text style={waterStyles.countValue}>{glasses}</Text>/{WATER_GOAL} {t('glasses')}
                </Text>
            </View>

            <View style={waterStyles.trackBar}>
                <View style={[waterStyles.trackFill, { width: `${pct}%` }]} />
            </View>

            <View style={waterStyles.dotsRow}>
                {Array.from({ length: WATER_GOAL }).map((_, i) => (
                    <View key={i} style={[waterStyles.dot, i < glasses && waterStyles.dotFilled]} />
                ))}
            </View>

            <View style={waterStyles.btnRow}>
                <TouchableOpacity style={waterStyles.addBtn} onPress={addGlass}>
                    <Text style={waterStyles.addBtnText}>{t('add_water')}</Text>
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
    countValue: { color: '#66BB6A', fontWeight: '800', fontSize: 15 },
    trackBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
    trackFill: { height: '100%', backgroundColor: '#66BB6A', borderRadius: 3 },
    dotsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 14 },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
    dotFilled: { backgroundColor: '#66BB6A' },
    btnRow: { flexDirection: 'row', gap: 10 },
    addBtn: {
        flex: 1, backgroundColor: 'rgba(102, 187, 106, 0.1)',
        borderWidth: 1, borderColor: 'rgba(102, 187, 106, 0.2)',
        borderRadius: 10, paddingVertical: 10, alignItems: 'center',
    },
    addBtnText: { color: '#66BB6A', fontSize: 14, fontWeight: '700' },
});

const StreakBadge = ({ streak }: { streak: number }) => {
    const { lang } = useI18n();
    return (
        <View style={streakStyles.badge}>
            <Text style={streakStyles.fire}>🔥</Text>
            <Text style={streakStyles.count}>{streak}</Text>
            <Text style={streakStyles.label}>{lang === 'tr' ? 'gün' : `day${streak !== 1 ? 's' : ''}`}</Text>
        </View>
    );
};

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

const MealItem = ({ meal }: { meal: FoodLogRow }) => {
    const { lang } = useI18n();
    const time = new Date(meal.created_at).toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
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

const MotivationWidget = ({ name }: { name: string }) => {
    const { t, lang } = useI18n();
    const [quote, setQuote] = useState('');

    const quotesTR = [
        "Bugün harika bir seçim yapmaya ne dersin? 🌱",
        "Her sağlıklı öğün, kendine verdiğin bir sözdür. 💪",
        "Su içmeyi unutma, parlamaya devam et! 💧",
        "Küçük adımlar, büyük değişimler yaratır. ✨",
        "Vücuduna iyi bak, yaşayacak tek yerin orası. 🍎",
        "Enerjin seçimlerinden gelir. Doğru olanı seç! ⚡"
    ];

    const quotesEN = [
        "How about making a great choice today? 🌱",
        "Every healthy meal is a promise to yourself. 💪",
        "Don't forget to drink water, keep shining! 💧",
        "Small steps create big changes. ✨",
        "Take care of your body, it's the only place you have to live. 🍎",
        "Your energy comes from your choices. Choose the right one! ⚡"
    ];

    useEffect(() => {
        const qList = lang === 'tr' ? quotesTR : quotesEN;
        const randomQuote = qList[Math.floor(Math.random() * qList.length)];
        setQuote(randomQuote);
    }, [lang]);

    return (
        <View style={motivationStyles.container}>
            <View style={motivationStyles.header}>
                <Text style={motivationStyles.emoji}>🌟</Text>
                <Text style={motivationStyles.title}>{t('motivation_title')}</Text>
            </View>
            <Text style={motivationStyles.quote}>"{quote}"</Text>
            <Text style={motivationStyles.footer}>{t('motivation_footer', { name })}</Text>
        </View>
    );
};

const motivationStyles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20, padding: 20, marginBottom: 16,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    emoji: { fontSize: 20 },
    title: { color: '#22d3ee', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
    quote: { color: '#fff', fontSize: 16, fontWeight: '600', fontStyle: 'italic', lineHeight: 24, marginBottom: 12 },
    footer: { color: '#71717a', fontSize: 12, fontWeight: '500' },
});

export default function HomeScreen() {
    const { t, lang } = useI18n();
    const router = useRouter();
    const fadeIn = useRef(new Animated.Value(0)).current;
    const [userName, setUserName] = useState('');
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
    const [recentMeals, setRecentMeals] = useState<FoodLogRow[]>([]);
    const [streak, setStreak] = useState(0);
    const [motivationMode, setMotivationMode] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    useEffect(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                setUserName(name);

                supabase.from('profiles').select('motivation_mode').eq('id', user.id).single()
                    .then(({ data }) => {
                        if (data) setMotivationMode(!!data.motivation_mode);
                    });
            }
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
    const dayName = today.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', day: 'numeric' });

    const getGreeting = () => {
        const hour = today.getHours();
        if (hour < 12) return t('greeting_morning');
        if (hour < 18) return t('greeting_afternoon');
        return t('greeting_evening');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={{ flex: 1, opacity: fadeIn }}>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
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

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryTitle}>{t('todays_nutrition')}</Text>
                            <View style={styles.calorieBadge}>
                                <Text style={styles.calorieBadgeText}>{totals.calories} / 2,000 kcal</Text>
                            </View>
                        </View>

                        <View style={styles.calorieBar}>
                            <View style={[styles.calorieBarFill, { width: `${Math.min((totals.calories / 2000) * 100, 100)}%` }]} />
                        </View>

                        {totals.count === 0 && (
                            <Text style={styles.summaryHint}>📸 {lang === 'tr' ? 'İlk öğününü tara ve takibe başla!' : 'Scan your first meal to start tracking!'}</Text>
                        )}
                    </View>

                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>{t('macro_breakdown')}</Text>
                        <MacroPieChart protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
                    </View>

                    {motivationMode && <MotivationWidget name={userName} />}
                    <WaterTracker />

                    <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>

                    <QuickAction
                        icon="📸"
                        title={t('scan_food')}
                        desc={t('scan_food_desc')}
                        onPress={() => router.push('/camera')}
                    />

                    <QuickAction
                        icon="🍳"
                        title={t('recipe_assistant')}
                        desc={t('recipe_assistant_desc')}
                        onPress={() => router.push('/recipe-assistant')}
                    />

                    {recentMeals.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('recent_scans')}</Text>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 32 : 16,
        maxWidth: 600, width: '100%', alignSelf: 'center',
    },
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
    chartCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20, padding: 24, marginBottom: 16,
    },
    chartTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
    actionCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14, padding: 16, marginBottom: 10, gap: 14,
    },
    actionIcon: { fontSize: 28 },
    actionTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
    actionDesc: { color: '#71717a', fontSize: 13 },
    actionArrow: { color: '#3f3f46', fontSize: 18 },
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
