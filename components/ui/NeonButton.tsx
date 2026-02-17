import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { cn } from '../../lib/utils';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface NeonButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function NeonButton({ children, variant = 'primary', loading, className, ...props }: NeonButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const variants = {
        primary: "bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)] border-transparent",
        secondary: "bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)] border-transparent",
        outline: "bg-transparent border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]",
    };

    const textVariants = {
        primary: "text-black font-bold",
        secondary: "text-white font-bold",
        outline: "text-cyan-400 font-semibold",
    };

    return (
        <AnimatedTouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            className={cn(
                "py-4 rounded-xl items-center justify-center flex-row border",
                variants[variant],
                props.disabled && "opacity-50",
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'black' : 'white'} />
            ) : (
                <Text className={cn("text-base tracking-wide", textVariants[variant])}>
                    {children}
                </Text>
            )}
        </AnimatedTouchableOpacity>
    );
}
