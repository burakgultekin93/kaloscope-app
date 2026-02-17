import React from 'react';
import { TextInput, View, Text, TextInputProps, StyleSheet } from 'react-native';

interface NeonInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export function NeonInput({ label, error, style, ...props }: NeonInputProps) {
    return (
        <View style={inputStyles.container}>
            <Text style={inputStyles.label}>{label}</Text>
            <TextInput
                placeholderTextColor="#6b7280"
                style={[
                    inputStyles.input,
                    error && inputStyles.inputError,
                    style,
                ]}
                {...props}
            />
            {error && <Text style={inputStyles.errorText}>{error}</Text>}
        </View>
    );
}

const inputStyles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: '#22d3ee',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginLeft: 4,
        marginTop: 4,
    },
});
