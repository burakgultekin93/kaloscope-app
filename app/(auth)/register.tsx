import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, Platform, KeyboardAvoidingView,
    TouchableOpacity, StyleSheet, Animated, Dimensions
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { NeonInput } from '../../components/ui/NeonInput';

const { width } = Dimensions.get('window');
const isWide = width > 768;

export default function RegisterScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formOpacity = useRef(new Animated.Value(0)).current;
    const formTranslate = useRef(new Animated.Value(30)).current;
    const glowPulse = useRef(new Animated.Value(0.15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(formTranslate, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 0.35, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
                Animated.timing(glowPulse, { toValue: 0.15, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
            ])
        ).start();
    }, []);

    const handleRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } },
            });

            if (error) throw error;

            if (data.user) {
                // Create profile row
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    full_name: fullName,
                    language: 'en', // Default to EN or detect/ask
                    motivation_mode: true,
                    is_diabetic: false,
                    dietary_preferences: [],
                    health_focus: []
                });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Continue anyway, auth worked
                }

                router.replace('/(tabs)');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Ambient glow orbs */}
                <Animated.View style={[styles.glowOrb, styles.glowOrb1, { opacity: glowPulse }]} />
                <Animated.View style={[styles.glowOrb, styles.glowOrb2, { opacity: glowPulse }]} />

                {/* Back to home */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>

                <Animated.View style={[styles.formWrapper, { opacity: formOpacity, transform: [{ translateY: formTranslate }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logoIcon}>◉</Text>
                        <Text style={styles.title}>Create Your Account</Text>
                        <Text style={styles.subtitle}>
                            Start tracking smarter with <Text style={styles.accent}>KaloScope AI</Text>
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <NeonInput
                            label="Full Name"
                            placeholder="Your name"
                            value={fullName}
                            onChangeText={setFullName}
                        />

                        <NeonInput
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <NeonInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.submitBtnText}>
                                {loading ? 'Creating Account...' : 'Create Account →'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.switchText}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.switchLink}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>

                    {/* Trust info */}
                    <View style={styles.trustRow}>
                        <Text style={styles.trustItem}>🔒 Encrypted</Text>
                        <Text style={styles.trustDot}>•</Text>
                        <Text style={styles.trustItem}>7-day free trial</Text>
                        <Text style={styles.trustDot}>•</Text>
                        <Text style={styles.trustItem}>Cancel anytime</Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    glowOrb: {
        position: 'absolute',
        borderRadius: 999,
    },
    glowOrb1: {
        width: 300, height: 300,
        backgroundColor: '#8b5cf6',
        top: -60, right: -80,
    },
    glowOrb2: {
        width: 250, height: 250,
        backgroundColor: '#22d3ee',
        bottom: -40, left: -60,
    },
    backBtn: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 24 : 50,
        left: 24,
        zIndex: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    backBtnText: {
        color: '#71717a',
        fontSize: 14,
        fontWeight: '500',
    },
    formWrapper: {
        maxWidth: 420,
        width: '100%',
        alignSelf: 'center',
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoIcon: {
        color: '#22d3ee',
        fontSize: 36,
        fontWeight: '700',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    subtitle: {
        color: '#71717a',
        fontSize: 15,
        textAlign: 'center',
    },
    accent: {
        color: '#22d3ee',
        fontWeight: '600',
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 28,
    },
    errorBox: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    errorText: {
        color: '#f87171',
        textAlign: 'center',
        fontSize: 14,
    },
    submitBtn: {
        backgroundColor: '#22d3ee',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    dividerText: {
        color: '#52525b',
        fontSize: 13,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchText: {
        color: '#71717a',
        fontSize: 14,
    },
    switchLink: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '700',
    },
    trustRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
        flexWrap: 'wrap',
    },
    trustItem: {
        color: '#52525b',
        fontSize: 12,
    },
    trustDot: {
        color: '#3f3f46',
        fontSize: 12,
    },
});
