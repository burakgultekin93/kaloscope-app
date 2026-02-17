import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Platform, Switch, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { scheduleReminders } from '../../lib/notifications';
import { useI18n, Language } from '../../lib/i18n';

export default function ProfileScreen() {
    const router = useRouter();
    const { t, lang, setLanguage } = useI18n();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isDiabetic, setIsDiabetic] = useState(false);
    const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
    const [healthFocus, setHealthFocus] = useState<string[]>([]);
    const [kitchenPrefs, setKitchenPrefs] = useState<string[]>([]);
    const [culinaryGoals, setCulinaryGoals] = useState<string[]>([]);
    const [motivationMode, setMotivationMode] = useState(false);
    const [remindWater, setRemindWater] = useState(false);
    const [remindFruit, setRemindFruit] = useState(false);
    const [remindSnacks, setRemindSnacks] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (profile) {
                setIsDiabetic(!!profile.is_diabetic);
                setDietaryPrefs(profile.dietary_preferences || []);
                setHealthFocus(profile.health_focus || []);
                setKitchenPrefs(profile.kitchen_preferences || []);
                setCulinaryGoals(profile.culinary_goals || []);
                setMotivationMode(!!profile.motivation_mode);
                setRemindWater(!!profile.remind_water);
                setRemindFruit(!!profile.remind_fruit);
                setRemindSnacks(!!profile.remind_snacks);
                if (profile.language) {
                    setLanguage(profile.language as Language);
                }
            }
        }
        setLoading(false);
    };

    const updateProfile = async (updates: any) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user?.id);
            if (error) throw error;
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const toggleSetting = async (key: string, value: any, setter: (v: any) => void) => {
        setter(value);
        await updateProfile({ [key]: value });

        if (key.startsWith('remind_')) {
            const currentPrefs = {
                remind_water: key === 'remind_water' ? value : remindWater,
                remind_fruit: key === 'remind_fruit' ? value : remindFruit,
                remind_snacks: key === 'remind_snacks' ? value : remindSnacks,
            };
            await scheduleReminders(currentPrefs);
        }
    };

    const handleLangChange = async (newLang: Language) => {
        if (newLang === lang) return;
        setLanguage(newLang);
        await updateProfile({ language: newLang });
    };

    const toggleDiabeticMode = async (value: boolean) => {
        setIsDiabetic(value);
        await updateProfile({ is_diabetic: value });
    };

    const toggleDietaryPref = async (pref: string) => {
        const newPrefs = dietaryPrefs.includes(pref)
            ? dietaryPrefs.filter(p => p !== pref)
            : [...dietaryPrefs, pref];
        setDietaryPrefs(newPrefs);
        await updateProfile({ dietary_preferences: newPrefs });
    };

    const toggleHealthFocus = async (focus: string) => {
        const newFocus = healthFocus.includes(focus)
            ? healthFocus.filter(f => f !== focus)
            : [...healthFocus, focus];
        setHealthFocus(newFocus);
        await updateProfile({ health_focus: newFocus });
    };

    const toggleKitchenPref = async (pref: string) => {
        const newPrefs = kitchenPrefs.includes(pref)
            ? kitchenPrefs.filter(p => p !== pref)
            : [...kitchenPrefs, pref];
        setKitchenPrefs(newPrefs);
        await updateProfile({ kitchen_preferences: newPrefs });
    };

    const toggleCulinaryGoal = async (goal: string) => {
        const newGoals = culinaryGoals.includes(goal)
            ? culinaryGoals.filter(g => g !== goal)
            : [...culinaryGoals, goal];
        setCulinaryGoals(newGoals);
        await updateProfile({ culinary_goals: newGoals });
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        try {
            setSigningOut(true);
            await supabase.auth.signOut();
            // Global auth listener in _layout.tsx handles redirect to /(auth)/login
        } catch (error) {
            console.error('Sign out error:', error);
            setSigningOut(false);
        }
    };

    const DIETARY_OPTIONS = lang === 'tr'
        ? ['Glutensiz', 'Süt İçermeyen', 'Vejetaryen', 'Vegan', 'Keto', 'Paleo']
        : ['Gluten-free', 'Dairy-free', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];

    const HEALTH_OPTIONS = lang === 'tr'
        ? ['Kalp Sağlığı', 'Düşük Sodyum', 'Düşük Şeker', 'Anti-inflamatuar', 'Yüksek Lif']
        : ['Heart Healthy', 'Low Sodium', 'Low Sugar', 'Anti-inflammatory', 'High Fiber'];

    const KITCHEN_OPTIONS = lang === 'tr'
        ? ['Türk Mutfağı', 'İtalyan', 'Asya', 'Akdeniz', 'Pratik Yemekler', 'Gurme']
        : ['Turkish Cuisine', 'Italian', 'Asian', 'Mediterranean', 'Quick Meals', 'Gourmet'];

    const CULINARY_OPTIONS = lang === 'tr'
        ? ['Hızlı Hazırlık', 'Usta Şef Hedefi', 'Ekonomik', 'Yeni Malzemeler', 'Fırın Ustası']
        : ['Quick Prep', 'Master Chef Goal', 'Budget Friendly', 'New Ingredients', 'Baking Expert'];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color="#4CAF50" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>{t('profile_title')}</Text>

                {/* Avatar & User Info */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userEmail}>{userEmail}</Text>
                    <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>FREE BETA</Text>
                    </View>
                </View>

                {/* Motivation & Notifications Section */}
                <Text style={styles.sectionLabel}>{t('notifications_motivation')}</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingIcon}>💪</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.settingLabel}>{t('motivation_mode')}</Text>
                        <Text style={styles.settingSubLabel}>{t('motivation_mode_desc')}</Text>
                    </View>
                    <Switch
                        value={motivationMode}
                        onValueChange={(v) => toggleSetting('motivation_mode', v, setMotivationMode)}
                        trackColor={{ false: '#3f3f46', true: '#4CAF50' }}
                        thumbColor={Platform.OS === 'ios' ? '#fff' : motivationMode ? '#fff' : '#71717a'}
                    />
                </View>

                <View style={styles.notificationGroup}>
                    <View style={styles.notifItem}>
                        <Text style={styles.notifLabel}>💧 {t('water_reminder')}</Text>
                        <Switch
                            value={remindWater}
                            onValueChange={(v) => toggleSetting('remind_water', v, setRemindWater)}
                            trackColor={{ false: '#3f3f46', true: '#60a5fa' }}
                            thumbColor="#fff"
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                    <View style={styles.notifItem}>
                        <Text style={styles.notifLabel}>🍎 {t('fruit_reminder')}</Text>
                        <Switch
                            value={remindFruit}
                            onValueChange={(v) => toggleSetting('remind_fruit', v, setRemindFruit)}
                            trackColor={{ false: '#3f3f46', true: '#f87171' }}
                            thumbColor="#fff"
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                    <View style={styles.notifItem}>
                        <Text style={styles.notifLabel}>🍿 {t('snack_reminder')}</Text>
                        <Switch
                            value={remindSnacks}
                            onValueChange={(v) => toggleSetting('remind_snacks', v, setRemindSnacks)}
                            trackColor={{ false: '#3f3f46', true: '#fbbf24' }}
                            thumbColor="#fff"
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>
                </View>

                {/* Health & Nutrition Section */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t('health_nutrition')}</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingIcon}>🩺</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.settingLabel}>{t('diabetic_mode')}</Text>
                        <Text style={styles.settingSubLabel}>{t('diabetic_mode_desc')}</Text>
                    </View>
                    <Switch
                        value={isDiabetic}
                        onValueChange={toggleDiabeticMode}
                        trackColor={{ false: '#3f3f46', true: '#4CAF50' }}
                        thumbColor={Platform.OS === 'ios' ? '#fff' : isDiabetic ? '#fff' : '#71717a'}
                    />
                </View>

                <View style={styles.categoryCard}>
                    <Text style={styles.categoryTitle}>{t('dietary_prefs')}</Text>
                    <View style={styles.chipContainer}>
                        {DIETARY_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, dietaryPrefs.includes(opt) && styles.chipActive]}
                                onPress={() => toggleDietaryPref(opt)}
                            >
                                <Text style={[styles.chipText, dietaryPrefs.includes(opt) && styles.chipTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.categoryCard}>
                    <Text style={styles.categoryTitle}>{t('health_focus')}</Text>
                    <View style={styles.chipContainer}>
                        {HEALTH_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, healthFocus.includes(opt) && styles.chipActive]}
                                onPress={() => toggleHealthFocus(opt)}
                            >
                                <Text style={[styles.chipText, healthFocus.includes(opt) && styles.chipTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Kitchen & Culture Section */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t('kitchen_culture')}</Text>

                <View style={styles.categoryCard}>
                    <Text style={styles.categoryTitle}>{t('kitchen_prefs')}</Text>
                    <View style={styles.chipContainer}>
                        {KITCHEN_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, kitchenPrefs.includes(opt) && styles.chipActive]}
                                onPress={() => toggleKitchenPref(opt)}
                            >
                                <Text style={[styles.chipText, kitchenPrefs.includes(opt) && styles.chipTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.categoryCard}>
                    <Text style={styles.categoryTitle}>{t('culinary_goals')}</Text>
                    <View style={styles.chipContainer}>
                        {CULINARY_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.chip, culinaryGoals.includes(opt) && styles.chipActive]}
                                onPress={() => toggleCulinaryGoal(opt)}
                            >
                                <Text style={[styles.chipText, culinaryGoals.includes(opt) && styles.chipTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Settings Rows */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>{t('settings')}</Text>

                <View style={[styles.settingRow, { marginBottom: 12 }]}>
                    <Text style={styles.settingIcon}>🌍</Text>
                    <Text style={styles.settingLabel}>{t('language')}</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                            onPress={() => handleLangChange('tr')}
                            style={[styles.langBtn, lang === 'tr' && styles.langBtnActive]}
                        >
                            <Text style={[styles.langBtnText, lang === 'tr' && styles.langBtnTextActive]}>🇹🇷 TR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleLangChange('en')}
                            style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
                        >
                            <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>🇺🇸 EN</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {[
                    { icon: '🎯', label: t('daily_calorie_goal'), value: '2,000 kcal' },
                    { icon: '🏋️', label: t('activity_level'), value: 'Moderate' },
                ].map((item, i) => (
                    <View key={i} style={styles.settingRow}>
                        <Text style={styles.settingIcon}>{item.icon}</Text>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingValue}>{item.value}</Text>
                    </View>
                ))}

                {/* About Section */}
                <Text style={[styles.sectionLabel, { marginTop: 28 }]}>{t('about')}</Text>

                {[
                    { icon: '📱', label: t('app_version'), value: '1.0.0-beta' },
                    { icon: '📄', label: t('terms'), value: '' },
                    { icon: '🔒', label: t('privacy'), value: '' },
                ].map((item, i) => (
                    <View key={i} style={styles.settingRow}>
                        <Text style={styles.settingIcon}>{item.icon}</Text>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingValue}>{item.value}</Text>
                    </View>
                ))}

                {/* Sign Out */}
                <TouchableOpacity
                    style={[styles.signOutBtn, signingOut && { opacity: 0.7 }]}
                    onPress={handleSignOut}
                    disabled={signingOut}
                >
                    {signingOut ? (
                        <ActivityIndicator color="#f87171" />
                    ) : (
                        <Text style={styles.signOutText}>{t('sign_out')}</Text>
                    )}
                </TouchableOpacity>

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
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },
    pageTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 24,
    },

    // Profile Card
    profileCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        marginBottom: 28,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        borderColor: '#4CAF50',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#4CAF50',
        fontSize: 24,
        fontWeight: '800',
    },
    userName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    userEmail: {
        color: '#52525b',
        fontSize: 14,
        marginBottom: 12,
    },
    planBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    planBadgeText: {
        color: '#4CAF50',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Section
    sectionLabel: {
        color: '#3f3f46',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 12,
    },

    // Setting Rows
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 6,
        gap: 12,
    },
    settingIcon: { fontSize: 18 },
    settingLabel: { color: '#d4d4d8', fontSize: 14, flex: 1 },
    settingSubLabel: { color: '#52525b', fontSize: 11 },
    settingValue: { color: '#52525b', fontSize: 13, fontWeight: '500' },

    langToggle: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    langToggleText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },

    // Notifications
    notificationGroup: {
        backgroundColor: 'rgba(255,255,255,0.01)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
        padding: 5,
        marginBottom: 12,
    },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    notifLabel: {
        color: '#a1a1aa',
        fontSize: 13,
    },

    // Category Cards
    categoryCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    categoryTitle: {
        color: '#a1a1aa',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    chipActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    chipText: {
        color: '#71717a',
        fontSize: 13,
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#4CAF50',
        fontWeight: '700',
    },

    // Language Buttons
    langBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    langBtnActive: {
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        borderColor: '#4CAF50',
    },
    langBtnText: {
        color: '#71717a',
        fontSize: 13,
        fontWeight: '500',
    },
    langBtnTextActive: {
        color: '#4CAF50',
        fontWeight: '700',
    },

    // Sign Out
    signOutBtn: {
        marginTop: 28,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.06)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    signOutText: {
        color: '#f87171',
        fontSize: 15,
        fontWeight: '600',
    },
});
