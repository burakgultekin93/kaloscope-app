import React, { useRef } from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, Animated, StyleSheet } from 'react-native';

interface NeonButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

export function NeonButton({ children, variant = 'primary', loading, style, ...props }: NeonButtonProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    const variantStyles = {
        primary: styles.primary,
        secondary: styles.secondary,
        outline: styles.outline,
    };

    const textStyles = {
        primary: styles.textPrimary,
        secondary: styles.textSecondary,
        outline: styles.textOutline,
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                style={[styles.base, variantStyles[variant], props.disabled && styles.disabled, style]}
                disabled={loading || props.disabled}
                {...props}
            >
                {loading ? (
                    <ActivityIndicator color={variant === 'primary' ? 'black' : 'white'} />
                ) : (
                    typeof children === 'string' ? (
                        <Text style={[styles.text, textStyles[variant]]}>{children}</Text>
                    ) : children
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderWidth: 1,
    },
    primary: {
        backgroundColor: '#22d3ee',
        borderColor: 'transparent',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    secondary: {
        backgroundColor: '#9333ea',
        borderColor: 'transparent',
        shadowColor: '#9333ea',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 8,
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(34, 211, 238, 0.5)',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        letterSpacing: 0.5,
    },
    textPrimary: {
        color: '#000',
        fontWeight: '700',
    },
    textSecondary: {
        color: '#fff',
        fontWeight: '700',
    },
    textOutline: {
        color: '#22d3ee',
        fontWeight: '600',
    },
});
