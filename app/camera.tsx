import React, { useState } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Platform
} from 'react-native';
import { showAlert } from '../lib/alert';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { analyzeFood } from '../lib/openai';
import { supabase } from '../lib/supabase';
import { useI18n } from '../lib/i18n';

export default function CameraScreen() {
    const router = useRouter();
    const { t } = useI18n();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [mealType, setMealType] = useState('snack');

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
            showAlert(t('error'), t('select_photo'));
            return;
        }

        setAnalyzing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            let dietaryPrefs: string[] = [];
            let healthFocus: string[] = [];
            let isDiabetic = false;

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_diabetic, dietary_preferences, health_focus')
                    .eq('id', user.id)
                    .single();
                if (profile) {
                    isDiabetic = !!profile.is_diabetic;
                    dietaryPrefs = profile.dietary_preferences || [];
                    healthFocus = profile.health_focus || [];
                }
            }

            const result = await analyzeFood(base64Data, mealType, dietaryPrefs, healthFocus);

            router.push({
                pathname: '/analysis-result',
                params: {
                    resultJson: JSON.stringify(result),
                    mealType: mealType,
                    isDiabetic: isDiabetic ? 'true' : 'false',
                },
            });
        } catch (error: any) {
            showAlert(t('error'), error.message || 'Unknown error occurred');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← {t('back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{t('camera_title')}</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.imageArea}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.preview} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderIcon}>📸</Text>
                            <Text style={styles.placeholderTitle}>{t('select_photo')}</Text>
                            <Text style={styles.placeholderDesc}>{t('select_photo_desc')}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.pickBtn} onPress={pickImage} disabled={analyzing}>
                        <Text style={styles.pickBtnText}>
                            {selectedImage ? t('change_photo') : t('choose_gallery')}
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
                                    <Text style={styles.analyzeBtnText}> {t('analyzing')}</Text>
                                </View>
                            ) : (
                                <Text style={styles.analyzeBtnText}>{t('analyze_btn')}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.tipCard}>
                    <Text style={styles.tipTitle}>{t('tips_title')}</Text>
                    <Text style={styles.tipText}>{t('tip_lighting')}</Text>
                    <Text style={styles.tipText}>{t('tip_frame')}</Text>
                    <Text style={styles.tipText}>{t('tip_items')}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : 8, paddingBottom: 12 },
    backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
    backBtnText: { color: '#71717a', fontSize: 14, fontWeight: '500' },
    title: { color: '#fff', fontSize: 18, fontWeight: '700' },
    content: { flex: 1, paddingHorizontal: 20, maxWidth: 500, width: '100%', alignSelf: 'center' },
    imageArea: { aspectRatio: 4 / 3, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    preview: { width: '100%', height: '100%' },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    placeholderIcon: { fontSize: 48, marginBottom: 16 },
    placeholderTitle: { color: '#a1a1aa', fontSize: 18, fontWeight: '600', marginBottom: 8 },
    placeholderDesc: { color: '#52525b', fontSize: 14, textAlign: 'center', lineHeight: 22 },
    actions: { gap: 12, marginBottom: 20 },
    pickBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    pickBtnText: { color: '#d4d4d8', fontSize: 15, fontWeight: '600' },
    analyzeBtn: { backgroundColor: '#22d3ee', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    analyzeBtnDisabled: { opacity: 0.7 },
    analyzeBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },
    tipCard: { backgroundColor: 'rgba(76, 175, 80, 0.04)', borderWidth: 1, borderColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 14, padding: 16 },
    tipTitle: { color: '#22d3ee', fontSize: 14, fontWeight: '700', marginBottom: 8 },
    tipText: { color: '#71717a', fontSize: 13, lineHeight: 22 },
});
