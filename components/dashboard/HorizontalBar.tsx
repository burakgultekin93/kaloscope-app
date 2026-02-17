import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface ChartData {
    label: string;
    value: number;
    color: string;
}

const data: ChartData[] = [
    { label: 'Protein', value: 80, color: '#40D3F4' },
    { label: 'Carbs', value: 120, color: '#3b82f6' },
    { label: 'Fat', value: 60, color: '#9152EE' },
];

const BarItem = ({ item, index, maxValue }: { item: ChartData, index: number, maxValue: number }) => {
    const width = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(width, {
            toValue: (item.value / maxValue) * 100,
            duration: 1000,
            delay: index * 100,
            useNativeDriver: false,
        }).start();
    }, []);

    const animatedWidth = width.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.barContainer}>
            <View style={styles.barHeader}>
                <Text style={styles.barLabel}>{item.label}</Text>
                <Text style={styles.barValue}>{item.value}g</Text>
            </View>
            <View style={styles.barTrack}>
                <Animated.View
                    style={[
                        styles.barFill,
                        { backgroundColor: item.color, width: animatedWidth },
                    ]}
                />
            </View>
        </View>
    );
};

export const HorizontalBar = () => {
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2;

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Daily Macros</Text>
            <View>
                {data.map((item, index) => (
                    <BarItem key={item.label} item={item} index={index} maxValue={maxValue} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 24,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 24,
    },
    barContainer: {
        marginBottom: 16,
    },
    barHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    barLabel: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: '500',
    },
    barValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    barTrack: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 999,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 999,
    },
});
