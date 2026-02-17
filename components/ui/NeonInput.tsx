import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils'; // Assuming you strictly use 'cn' from utils

interface NeonInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export function NeonInput({ label, error, className, ...props }: NeonInputProps) {
    return (
        <View className="mb-4 space-y-2">
            <Text className="text-cyan-400 text-xs font-bold uppercase tracking-wider ml-1">
                {label}
            </Text>
            <TextInput
                placeholderTextColor="#6b7280"
                className={cn(
                    "bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white",
                    "focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)]",
                    error && "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
                    className
                )}
                {...props}
            />
            {error && <Text className="text-red-500 text-xs ml-1">{error}</Text>}
        </View>
    );
}
