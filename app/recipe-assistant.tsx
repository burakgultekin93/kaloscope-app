import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Platform, ScrollView, TextInput,
    Animated, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { suggestRecipes, Recipe } from '../lib/recipes';
import { useI18n } from '../lib/i18n';

const { width } = Dimensions.get('window');

export default function RecipeAssistantScreen() {
    const router = useRouter();
    const { t, lang } = useI18n();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [manualIngredients, setManualIngredients] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Animations
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;
    const glowPulse = useRef(new Animated.Value(0.15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 0.35, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
                Animated.timing(glowPulse, { toValue: 0.15, duration: 3000, useNativeDriver: Platform.OS !== 'web' }),
            ])
        ).start();
    }, []);

    const pickImage = async () => {
        setError(null);
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
        setError(null);
        if (!base64Data && !manualIngredients) {
            setError(lang === 'tr' ? 'Lütfen bir fotoğraf seçin veya malzemeleri yazın.' : 'Please select a photo or type ingredients.');
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
                setError(lang === 'tr' ? 'Tarif önerileri alınamadı.' : 'Could not fetch recipe suggestions.');
            }
        } catch (error: any) {
            setError(error.message || 'Unknown error occurred');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Ambient glow orbs */}
            <Animated.View style={[styles.glowOrb, styles.glowOrb1, { opacity: glowPulse }]} />
            <Animated.View style={[styles.glowOrb, styles.glowOrb2, { opacity: glowPulse }]} />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← {t('back')}</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.logoIcon}>◉</Text>
                        <Text style={styles.title}>{t('recipe_assistant_title')}</Text>
                    </View>
                    <View style={{ width: 60 }} />
                </View>

                <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
                    {/* Scan Card */}
                    <View style={styles.card}>
                        <View style={styles.cardBadge}>
                            <View style={styles.badgeDot} />
                            <Text style={styles.badgeText}>AI-Powered</Text>
                        </View>

                        <Text style={styles.cardTitle}>{t('fridge_scan')}</Text>
                        <Text style={styles.cardSubtitle}>{t('fridge_scan_desc')}</Text>

                        {selectedImage ? (
                            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                                <Image source={{ uri: selectedImage }} style={styles.preview} />
                                <View style={styles.changePhotoBtn}>
                                    <Text style={styles.changePhotoText}>{t('change_photo')}</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                                <View style={styles.uploadIconCircle}>
                                    <Text style={styles.uploadIcon}>📸</Text>
                                </View>
                                <Text style={styles.uploadText}>{t('tap_to_upload')}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.divider}>
                            <Text style={styles.dividerText}>{t('or').toUpperCase()}</Text>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder={lang === 'tr' ? 'Malzemeleri buraya yazın (örn: yumurta, domates)...' : 'Type ingredients (ex: eggs, tomato)...'}
                            placeholderTextColor="#52525b"
                            value={manualIngredients}
                            onChangeText={setManualIngredients}
                            multiline
                        />

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>⚠️ {error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.actionBtn, analyzing && styles.btnDisabled]}
                            onPress={handleSuggest}
                            disabled={analyzing}
                        >
                            {analyzing ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.actionBtnText}>
                                    {error ? (lang === 'tr' ? 'Tekrar Dene' : 'Try Again') : t('suggest_recipes')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Results */}
                    {recipes.length > 0 && (
                        <View style={styles.resultsContainer}>
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsTitle}>{t('suggested_recipes')}</Text>
                                <Text style={styles.resultsCount}>{recipes.length} {t('results')}</Text>
                            </View>

                            {recipes.map((recipe, index) => (
                                <View key={index} style={styles.recipeCard}>
                                    <View style={styles.recipeHeader}>
                                        <Text style={styles.recipeEmoji}>🍳</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.recipeName}>{recipe.title}</Text>
                                            <View style={styles.recipeMetaRow}>
                                                <Text style={styles.recipeMeta}>{recipe.calories} kcal</Text>
                                                <Text style={styles.recipeMetaDot}>•</Text>
                                                <Text style={styles.recipeMeta}>{recipe.protein}g protein</Text>
                                                <Text style={styles.recipeMetaDot}>•</Text>
                                                <Text style={styles.recipeMeta}>{recipe.prep_time} {t('prep_time')}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.recipeDesc}>{recipe.description}</Text>
                                    {recipe.suitability_reason && (
                                        <View style={styles.reasonBadge}>
                                            <Text style={styles.reasonText}>{recipe.suitability_reason}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, marginBottom: 10 },
    backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
    backBtnText: { color: '#e4e4e7', fontSize: 16, fontWeight: '500' },
    headerCenter: { alignItems: 'center' },
    logoIcon: { color: '#22d3ee', fontSize: 10, marginBottom: 4 },
    title: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

    // Card
    card: { backgroundColor: 'rgba(34, 211, 238, 0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.1)' },
    cardBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(34, 211, 238, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22d3ee', marginRight: 6 },
    badgeText: { color: '#22d3ee', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardTitle: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34, marginBottom: 8 },
    cardSubtitle: { color: '#a1a1aa', fontSize: 15, lineHeight: 22, marginBottom: 24 },

    // Inputs
    uploadArea: { height: 160, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    uploadIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(34, 211, 238, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    uploadIcon: { fontSize: 24 },
    uploadText: { color: '#71717a', fontSize: 14, fontWeight: '500' },

    preview: { width: '100%', height: 200, borderRadius: 16, marginBottom: 12 },
    changePhotoBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    changePhotoText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
    dividerText: { color: '#52525b', fontSize: 12, fontWeight: '700', letterSpacing: 1 },

    input: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 16, color: '#fff', fontSize: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },

    // Action Button
    actionBtn: { backgroundColor: '#22d3ee', borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
    btnDisabled: { opacity: 0.7 },
    actionBtnText: { color: '#000', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

    // Error
    errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
    errorText: { color: '#fca5a5', fontSize: 14, marginLeft: 8, flex: 1 },

    // Results
    resultsContainer: { marginTop: 32 },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    resultsTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
    resultsCount: { color: '#71717a', fontSize: 14 },

    recipeCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    recipeHeader: { flexDirection: 'row', marginBottom: 12 },
    recipeEmoji: { fontSize: 32, marginRight: 12 },
    recipeName: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 6 },
    recipeMetaRow: { flexDirection: 'row', alignItems: 'center' },
    recipeMeta: { color: '#a1a1aa', fontSize: 13 },
    recipeMetaDot: { color: '#52525b', marginHorizontal: 6 },
    recipeDesc: { color: '#a1a1aa', fontSize: 14, lineHeight: 20, marginBottom: 12 },
    reasonBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(34, 211, 238, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    reasonText: { color: '#22d3ee', fontSize: 12, fontWeight: '600' },

    glowOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#22d3ee', opacity: 0.15, filter: 'blur(80px)' },
    glowOrb1: { top: -100, left: -100 },
    glowOrb2: { bottom: -50, right: -50 },
});
