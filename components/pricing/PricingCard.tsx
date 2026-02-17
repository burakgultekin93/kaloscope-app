import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export function PricingCard() {
    const features = [
        'Unlimited AI Food Scans',
        'Detailed Macro Breakdown',
        'Personalized Diet Plans',
        'Ad-free Experience',
    ];

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Most Popular</Text>
                    </View>
                    <Text style={styles.planName}>Yearly Pro</Text>
                    <Text style={styles.planDesc}>Full access to AI analysis and advanced tracking.</Text>
                </View>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₺899</Text>
                    <Text style={styles.oldPrice}>₺1800</Text>
                    <Text style={styles.period}>/year</Text>
                </View>

                <View style={styles.featuresList}>
                    {features.map((feat, i) => (
                        <View key={i} style={styles.featureRow}>
                            <View style={styles.checkCircle}>
                                <Text style={styles.checkMark}>✓</Text>
                            </View>
                            <Text style={styles.featureText}>{feat}</Text>
                        </View>
                    ))}
                </View>

                <Link href="/register" asChild>
                    <TouchableOpacity style={styles.cta}>
                        <Text style={styles.ctaText}>Start 7-Day Free Trial</Text>
                    </TouchableOpacity>
                </Link>

                <Text style={styles.disclaimer}>Cancel anytime. No questions asked.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
    },
    header: {
        marginBottom: 24,
    },
    badge: {
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        marginBottom: 16,
    },
    badgeText: {
        color: '#22d3ee',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    planName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    planDesc: {
        color: '#a1a1aa',
        fontSize: 14,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
        marginBottom: 24,
    },
    price: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
    },
    oldPrice: {
        color: '#71717a',
        fontSize: 18,
        textDecorationLine: 'line-through',
        marginBottom: 4,
    },
    period: {
        color: '#a1a1aa',
        fontSize: 16,
        marginBottom: 4,
    },
    featuresList: {
        marginBottom: 24,
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkCircle: {
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkMark: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '700',
    },
    featureText: {
        color: '#d4d4d8',
        fontSize: 14,
    },
    cta: {
        backgroundColor: '#22d3ee',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    ctaText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 16,
    },
    disclaimer: {
        color: '#52525b',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
});
