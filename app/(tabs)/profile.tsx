import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data?.user);
        }).catch(() => { });
    }, []);

    const userName = user?.user_metadata?.full_name || 'User';
    const userEmail = user?.email || '';
    const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Profile</Text>

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

                {/* Settings Rows */}
                <Text style={styles.sectionLabel}>SETTINGS</Text>

                {[
                    { icon: '🎯', label: 'Daily Calorie Goal', value: '2,000 kcal' },
                    { icon: '🏋️', label: 'Activity Level', value: 'Moderate' },
                    { icon: '🌍', label: 'Language', value: 'English' },
                    { icon: '🔔', label: 'Notifications', value: 'On' },
                ].map((item, i) => (
                    <View key={i} style={styles.settingRow}>
                        <Text style={styles.settingIcon}>{item.icon}</Text>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingValue}>{item.value}</Text>
                    </View>
                ))}

                {/* About Section */}
                <Text style={[styles.sectionLabel, { marginTop: 28 }]}>ABOUT</Text>

                {[
                    { icon: '📱', label: 'App Version', value: '1.0.0-beta' },
                    { icon: '📄', label: 'Terms of Service', value: '' },
                    { icon: '🔒', label: 'Privacy Policy', value: '' },
                ].map((item, i) => (
                    <View key={i} style={styles.settingRow}>
                        <Text style={styles.settingIcon}>{item.icon}</Text>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        <Text style={styles.settingValue}>{item.value}</Text>
                    </View>
                ))}

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
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
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderWidth: 2,
        borderColor: '#22d3ee',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#22d3ee',
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
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    planBadgeText: {
        color: '#22d3ee',
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
    settingValue: { color: '#52525b', fontSize: 13, fontWeight: '500' },

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
