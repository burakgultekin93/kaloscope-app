import React, { useState } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Platform, Alert, ScrollView, TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { suggestRecipes, Recipe } from '../lib/recipes';
import { useI18n } from '../lib/i18n';

export default function RecipeAssistantScreen() {
    const router = useRouter();
    const { t, lang } = useI18n();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [manualIngredients, setManualIngredients] = useState('');

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
            setRecipes([]);
        }
    };

    const handleSuggest = async () => {
        if (!base64Data && !manualIngredients) {
            Alert.alert(t('error'), lang === 'tr' ? 'Lütfen bir fotoğraf seçin veya malzemeleri yazın.' : 'Please select a photo or type ingredients.');
            return;
        }

        setAnalyzing(true);
        try {
            const ingredients = manualIngredients ? manualIngredients.split(',').map(s => s.trim()) : undefined;
            const res = await suggestRecipes({
                image_base64: base64Data || undefined,
                ingredients: ingredients
            });

            if (res.success) {
                setRecipes(res.recipes);
            } else {
                Alert.alert(t('error'), lang === 'tr' ? 'Tarif önerileri alınamadı.' : 'Could not fetch recipe suggestions.');
            }
        } catch (error: any) {
            Alert.alert(t('error'), error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← {t('back')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('recipe_assistant_title')}</Text>
                    <View style={{ width: 60 }} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('fridge_scan')}</Text>
                    <Text style={styles.cardSubtitle}>{t('fridge_scan_desc')}</Text>

                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.preview} />
                    ) : (
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            <Text style={styles.pickerEmoji}>🖼️</Text>
                            <Text style={styles.pickerText}>{lang === 'tr' ? 'Fotoğraf Seç' : 'Choose Photo'}</Text>
                        </TouchableOpacity>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder={t('manual_input_placeholder')}
                        placeholderTextColor="#52525b"
                        value={manualIngredients}
                        onChangeText={setManualIngredients}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.actionBtn, analyzing && styles.btnDisabled]}
                        onPress={handleSuggest}
                        disabled={analyzing}
                    >
                        {analyzing ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <Text style={styles.actionBtnText}>{t('find_recipes')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {recipes.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>{t('suggested_recipes')}</Text>
                        {recipes.map((recipe, idx) => (
                            <View key={idx} style={styles.recipeCard}>
                                <Text style={styles.recipeName}>{recipe.title}</Text>
                                <Text style={styles.recipeMeta}>⏲️ {recipe.prep_time} {t('prep_time')} | 🔥 {recipe.calories} kcal</Text>
                                <Text style={styles.recipeDesc}>{recipe.description}</Text>
                                <View style={styles.reasonBadge}>
                                    <Text style={styles.reasonText}>🎯 {recipe.suitability_reason}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backBtn: { padding: 8 },
    backBtnText: { color: '#71717a', fontSize: 14 },
    title: { color: '#fff', fontSize: 20, fontWeight: '700' },
    card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
    cardSubtitle: { color: '#a1a1aa', fontSize: 13, marginBottom: 20, lineHeight: 18 },
    imagePicker: { height: 150, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    pickerEmoji: { fontSize: 32, marginBottom: 8 },
    pickerText: { color: '#71717a', fontSize: 14 },
    preview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
    input: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, color: '#fff', minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 16 },
    actionBtn: { backgroundColor: '#4CAF50', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    btnDisabled: { opacity: 0.7 },
    actionBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
    resultsContainer: { marginTop: 32 },
    resultsTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
    recipeCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
    recipeName: { color: '#4CAF50', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    recipeMeta: { color: '#71717a', fontSize: 12, marginBottom: 8 },
    recipeDesc: { color: '#a1a1aa', fontSize: 13, lineHeight: 20, marginBottom: 12 },
    reasonBadge: { backgroundColor: 'rgba(76, 175, 80, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
    reasonText: { color: '#4CAF50', fontSize: 11, fontWeight: '600' }
});
