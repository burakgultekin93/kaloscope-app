import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { cn } from '../../lib/utils';

// Since Reaviz is web-only, we implement a custom animated bar chart for RN
interface ChartData {
    label: string;
    value: number;
    color: string;
}

const data: ChartData[] = [
    { label: 'Protein', value: 80, color: '#40D3F4' }, // Cyan
    { label: 'Carbs', value: 120, color: '#3b82f6' },  // Blue
    { label: 'Fat', value: 60, color: '#9152EE' },     // Purple
];

const BarItem = ({ item, index, maxValue }: { item: ChartData, index: number, maxValue: number }) => {
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withDelay(index * 100, withTiming((item.value / maxValue) * 100, { duration: 1000 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${width.value}%`,
    }));

    return (
        <View className="mb-4">
            <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400 text-sm font-medium">{item.label}</Text>
                <Text className="text-white text-sm font-bold">{item.value}g</Text>
            </View>
            <View className="h-3 bg-white/5 rounded-full overflow-hidden">
                <Animated.View
                    style={[
                        { height: '100%', backgroundColor: item.color, borderRadius: 999 },
                        animatedStyle
                    ]}
                />
            </View>
        </View>
    );
};

export const HorizontalBar = () => {
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2; // 20% buffer

    return (
        <View className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-lg">
            <Text className="text-white text-lg font-bold mb-6">Daily Macros</Text>
            <View>
                {data.map((item, index) => (
                    <BarItem key={item.label} item={item} index={index} maxValue={maxValue} />
                ))}
            </View>
        </View>
    );
};
