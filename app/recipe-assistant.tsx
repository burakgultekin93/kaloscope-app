import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, SafeAreaView, StyleSheet, TouchableOpacity,
    ActivityIndicator, Image, Platform, Alert, ScrollView, TextInput,
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

    // Animations
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;
    const glowPulse = useRef(new Animated.Value(0.15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, { toValue: 0.35, duration: 3000, useNativeDriver: true }),
                Animated.timing(glowPulse, { toValue: 0.15, duration: 3000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

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
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7}>
                                <View style={styles.pickerIconBg}>
                                    <Text style={styles.pickerEmoji}>📸</Text>
                                </View>
                                <Text style={styles.pickerTitle}>{lang === 'tr' ? 'Fotoğraf Seç' : 'Choose Photo'}</Text>
                                <Text style={styles.pickerHint}>{lang === 'tr' ? 'Buzdolabını veya malzemeleri çek' : 'Take a photo of your fridge or ingredients'}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.divider} />

                        <Text style={styles.orText}>{lang === 'tr' ? 'veya elle yaz' : 'or type manually'}</Text>

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
                            activeOpacity={0.8}
                        >
                            {analyzing ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.actionBtnText}>{t('find_recipes')} →</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Results */}
                    {recipes.length > 0 && (
                        <View style={styles.resultsContainer}>
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsTitle}>{t('suggested_recipes')}</Text>
                                <Text style={styles.resultsCount}>{recipes.length} {lang === 'tr' ? 'tarif' : 'recipes'}</Text>
                            </View>
                            {recipes.map((recipe, idx) => (
                                <Animated.View key={idx} style={[styles.recipeCard, { opacity: fadeIn }]}>
                                    <View style={styles.recipeHeader}>
                                        <Text style={styles.recipeEmoji}>🍽️</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.recipeName}>{recipe.title}</Text>
                                            <View style={styles.recipeMetaRow}>
                                                <Text style={styles.recipeMeta}>⏲️ {recipe.prep_time}</Text>
                                                <Text style={styles.recipeMetaDot}>•</Text>
                                                <Text style={styles.recipeMeta}>🔥 {recipe.calories} kcal</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.recipeDesc}>{recipe.description}</Text>
                                    <View style={styles.reasonBadge}>
                                        <Text style={styles.reasonText}>🎯 {recipe.suitability_reason}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 24 : 16,
        paddingBottom: 40,
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
    },

    // Glow orbs — matching landing page
    glowOrb: { position: 'absolute', borderRadius: 999 },
    glowOrb1: { width: 280, height: 280, backgroundColor: '#22d3ee', top: -80, left: -100 },
    glowOrb2: { width: 220, height: 220, backgroundColor: '#8b5cf6', bottom: 100, right: -80 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, zIndex: 10,
    },
    backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
    backBtnText: { color: '#71717a', fontSize: 14, fontWeight: '500' },
    headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    logoIcon: { color: '#22d3ee', fontSize: 20, fontWeight: '700' },
    title: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },

    // Main card
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: 28,
        zIndex: 10,
    },
    cardBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start', marginBottom: 20,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22d3ee' },
    badgeText: { color: '#22d3ee', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    cardTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
    cardSubtitle: { color: '#71717a', fontSize: 14, marginBottom: 24, lineHeight: 20 },

    // Image picker
    imagePicker: {
        height: 160,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: 'rgba(34, 211, 238, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    pickerIconBg: {
        width: 52, height: 52,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
    },
    pickerEmoji: { fontSize: 24 },
    pickerTitle: { color: '#e4e4e7', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    pickerHint: { color: '#52525b', fontSize: 12 },
    preview: { width: '100%', height: 200, borderRadius: 16, marginBottom: 20 },

    // Divider
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 4 },
    orText: { color: '#52525b', fontSize: 12, textAlign: 'center', marginVertical: 12 },

    // Input
    input: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 15,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 20,
    },

    // CTA Button
    actionBtn: {
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
    btnDisabled: { opacity: 0.6 },
    actionBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },

    // Results
    resultsContainer: { marginTop: 32, zIndex: 10 },
    resultsHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    resultsTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    resultsCount: { color: '#22d3ee', fontSize: 13, fontWeight: '700' },

    // Recipe Card
    recipeCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    recipeHeader: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
    recipeEmoji: { fontSize: 28, marginTop: 2 },
    recipeName: { color: '#22d3ee', fontSize: 17, fontWeight: '700', marginBottom: 4 },
    recipeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    recipeMeta: { color: '#71717a', fontSize: 12, fontWeight: '500' },
    recipeMetaDot: { color: '#3f3f46', fontSize: 12 },
    recipeDesc: { color: '#a1a1aa', fontSize: 13, lineHeight: 20, marginBottom: 14 },
    reasonBadge: {
        backgroundColor: 'rgba(34, 211, 238, 0.08)',
        paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 10, alignSelf: 'flex-start',
    },
    reasonText: { color: '#22d3ee', fontSize: 12, fontWeight: '600' },
});
