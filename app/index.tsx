import React from 'react';
import { View, ScrollView, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function LandingPage() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <ScrollView style={styles.scroll}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.badge}>✨ AI-Powered Nutrition</Text>
                    <Text style={styles.title}>
                        Kaloscope
                    </Text>
                    <Text style={styles.subtitle}>
                        Snap a photo. Get instant calorie & macro analysis powered by AI.
                    </Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <Text style={styles.ctaText}>Get Started Free →</Text>
                    </TouchableOpacity>
                </View>

                {/* Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Why Kaloscope?</Text>
                    <View style={styles.featureGrid}>
                        {[
                            { icon: '📸', title: 'Snap & Analyze', desc: 'Take a photo of your meal, get instant nutritional breakdown' },
                            { icon: '🤖', title: 'AI-Powered', desc: 'GPT-4o Vision analyzes your food with incredible accuracy' },
                            { icon: '🇹🇷', title: 'Turkish Foods', desc: 'Extensive database of Turkish cuisine and local dishes' },
                            { icon: '📊', title: 'Track Progress', desc: 'Daily, weekly, and monthly nutrition tracking dashboards' },
                        ].map((feature, i) => (
                            <View key={i} style={styles.featureCard}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Start Free Today</Text>
                    <View style={styles.pricingCard}>
                        <Text style={styles.pricingBadge}>FREE BETA</Text>
                        <Text style={styles.pricingPrice}>₺0/mo</Text>
                        <Text style={styles.pricingDesc}>Unlimited scans • AI Analysis • Turkish Food DB</Text>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => router.push('/(auth)/register')}
                        >
                            <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scroll: {
        flex: 1,
    },
    hero: {
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 60,
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(34, 211, 238, 0.1)',
    },
    badge: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '600',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
    },
    title: {
        fontSize: 48,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: '#a1a1aa',
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 400,
        marginBottom: 32,
    },
    ctaButton: {
        backgroundColor: '#22d3ee',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 8,
    },
    ctaText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 32,
    },
    featureGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    featureCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 24,
        width: width > 600 ? '45%' : '100%',
        maxWidth: 350,
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    featureDesc: {
        fontSize: 14,
        color: '#71717a',
        lineHeight: 22,
    },
    pricingCard: {
        backgroundColor: 'rgba(34, 211, 238, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    pricingBadge: {
        color: '#22d3ee',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 16,
    },
    pricingPrice: {
        fontSize: 40,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 12,
    },
    pricingDesc: {
        color: '#71717a',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
});
