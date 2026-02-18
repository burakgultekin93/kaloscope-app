import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export type Language = 'tr' | 'en';

const translations = {
    tr: {
        // General
        back: "Geri",
        save: "Kaydet",
        error: "Hata",
        success: "Başarılı",
        loading: "Yükleniyor...",
        or: "veya",
        tap_to_upload: "Yüklemek için dokun",
        suggest_recipes: "Tarif Öner",
        results: "Sonuçlar",

        // Tab Labels
        tab_home: "Ana Sayfa",
        tab_diary: "Günlük",
        tab_stats: "İstatistik",
        tab_profile: "Profil",

        // Dashboard
        greeting_morning: "Günaydın",
        greeting_afternoon: "Tünaydın",
        greeting_evening: "İyi Akşamlar",
        todays_nutrition: "Bugünün Beslenmesi",
        macro_breakdown: "Makro Dağılımı",
        water_intake: "Su Tüketimi",
        glasses: "bardak",
        add_water: "+ 250ml Su Ekle",
        quick_actions: "Hızlı İşlemler",
        scan_food: "Yemek Tara",
        scan_food_desc: "Anında AI analizi için fotoğraf çek",
        recipe_assistant: "AI Tarif Asistanı",
        recipe_assistant_desc: "Mutfaktaki malzemelerle sana özel tarifler",
        recent_scans: "Son Taramalar",
        motivation_title: "Günün Motivasyonu",
        motivation_footer: "Hadi {name}, bugün senin günün!",

        // Profile
        profile_title: "Profil",
        health_nutrition: "SAĞLIK VE BESLENME",
        diabetic_mode: "Diyabet Dostu Mod",
        diabetic_mode_desc: "Şeker ve karbonhidrat uyarıları al",
        dietary_prefs: "Diyet Tercihleri",
        health_focus: "Sağlık Odağı",
        kitchen_culture: "MUTFAK VE KÜLTÜR",
        kitchen_prefs: "Mutfak Tercihleri",
        culinary_goals: "Mutfak Hedefleri",
        notifications_motivation: "BİLDİRİM VE MOTİVASYON",
        motivation_mode: "Motivasyon Modu",
        motivation_mode_desc: "AI destekli motive edici mesajlar al",
        water_reminder: "Su Hatırlatıcı",
        fruit_reminder: "Meyve Hatırlatıcı",
        snack_reminder: "Ara Öğün Bildirimi",
        settings: "AYARLAR",
        daily_calorie_goal: "Günlük Kalori Hedefi",
        activity_level: "Aktivite Seviyesi",
        language: "Dil Seçimi",
        sign_out: "Çıkış Yap",
        about: "HAKKINDA",
        app_version: "Uygulama Versiyonu",
        terms: "Kullanım Şartları",
        privacy: "Gizlilik Politikası",

        // Camera
        camera_title: "Yemek Tara",
        select_photo: "Bir Yemek Fotoğrafı Seç",
        select_photo_desc: "AI ile analiz etmek için galerinden bir resim seç",
        change_photo: "🔄 Fotoğrafı Değiştir",
        choose_gallery: "🖼️ Galeriden Seç",
        analyze_btn: "🤖 AI ile Analiz Et →",
        analyzing: "AI ile analiz ediliyor...",
        tips_title: "📷 En iyi sonuç için ipuçları",
        tip_lighting: "• İyi ışık, net fotoğraf",
        tip_frame: "• Tabağın tamamını kadraja al",
        tip_items: "• Mümkünse malzemeleri ayrı göster",

        // Analysis Result
        analysis_result: "Analiz Sonucu",
        analysis_complete: "Analiz Tamamlandı",
        confidence: "güven",
        calories: "Kalori",
        protein: "Protein",
        carbs: "Karbonhidrat",
        fat: "Yağ",
        fiber: "Lif",
        diabetic_warning: "DİYABET UYARISI",
        diabetic_warning_title: "🩺 Diyabet Dostu Mod Aktif",
        high_carb_msg: "⚠️ Uyarı: Yüksek karbonhidrat! Bu öğün kan şekerinizi hızla yükseltebilir.",
        low_carb_msg: "✅ Karbonhidrat miktarı bu öğün için uygun seviyede.",
        ai_insight_title: "🤖 AI İçgörüsü",
        ai_insight_desc: "AI bu hedeflerinize göre analiz yapmıştır.",
        health_score: "Sağlık Puanı",
        detected_items: "🍽️ Tespit Edilenler",
        save_diary: "💾 Günlüğe Kaydet",
        discard_scan: "Vazgeç ve Yeniden Tara",

        // Recipe Assistant
        recipe_assistant_title: "AI Tarif Asistanı",
        fridge_scan: "📸 Buzdolabını Tara",
        fridge_scan_desc: "Veya elindeki malzemeleri yaz, AI sana özel tarif hazırlasın.",
        manual_input_placeholder: "Örn: Domates, Yumurta, Peynir...",
        find_recipes: "✨ Tarif Bul",
        suggested_recipes: "🍽️ Senin İçin Öneriler",
        prep_time: "dk",
        suitability: "Uygunluk",

        // Diary
        diary_title: "Yemek Günlüğü",
        breakfast: "Kahvaltı",
        lunch: "Öğle Yemeği",
        dinner: "Akşam Yemeği",
        snacks: "Ara Öğünler",
        no_meals_logged: "Henüz öğün kaydedilmedi",
        diary_empty_desc: "İlk yemeğinizi tarayarak günlüğünüzü oluşturun.",
        no_items_logged: "Kayıt yok",

        // Stats
        stats_title: "İstatistikler",
        stats_subtitle: "Beslenme özetiniz",
        this_week: "Bu Hafta",
        meals_logged: "Öğün Sayısı",
        avg_calories: "Ort. Kalori",
        day_streak: "Gün Serisi",
        ai_scans: "AI Tarama",
        stats_empty_title: "Takibe başlayın",
        stats_empty_desc: "Haftalık beslenme raporlarınızı görmek için yemeklerinizi düzenli olarak tarayın.",
    },
    en: {
        // General
        back: "Back",
        save: "Save",
        error: "Error",
        success: "Success",
        loading: "Loading...",
        or: "or",
        tap_to_upload: "Tap to upload",
        suggest_recipes: "Suggest Recipes",
        results: "Results",

        // Tab Labels
        tab_home: "Home",
        tab_diary: "Diary",
        tab_stats: "Stats",
        tab_profile: "Profile",

        // Dashboard
        greeting_morning: "Good Morning",
        greeting_afternoon: "Good Afternoon",
        greeting_evening: "Good Evening",
        todays_nutrition: "Today's Nutrition",
        macro_breakdown: "Macro Breakdown",
        water_intake: "Water Intake",
        glasses: "glasses",
        add_water: "+ Add 250ml Glass",
        quick_actions: "Quick Actions",
        scan_food: "Scan Food",
        scan_food_desc: "Take a photo for instant AI analysis",
        recipe_assistant: "AI Recipe Assistant",
        recipe_assistant_desc: "Custom recipes with ingredients at home",
        recent_scans: "Recent Scans",
        motivation_title: "Daily Motivation",
        motivation_footer: "Go {name}, today is your day!",

        // Profile
        profile_title: "Profile",
        health_nutrition: "HEALTH & NUTRITION",
        diabetic_mode: "Diabetic Friendly Mode",
        diabetic_mode_desc: "Get sugar and carb alerts",
        dietary_prefs: "Dietary Preferences",
        health_focus: "Health Focus",
        kitchen_culture: "KITCHEN & CULTURE",
        kitchen_prefs: "Kitchen Preferences",
        culinary_goals: "Culinary Goals",
        notifications_motivation: "NOTIFICATIONS & MOTIVATION",
        motivation_mode: "Motivation Mode",
        motivation_mode_desc: "Get AI-powered motivational messages",
        water_reminder: "Water Reminder",
        fruit_reminder: "Fruit Reminder",
        snack_reminder: "Snack Notification",
        settings: "SETTINGS",
        daily_calorie_goal: "Daily Calorie Goal",
        activity_level: "Activity Level",
        language: "Language",
        sign_out: "Sign Out",
        about: "ABOUT",
        app_version: "App Version",
        terms: "Terms of Service",
        privacy: "Privacy Policy",

        // Camera
        camera_title: "Scan Food",
        select_photo: "Select a Food Photo",
        select_photo_desc: "Choose an image from your gallery to analyze with AI",
        change_photo: "🔄 Change Photo",
        choose_gallery: "🖼️ Choose from Gallery",
        analyze_btn: "🤖 Analyze with AI →",
        analyzing: "Analyzing with AI...",
        tips_title: "📷 Tips for best results",
        tip_lighting: "• Good lighting, clear photo",
        tip_frame: "• Include the full plate in frame",
        tip_items: "• Show individual items when possible",

        // Analysis Result
        analysis_result: "Analysis Result",
        analysis_complete: "Analysis Complete",
        confidence: "confidence",
        calories: "Calories",
        protein: "Protein",
        carbs: "Carbs",
        fat: "Fat",
        fiber: "Fiber",
        diabetic_warning: "DIABETIC WARNING",
        diabetic_warning_title: "🩺 Diabetic Friendly Mode Active",
        high_carb_msg: "⚠️ Warning: High carbs! This meal might spike your blood sugar.",
        low_carb_msg: "✅ Carb amount is at a suitable level for this meal.",
        ai_insight_title: "🤖 AI Insight",
        ai_insight_desc: "AI analyzed this based on your goals.",
        health_score: "Health Score",
        detected_items: "🍽️ Detected Items",
        save_diary: "💾 Save to Diary",
        discard_scan: "Discard & Scan Again",

        // Recipe Assistant
        recipe_assistant_title: "AI Recipe Assistant",
        fridge_scan: "📸 Scan Fridge",
        fridge_scan_desc: "Or type your ingredients, AI will prepare a custom recipe for you.",
        manual_input_placeholder: "e.g. Tomato, Egg, Cheese...",
        find_recipes: "✨ Find Recipes",
        suggested_recipes: "🍽️ Suggestions for You",
        prep_time: "min",
        suitability: "Suitability",

        // Diary
        diary_title: "Food Diary",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        snacks: "Snacks",
        no_meals_logged: "No meals logged yet",
        diary_empty_desc: "Scan your first meal to start building your food diary.",
        no_items_logged: "No items logged",

        // Stats
        stats_title: "Statistics",
        stats_subtitle: "Your nutrition overview",
        this_week: "This Week",
        meals_logged: "Meals Logged",
        avg_calories: "Avg. Calories",
        day_streak: "Day Streak",
        ai_scans: "AI Scans",
        stats_empty_title: "Start tracking to see stats",
        stats_empty_desc: "Scan meals consistently to build up your nutrition insights and weekly reports.",
    }
};

class I18nService {
    currentLang: Language = 'tr';
    listeners: Array<(lang: Language) => void> = [];

    setLanguage(lang: Language) {
        if (this.currentLang === lang) return;
        this.currentLang = lang;
        this.listeners.forEach(l => l(lang));
    }

    t(key: keyof typeof translations['en'], params: any = {}) {
        let text = translations[this.currentLang][key] || key;
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        return text;
    }

    subscribe(listener: (lang: Language) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

export const i18n = new I18nService();

export function useI18n() {
    const [lang, setLang] = useState(i18n.currentLang);

    useEffect(() => {
        // Sync initial state
        setLang(i18n.currentLang);
        return i18n.subscribe(setLang);
    }, []);

    return {
        t: (key: keyof typeof translations['en'], params: any = {}) => i18n.t(key, params),
        lang,
        setLanguage: (l: Language) => i18n.setLanguage(l)
    };
}
