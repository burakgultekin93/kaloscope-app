import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Link } from 'expo-router';

export const BioluminescentHero = ({ style }: { style?: any, className?: string }) => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={[styles.container, style]}>
            {/* Ambient glow */}
            <Animated.View style={[styles.glow, { opacity: pulseAnim }]} />

            <View style={styles.content}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>AI-Powered Nutrition</Text>
                </View>

                <Text style={styles.title}>
                    Shape Your <Text style={styles.titleAccent}>Dream Body</Text> using AI
                </Text>

                <Text style={styles.subtitle}>
                    Analyze meals instantly with a single photo. Track calories and macros with precision.
                </Text>

                <Link href="/register" asChild>
                    <TouchableOpacity style={styles.cta}>
                        <Text style={styles.ctaText}>Get Started Free</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        minHeight: 500,
    },
    glow: {
        position: 'absolute',
        top: 0, left: '20%', right: '20%',
        height: 200,
        backgroundColor: '#40D3F4',
        borderRadius: 999,
    },
    content: {
        alignItems: 'center',
        paddingTop: 40,
        zIndex: 10,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 16,
    },
    badgeText: {
        color: '#22d3ee',
        fontWeight: '600',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        lineHeight: 48,
        marginBottom: 16,
    },
    titleAccent: {
        color: '#22d3ee',
    },
    subtitle: {
        color: '#a1a1aa',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 350,
        marginBottom: 32,
    },
    cta: {
        backgroundColor: '#22d3ee',
        borderRadius: 30,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    ctaText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
});
