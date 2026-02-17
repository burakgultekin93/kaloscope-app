import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { cn } from '../../lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

// --- Reusable Grid Item Component ---
// In RN, we simulate the "mouse move" effect with a continuous ambient pulse
// since precise mouse tracking isn't applicable/performant in the same way on touch
export const BioluminescentGridItem = ({ className, children, delay = 0 }: { className?: string, children: React.ReactNode, delay?: number }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View className={cn("relative overflow-hidden bg-black/80 rounded-xl border border-white/10 p-1", className)}>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: '#40D3F4', // Cyan pulse
                        zIndex: -1,
                    },
                    animatedStyle
                ]}
            />
            <View className="bg-black rounded-lg w-full h-full z-10 p-4">
                {children}
            </View>
        </View>
    );
};

// --- Main Grid Container Component ---
export const BioluminescentHero = ({ className }: { className?: string }) => {
    return (
        <View className={cn("flex-1 bg-black items-center justify-center p-4", className)}>
            <View className="absolute inset-0">
                <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%"
                            cy="20%"
                            rx="60%"
                            ry="40%"
                            fx="50%"
                            fy="20%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0" stopColor="#40D3F4" stopOpacity="0.15" />
                            <Stop offset="1" stopColor="black" stopOpacity="1" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg>
            </View>

            <View className="items-center space-y-4 pt-10">
                <View className="bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-4">
                    <Text className="text-cyan-400 font-semibold text-xs tracking-wider uppercase">
                        AI-Powered Nutrition
                    </Text>
                </View>

                <Text className="text-5xl font-bold text-white text-center leading-tight">
                    Shape Your <Text className="text-cyan-400">Dream Body</Text> using AI
                </Text>

                <Text className="text-gray-400 text-center max-w-sm mt-4 text-base leading-6">
                    Analyze meals instantly with a single photo. Track calories and macros with precision.
                </Text>

                <View className="flex-row mt-8 space-x-4">
                    <Link href="/register" asChild>
                        <TouchableOpacity className="bg-cyan-500 rounded-full px-8 py-4 shadow-lg shadow-cyan-500/30">
                            <Text className="text-black font-bold text-base">Get Started Free</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    );
};
