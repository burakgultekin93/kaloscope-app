import React, { useState } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { analyzeFood, NutritionResult } from '../lib/openai';

export default function CameraScreen() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.6,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
            setBase64Data(result.assets[0].base64 || null);
        }
    };

    const handleAnalyze = async () => {
        if (!base64Data) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        setAnalyzing(true);
        try {
            const result = await analyzeFood(base64Data);

            // Navigate to analysis result with data
            router.push({
                pathname: '/analysis-result',
                params: {
                    resultJson: JSON.stringify(result),
                    imageUri: selectedImage || '',
                    imageBase64: base64Data.substring(0, 2000), // Truncate for URL params, full saved later
                },
            });
        } catch (error: any) {
            Alert.alert('Analysis Failed', error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Scan Food</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                {/* Image Preview Area */}
                <View style={styles.imageArea}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.preview} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderIcon}>📸</Text>
                            <Text style={styles.placeholderTitle}>Select a Food Photo</Text>
                            <Text style={styles.placeholderDesc}>Choose an image from your gallery to analyze with AI</Text>
                        </View>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.pickBtn} onPress={pickImage} disabled={analyzing}>
                        <Text style={styles.pickBtnText}>
                            {selectedImage ? '🔄 Change Photo' : '🖼️ Choose from Gallery'}
                        </Text>
                    </TouchableOpacity>

                    {selectedImage && (
                        <TouchableOpacity
                            style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
                            onPress={handleAnalyze}
                            disabled={analyzing}
                        >
                            {analyzing ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator size="small" color="#000" />
                                    <Text style={styles.analyzeBtnText}> Analyzing with AI...</Text>
                                </View>
                            ) : (
                                <Text style={styles.analyzeBtnText}>🤖 Analyze with AI →</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tips */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>📷 Tips for best results</Text>
                    <Text style={styles.tipText}>• Good lighting, clear photo</Text>
                    <Text style={styles.tipText}>• Include the full plate in frame</Text>
                    <Text style={styles.tipText}>• Show individual items when possible</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 20 : 8,
        paddingBottom: 12,
    },
    backBtn: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    backBtnText: {
        color: '#71717a',
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    imageArea: {
        aspectRatio: 4 / 3,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    placeholderTitle: {
        color: '#a1a1aa',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    placeholderDesc: {
        color: '#52525b',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    actions: {
        gap: 12,
        marginBottom: 20,
    },
    pickBtn: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    pickBtnText: {
        color: '#d4d4d8',
        fontSize: 15,
        fontWeight: '600',
    },
    analyzeBtn: {
        backgroundColor: '#22d3ee',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    analyzeBtnDisabled: {
        opacity: 0.7,
    },
    analyzeBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipCard: {
        backgroundColor: 'rgba(34, 211, 238, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.1)',
        borderRadius: 14,
        padding: 16,
    },
    tipTitle: {
        color: '#22d3ee',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    tipText: {
        color: '#71717a',
        fontSize: 13,
        lineHeight: 22,
    },
});
