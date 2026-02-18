import React, { useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StatusBar, StyleSheet,
    TouchableOpacity, Dimensions, Animated, Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isWide = width > 768;

// ─── Animated Counter Component ────────────────────────────────────
const AnimatedNumber = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const [display, setDisplay] = React.useState('0');

    useEffect(() => {
        anim.addListener(({ value }) => setDisplay(Math.floor(value).toLocaleString()));
        Animated.timing(anim, { toValue: target, duration: 2000, useNativeDriver: false }).start();
        return () => anim.removeAllListeners();
    }, []);

    return <Text style={styles.statNumber}>{display}{suffix}</Text>;
};

// ─── Feature Card ──────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.featureCard, { opacity, transform: [{ translateY }] }]}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDesc}>{desc}</Text>
        </Animated.View>
    );
};

// ─── Main Landing Page ─────────────────────────────────────────────
export default function LandingPage() {
    const router = useRouter();
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const heroTranslate = useRef(new Animated.Value(40)).current;
    const glowPulse = useRef(new Animated.Value(0.2)).current;

    useEffect(() => {
        // Hero entrance animation
        Animated.parallel([
            Animated.timing(heroOpacity, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(heroTranslate, { toValue: 0, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();

        // Ambient glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 0.5, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
                Animated.timing(glowPulse, { toValue: 0.2, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* ══════════════ HERO SECTION ══════════════ */}
                <View style={styles.heroSection}>
                    {/* Ambient glow orbs */}
                    <Animated.View style={[styles.glowOrb, styles.glowOrb1, { opacity: glowPulse }]} />
                    <Animated.View style={[styles.glowOrb, styles.glowOrb2, { opacity: glowPulse }]} />

                    {/* Navigation Bar */}
                    <View style={styles.navbar}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoIcon}>◉</Text>
                            <Text style={styles.logoText}>CalorieAI</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.navLoginBtn}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.navLoginText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Hero Content */}
                    <Animated.View style={[styles.heroContent, { opacity: heroOpacity, transform: [{ translateY: heroTranslate }] }]}>
                        <View style={styles.heroBadge}>
                            <View style={styles.badgeDot} />
                            <Text style={styles.heroBadgeText}>AI-Powered • GPT-4o Vision</Text>
                        </View>

                        <Text style={styles.heroTitle}>
                            Snap Your Meal.{'\n'}
                            <Text style={styles.heroTitleAccent}>Know Your Nutrition.</Text>
                        </Text>

                        <Text style={styles.heroSubtitle}>
                            The smartest way to track nutrition. Take a photo of any food and get instant AI-powered calorie & macro analysis in seconds.
                        </Text>

                        <View style={styles.heroCTARow}>
                            <TouchableOpacity
                                style={styles.primaryCTA}
                                onPress={() => router.push('/(auth)/register')}
                            >
                                <Text style={styles.primaryCTAText}>Start Free Trial →</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.secondaryCTA}
                                onPress={() => router.push('/(auth)/login')}
                            >
                                <Text style={styles.secondaryCTAText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Trust badges */}
                        <View style={styles.trustRow}>
                            <Text style={styles.trustText}>✓ No credit card required</Text>
                            <Text style={styles.trustDivider}>•</Text>
                            <Text style={styles.trustText}>✓ 7-day free trial</Text>
                            <Text style={styles.trustDivider}>•</Text>
                            <Text style={styles.trustText}>✓ Cancel anytime</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* ══════════════ STATS SECTION ══════════════ */}
                <View style={styles.statsSection}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <AnimatedNumber target={50000} suffix="+" />
                            <Text style={styles.statLabel}>Meals Analyzed</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <AnimatedNumber target={95} suffix="%" />
                            <Text style={styles.statLabel}>Accuracy Rate</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <AnimatedNumber target={2000} suffix="+" />
                            <Text style={styles.statLabel}>Turkish Foods</Text>
                        </View>
                    </View>
                </View>

                {/* ══════════════ HOW IT WORKS ══════════════ */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
                    <Text style={styles.sectionTitle}>Three Steps to Better Nutrition</Text>

                    <View style={styles.stepsRow}>
                        {[
                            { num: '01', icon: '📸', title: 'Snap', desc: 'Take a photo of your meal with your phone camera' },
                            { num: '02', icon: '🤖', title: 'Analyze', desc: 'AI identifies every food item and calculates nutrition' },
                            { num: '03', icon: '📊', title: 'Track', desc: 'View detailed breakdowns and track your daily progress' },
                        ].map((step, i) => (
                            <View key={i} style={styles.stepCard}>
                                <View style={styles.stepNumberRow}>
                                    <Text style={styles.stepNumber}>{step.num}</Text>
                                    <View style={styles.stepLine} />
                                </View>
                                <Text style={styles.stepIcon}>{step.icon}</Text>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDesc}>{step.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ══════════════ FEATURES ══════════════ */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>FEATURES</Text>
                    <Text style={styles.sectionTitle}>Everything You Need</Text>

                    <View style={styles.featuresGrid}>
                        <FeatureCard icon="🔬" title="Precision AI Analysis" desc="GPT-4o Vision identifies individual ingredients, cooking methods, and portion sizes for accurate results." delay={0} />
                        <FeatureCard icon="🇹🇷" title="Turkish Food Database" desc="Extensive database of 2000+ Turkish dishes — from lahmacun to mantı, all with verified nutritional data." delay={100} />
                        <FeatureCard icon="⚡" title="Instant Results" desc="Get detailed calorie, protein, carb, and fat breakdown in under 3 seconds." delay={200} />
                        <FeatureCard icon="📈" title="Progress Tracking" desc="Beautiful charts and insights to monitor your nutrition journey over time." delay={300} />
                        <FeatureCard icon="🎯" title="Goal Setting" desc="Set daily calorie and macro targets, get smart recommendations based on your goals." delay={400} />
                        <FeatureCard icon="🔒" title="Privacy First" desc="Your data is encrypted and never shared. Full GDPR compliance." delay={500} />
                    </View>
                </View>

                {/* ══════════════ PRICING ══════════════ */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>PRICING</Text>
                    <Text style={styles.sectionTitle}>Simple, Transparent Pricing</Text>

                    <View style={styles.pricingGrid}>
                        {/* Free Plan */}
                        <View style={styles.pricingCard}>
                            <Text style={styles.pricingPlanName}>Starter</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceAmount}>₺0</Text>
                                <Text style={styles.pricePeriod}>/month</Text>
                            </View>
                            <Text style={styles.pricingDesc}>Perfect for getting started</Text>
                            <View style={styles.pricingFeatures}>
                                {['3 AI scans per day', 'Basic nutrition data', 'Daily tracking'].map((f, i) => (
                                    <View key={i} style={styles.pricingFeatureRow}>
                                        <Text style={styles.checkmark}>✓</Text>
                                        <Text style={styles.pricingFeatureText}>{f}</Text>
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={styles.pricingCTA}
                                onPress={() => router.push('/(auth)/register')}
                            >
                                <Text style={styles.pricingCTAText}>Get Started Free</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Pro Plan */}
                        <View style={[styles.pricingCard, styles.pricingCardPro]}>
                            <View style={styles.proLabel}>
                                <Text style={styles.proLabelText}>MOST POPULAR</Text>
                            </View>
                            <Text style={[styles.pricingPlanName, { color: '#fff' }]}>Pro</Text>
                            <View style={styles.priceRow}>
                                <Text style={[styles.priceAmount, { color: '#22d3ee' }]}>₺149.99</Text>
                                <Text style={styles.pricePeriod}>/month</Text>
                            </View>
                            <Text style={styles.pricingDesc}>For serious nutrition trackers</Text>
                            <View style={styles.pricingFeatures}>
                                {['Unlimited AI scans', 'Detailed macro breakdown', 'Weekly & monthly reports', 'Custom meal plans', 'Priority support'].map((f, i) => (
                                    <View key={i} style={styles.pricingFeatureRow}>
                                        <Text style={[styles.checkmark, { color: '#22d3ee' }]}>✓</Text>
                                        <Text style={styles.pricingFeatureText}>{f}</Text>
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={styles.pricingCTAPro}
                                onPress={() => router.push('/(auth)/register')}
                            >
                                <Text style={styles.pricingCTAProText}>Start 7-Day Free Trial</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ══════════════ FINAL CTA ══════════════ */}
                <View style={styles.finalCTA}>
                    <Text style={styles.finalCTATitle}>Ready to Transform Your Nutrition?</Text>
                    <Text style={styles.finalCTADesc}>Join thousands of users who are already tracking smarter with AI.</Text>
                    <TouchableOpacity
                        style={styles.primaryCTA}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <Text style={styles.primaryCTAText}>Get Started Free →</Text>
                    </TouchableOpacity>
                </View>

                {/* ══════════════ FOOTER ══════════════ */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoIcon}>◉</Text>
                            <Text style={styles.logoText}>CalorieAI</Text>
                        </View>
                        <Text style={styles.footerText}>© 2025 KaloScope. AI-Powered Nutrition Tracking.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },

    // ── Hero ──
    heroSection: {
        paddingTop: Platform.OS === 'web' ? 0 : 40,
        paddingBottom: 60,
        backgroundColor: '#09090b',
        overflow: 'hidden',
        position: 'relative',
    },
    glowOrb: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowOrb1: {
        width: 400, height: 400,
        backgroundColor: '#22d3ee',
        top: -100, left: -100,
    },
    glowOrb2: {
        width: 300, height: 300,
        backgroundColor: '#8b5cf6',
        top: 100, right: -80,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        zIndex: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoIcon: {
        color: '#22d3ee',
        fontSize: 24,
        fontWeight: '700',
    },
    logoText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    navLoginBtn: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    navLoginText: {
        color: '#d4d4d8',
        fontSize: 14,
        fontWeight: '500',
    },
    heroContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        alignItems: 'center',
        zIndex: 10,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 32,
        gap: 8,
    },
    badgeDot: {
        width: 8, height: 8,
        borderRadius: 4,
        backgroundColor: '#22d3ee',
    },
    heroBadgeText: {
        color: '#22d3ee',
        fontSize: 13,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: isWide ? 56 : 36,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        lineHeight: isWide ? 64 : 44,
        letterSpacing: -1,
        marginBottom: 24,
    },
    heroTitleAccent: {
        color: '#22d3ee',
    },
    heroSubtitle: {
        fontSize: isWide ? 18 : 16,
        color: '#a1a1aa',
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 520,
        marginBottom: 40,
    },
    heroCTARow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    primaryCTA: {
        backgroundColor: '#22d3ee',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 10,
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryCTAText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryCTA: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 10,
    },
    secondaryCTAText: {
        color: '#d4d4d8',
        fontSize: 15,
        fontWeight: '600',
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    trustText: { color: '#71717a', fontSize: 13 },
    trustDivider: { color: '#3f3f46', fontSize: 13 },

    // ── Stats ──
    statsSection: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
    },
    statLabel: {
        color: '#71717a',
        fontSize: 13,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },

    // ── Sections ──
    section: {
        paddingHorizontal: 24,
        paddingVertical: 64,
    },
    sectionLabel: {
        color: '#22d3ee',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: isWide ? 36 : 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 48,
        letterSpacing: -0.5,
    },

    // ── Steps ──
    stepsRow: {
        flexDirection: isWide ? 'row' : 'column',
        gap: 24,
        maxWidth: 900,
        alignSelf: 'center',
        width: '100%',
    },
    stepCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 24,
    },
    stepNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    stepNumber: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '800',
    },
    stepLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
    },
    stepIcon: { fontSize: 36, marginBottom: 12 },
    stepTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
    stepDesc: { color: '#a1a1aa', fontSize: 14, lineHeight: 22 },

    // ── Features ──
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        maxWidth: 900,
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    featureCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 24,
        width: isWide ? '30%' : '100%',
        maxWidth: 340,
    },
    featureIcon: { fontSize: 32, marginBottom: 16 },
    featureTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 8 },
    featureDesc: { color: '#a1a1aa', fontSize: 14, lineHeight: 22 },

    // ── Pricing ──
    pricingGrid: {
        flexDirection: isWide ? 'row' : 'column',
        gap: 20,
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
    },
    pricingCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 32,
        position: 'relative',
    },
    pricingCardPro: {
        borderColor: 'rgba(34, 211, 238, 0.3)',
        backgroundColor: 'rgba(34, 211, 238, 0.04)',
    },
    proLabel: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        backgroundColor: '#22d3ee',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
    },
    proLabelText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },
    pricingPlanName: {
        color: '#d4d4d8',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        marginBottom: 8,
    },
    priceAmount: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '800',
    },
    pricePeriod: {
        color: '#71717a',
        fontSize: 16,
        marginBottom: 6,
    },
    pricingDesc: {
        color: '#71717a',
        fontSize: 14,
        marginBottom: 24,
    },
    pricingFeatures: {
        gap: 12,
        marginBottom: 28,
    },
    pricingFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkmark: {
        color: '#52525b',
        fontSize: 16,
        fontWeight: '700',
    },
    pricingFeatureText: {
        color: '#a1a1aa',
        fontSize: 14,
    },
    pricingCTA: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    pricingCTAText: {
        color: '#d4d4d8',
        fontWeight: '600',
        fontSize: 15,
    },
    pricingCTAPro: {
        backgroundColor: '#22d3ee',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    pricingCTAProText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 15,
    },

    // ── Final CTA ──
    finalCTA: {
        paddingVertical: 80,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    finalCTATitle: {
        fontSize: isWide ? 32 : 24,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    finalCTADesc: {
        color: '#71717a',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 400,
    },

    // ── Footer ──
    footer: {
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    footerContent: {
        alignItems: 'center',
        gap: 12,
    },
    footerText: {
        color: '#52525b',
        fontSize: 13,
    },
});
