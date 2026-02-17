# 🍽️ CalorieAI — Yapay Zeka Destekli Kalori Takip Uygulaması

## Proje Özeti

**CalorieAI**, kullanıcıların yemek fotoğrafı çekerek veya galeriden yükleyerek anlık kalori ve besin değeri analizi yapmasını sağlayan, yapay zeka destekli bir mobil sağlık uygulamasıdır. Uygulama, görüntü tanıma (computer vision) teknolojisi ile yemekleri otomatik olarak tespit eder, porsiyon tahmini yapar ve detaylı makro/mikro besin değerlerini hesaplar.

**Hedef Platform:** iOS & Android (React Native / Expo)
**Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
**AI Engine:** OpenAI GPT-4o Vision API + Custom Fine-tuned Model (Phase 2)
**Monetizasyon:** Freemium + Yıllık Abonelik (RevenueCat entegrasyonu)
**Hedef Pazar:** Türkiye (öncelik) → Global genişleme
**Tahmini Geliştirme Süresi:** 14-16 hafta (MVP)

---

## İçindekiler

1. [Kullanıcı Problemleri ve Çözüm](#1-kullanıcı-problemleri-ve-çözüm)
2. [Hedef Kitle ve Persona](#2-hedef-kitle-ve-persona)
3. [Özellik Haritası (Feature Map)](#3-özellik-haritası-feature-map)
4. [Kullanıcı Akışları (User Flows)](#4-kullanıcı-akışları-user-flows)
5. [Teknik Mimari](#5-teknik-mimari)
6. [Supabase Veritabanı Şeması](#6-supabase-veritabanı-şeması)
7. [API Endpoint Tasarımı](#7-api-endpoint-tasarımı)
8. [AI/ML Pipeline](#8-aiml-pipeline)
9. [Abonelik ve Monetizasyon Modeli](#9-abonelik-ve-monetizasyon-modeli)
10. [Ekran Listesi ve UI/UX](#10-ekran-listesi-ve-uiux)
11. [Güvenlik ve KVKK/GDPR](#11-güvenlik-ve-kvkkgdpr)
12. [Performans ve Ölçeklenme](#12-performans-ve-ölçeklenme)
13. [Test Stratejisi](#13-test-stratejisi)
14. [Geliştirme Fazları ve Sprint Planı](#14-geliştirme-fazları-ve-sprint-planı)
15. [Maliyet Analizi](#15-maliyet-analizi)
16. [KPI ve Başarı Metrikleri](#16-kpi-ve-başarı-metrikleri)
17. [Riskler ve Azaltma Stratejileri](#17-riskler-ve-azaltma-stratejileri)
18. [Rakip Analizi](#18-rakip-analizi)
19. [Gelecek Yol Haritası](#19-gelecek-yol-haritası)

---

## 1. Kullanıcı Problemleri ve Çözüm

### Problem

Kalori takibi yapmak isteyen kullanıcılar, yedikleri her yemeği manuel olarak aramak, porsiyon miktarını tahmin etmek ve girmek zorunda kalıyor. Bu süreç günde ortalama 15-20 dakika alıyor ve kullanıcıların %73'ü ilk 2 hafta içinde uygulamayı bırakıyor (kaynak: sektör ortalaması).

Türk mutfağına özgü yemekler (mantı, lahmacun, karnıyarık, vs.) uluslararası uygulamalarda genellikle bulunmuyor veya yanlış kalori değerleri gösteriyor.

### Çözüm

CalorieAI, tek bir fotoğraf ile:
- Yemeği otomatik tanır (Türk mutfağı dahil)
- Porsiyon miktarını görsel olarak tahmin eder
- Kalori + makro besin değerlerini (protein, karbonhidrat, yağ) hesaplar
- Mikro besin değerlerini (vitamin, mineral) gösterir
- Günlük/haftalık/aylık trendleri takip eder
- Kişiselleştirilmiş beslenme önerileri sunar

### Değer Önerisi (Value Proposition)

> "Fotoğrafını çek, kalorisini öğren. Türk mutfağını anlayan tek yapay zeka."

---

## 2. Hedef Kitle ve Persona

### Persona 1: Fitness Meraklısı Ayşe (25-35)
- Düzenli spor yapıyor, makro takibi önemli
- Instagram'da fitness içerikleri paylaşıyor
- Aylık 200-500 TL sağlık/fitness harcaması
- Pain point: MyFitnessPal'da Türk yemeklerini bulamıyor

### Persona 2: Kilo Vermek İsteyen Mehmet (30-45)
- Doktor tavsiyesiyle diyet yapıyor
- Teknoloji ile arası orta düzey
- Basit, hızlı çözüm istiyor
- Pain point: Manuel kalori girişi çok zahmetli

### Persona 3: Diyetisyen Zeynep (28-40)
- Danışanlarına uygulama önerisi yapıyor
- Detaylı raporlama istiyor
- B2B potansiyeli (diyetisyen paneli)
- Pain point: Danışanlarının ne yediğini takip edemiyor

### Persona 4: Sağlıklı Yaşam Odaklı Cem (20-30)
- Bilinçli beslenmeye yeni başlıyor
- Gamification ile motive oluyor
- Sosyal özellikler önemli
- Pain point: Nereden başlayacağını bilmiyor

---

## 3. Özellik Haritası (Feature Map)

### 3.1 MVP (v1.0) — Çekirdek Özellikler

#### 📸 Fotoğraf ile Kalori Analizi
- Kamera ile anlık çekim
- Galeri'den fotoğraf yükleme
- Multi-food detection (tek fotoğrafta birden fazla yemek)
- Porsiyon boyutu tahmini (S/M/L/XL + gram cinsinden)
- Güven skoru gösterimi (%85 doğruluk gibi)
- Manuel düzeltme imkanı (yanlış tanıma durumunda)

#### 📊 Besin Değeri Gösterimi
- Kalori (kcal)
- Makrolar: Protein (g), Karbonhidrat (g), Yağ (g), Lif (g)
- Mikrolar: Demir, Kalsiyum, C Vitamini, B12, vb.
- Günlük hedefin yüzdesi olarak gösterim
- Yemek bazlı detay kartı

#### 🎯 Günlük Hedef Takibi
- Kalori hedefi belirleme (otomatik hesaplama: BMR × aktivite faktörü)
- Makro hedefleri (protein/karb/yağ oranları)
- Su takibi
- Günlük ilerleme çubuğu (progress ring)
- Öğün bazlı takip (kahvaltı, öğle, akşam, ara öğün)

#### 👤 Profil ve Onboarding
- Boy, kilo, yaş, cinsiyet
- Aktivite seviyesi seçimi
- Hedef belirleme (kilo verme/alma/koruma)
- Diyet tercihi (vegan, vejetaryen, glutensiz, vs.)
- Alerjen bilgileri
- BMR ve TDEE otomatik hesaplama

#### 📅 Yemek Geçmişi
- Günlük yemek günlüğü (food diary)
- Takvim görünümü
- Fotoğraf galerisi ile geçmiş yemekler
- Favori yemekler listesi
- Sık yenilen yemekler (quick-add)

### 3.2 v1.5 — Gelişmiş Özellikler

#### 📈 Detaylı Analitik ve Raporlama
- Haftalık/aylık kalori trendi grafiği
- Makro dağılım pasta grafikleri
- Kilo değişim grafiği
- Besin eksikliği uyarıları
- PDF rapor çıktısı (diyetisyene göndermek için)

#### 🔍 Manuel Yemek Arama
- Türkçe yemek veritabanı (5.000+ yemek)
- Barkod tarama (paketli ürünler)
- Restoran menüleri (popüler zincirler)
- Tarif oluşturucu (malzemeleri gir, toplam kaloriyi hesapla)

#### 🏆 Gamification
- Günlük streak (üst üste gün sayısı)
- Başarı rozetleri (7 gün streak, 100 yemek loglanmış, vs.)
- Haftalık challenge'lar
- XP ve seviye sistemi

#### 🔔 Bildirimler
- Öğün hatırlatıcıları
- Su içme hatırlatıcıları
- Hedefe yaklaşma/aşma uyarıları
- Motivasyonel bildirimler

### 3.3 v2.0 — Premium Özellikler

#### 🤖 AI Beslenme Asistanı (Chat)
- "Bu akşam ne yesem?" önerileri
- Kalan kalori bütçesine göre yemek tavsiyesi
- Diyet planı oluşturma
- Besin eksikliklerine göre öneri
- Doğal dil ile yemek ekleme ("öğlen 2 dilim pizza yedim")

#### 👨‍⚕️ Diyetisyen Paneli (B2B)
- Danışan yönetimi dashboard
- Danışanların yemek günlüklerini görüntüleme
- Not ve yorum ekleme
- Özel diyet planı atama
- Randevu entegrasyonu

#### 🏃 Fitness Entegrasyonu
- Apple Health / Google Fit senkronizasyonu
- Egzersiz kalori yakımı entegrasyonu
- Net kalori hesaplaması (alınan - yakılan)
- Adım sayacı entegrasyonu

#### 👥 Sosyal Özellikler
- Arkadaş ekleme
- Yemek paylaşımı
- Grup challenge'ları
- Liderlik tablosu (leaderboard)

---

## 4. Kullanıcı Akışları (User Flows)

### 4.1 Onboarding Flow

```
Splash Screen
    → Welcome Carousel (3 ekran: Fotoğraf çek → AI analiz → Hedefine ulaş)
    → Sign Up (Email/Google/Apple)
    → Profil Bilgileri
        → Boy & Kilo
        → Yaş & Cinsiyet
        → Aktivite Seviyesi (Sedanter/Hafif/Orta/Yoğun/Çok Yoğun)
        → Hedef Seçimi (Kilo Ver/Koru/Al)
        → Haftalık Hedef (0.25kg/0.5kg/0.75kg/1kg)
        → Diyet Tercihi (Opsiyonel)
        → Alerjenler (Opsiyonel)
    → Günlük Kalori Hedefi Gösterimi
    → Paywall (Free Plan vs Premium tanıtımı)
    → Home Screen
```

### 4.2 Fotoğraf ile Yemek Ekleme Flow

```
Home Screen → FAB (Floating Action Button) "+"
    → Kamera Açılır
        → Fotoğraf Çek / Galeriden Seç
    → Loading (AI Analiz - 2-4 saniye)
    → Sonuç Ekranı
        ├── Tespit Edilen Yemek(ler) Listesi
        │     ├── Yemek Adı + Güven Skoru
        │     ├── Tahmini Porsiyon (gram)
        │     └── Kalori + Makrolar
        ├── Toplam Kalori Özeti
        ├── "Düzelt" butonu (yanlışsa)
        │     ├── Yemek adını değiştir (arama)
        │     ├── Porsiyon miktarını ayarla (slider)
        │     └── Yemek ekle/çıkar
        └── "Kaydet" butonu
            → Öğün Seçimi (Kahvaltı/Öğle/Akşam/Ara)
            → Home Screen (güncellenmiş progress ring)
```

### 4.3 Abonelik Satın Alma Flow

```
Paywall Trigger (günlük limit aşımı / premium özellik tıklama)
    → Paywall Screen
        ├── Free vs Premium karşılaştırma
        ├── Plan Seçimi
        │     ├── Aylık: ₺149.99/ay
        │     ├── Yıllık: ₺899.99/yıl (₺75/ay — %50 tasarruf)
        │     └── 7 gün ücretsiz deneme (yıllık planda)
        ├── Özellik highlights
        ├── Kullanıcı yorumları (social proof)
        └── "Başla" butonu
            → App Store / Google Play ödeme
            → Başarılı → Premium aktif
            → Başarısız → Hata mesajı + tekrar dene
```

### 4.4 Günlük Kullanım Flow

```
Uygulama Açılış
    → Home Screen
        ├── Günlük Kalori Özeti (ring chart)
        ├── Makro Çubukları (protein/karb/yağ)
        ├── Öğün Kartları (kahvaltı/öğle/akşam/ara)
        │     └── Her kartta: toplam kalori + yemek listesi
        ├── Su Takibi Widget
        ├── Streak Counter
        └── Quick Actions
              ├── 📸 Fotoğraf Çek
              ├── 🔍 Yemek Ara
              ├── 📊 Barkod Tara
              └── ⭐ Favorilerden Ekle
```

---

## 5. Teknik Mimari

### 5.1 Sistem Mimarisi (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (React Native / Expo)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Camera   │  │ UI/UX    │  │ State    │  │ RevenueCat   │    │
│  │ Module   │  │ Screens  │  │ Zustand  │  │ SDK          │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
│       │              │             │               │             │
│  ┌────┴──────────────┴─────────────┴───────────────┴──────────┐ │
│  │              Supabase Client SDK (@supabase/supabase-js)    │ │
│  └─────────────────────────────┬───────────────────────────────┘ │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │       SUPABASE CLOUD     │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │   Auth (GoTrue)    │  │
                    │  │   Email/Google/    │  │
                    │  │   Apple Sign-In    │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  PostgreSQL DB     │  │
                    │  │  (Kullanıcı,       │  │
                    │  │   Yemek, Log,      │  │
                    │  │   Abonelik veri)   │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Storage (S3)      │  │
                    │  │  (Yemek fotoğraf-  │  │
                    │  │   ları bucket)     │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Edge Functions    │  │
                    │  │  (Deno Runtime)    │  │
                    │  │                    │  │
                    │  │  • analyze-food    │  │
                    │  │  • webhook-revenue │  │
                    │  │  • daily-summary   │  │
                    │  │  • ai-assistant    │  │
                    │  └─────────┬──────────┘  │
                    │            │              │
                    └────────────┼──────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    EXTERNAL SERVICES     │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  OpenAI API        │  │
                    │  │  GPT-4o Vision     │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  RevenueCat        │  │
                    │  │  (Subscription     │  │
                    │  │   Management)      │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  OneSignal         │  │
                    │  │  (Push Notif.)     │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Sentry            │  │
                    │  │  (Error Tracking)  │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  PostHog/Mixpanel  │  │
                    │  │  (Analytics)       │  │
                    │  └────────────────────┘  │
                    └─────────────────────────┘
```

### 5.2 Tech Stack Detayı

| Katman | Teknoloji | Versiyon | Gerekçe |
|--------|-----------|----------|---------|
| **Mobile Framework** | React Native + Expo | SDK 52+ | Cross-platform, OTA update, EAS Build |
| **Navigasyon** | Expo Router | v4 | File-based routing, deep linking |
| **State Management** | Zustand | v4 | Hafif, TypeScript uyumlu, persist desteği |
| **UI Kit** | Tamagui veya NativeWind | Latest | Performanslı, theming, dark mode |
| **Kamera** | expo-camera + expo-image-picker | Latest | Kamera erişimi, galeri seçimi |
| **Grafikler** | react-native-chart-kit veya Victory Native | Latest | Kalori/makro grafikleri |
| **Backend** | Supabase | Latest | Auth, DB, Storage, Edge Functions, Realtime |
| **AI Vision** | OpenAI GPT-4o API | Latest | Yemek tanıma, porsiyon tahmini |
| **Abonelik** | RevenueCat | Latest | iOS/Android IAP yönetimi, analytics |
| **Push Notif.** | OneSignal veya Expo Notifications | Latest | Öğün hatırlatma, motivasyon |
| **Analytics** | PostHog veya Mixpanel | Latest | Funnel analizi, A/B test, retention |
| **Error Tracking** | Sentry | Latest | Crash raporlama, performance monitoring |
| **CI/CD** | EAS Build + EAS Submit | Latest | Otomatik build, store submit |
| **Testing** | Jest + React Native Testing Library | Latest | Unit + Integration testleri |

### 5.3 Klasör Yapısı (Expo Router)

```
calorie-ai/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── profile-setup.tsx
│   │   ├── goal-setup.tsx
│   │   └── diet-preferences.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                 # Home / Dashboard
│   │   ├── diary.tsx                 # Yemek Günlüğü
│   │   ├── stats.tsx                 # İstatistikler
│   │   └── profile.tsx               # Profil & Ayarlar
│   ├── (modals)/
│   │   ├── camera.tsx                # Kamera / Fotoğraf Çekimi
│   │   ├── food-result.tsx           # AI Sonuç Ekranı
│   │   ├── food-search.tsx           # Manuel Yemek Arama
│   │   ├── food-detail.tsx           # Yemek Detay
│   │   ├── barcode-scanner.tsx       # Barkod Tarama
│   │   ├── recipe-builder.tsx        # Tarif Oluşturucu
│   │   ├── paywall.tsx               # Abonelik Ekranı
│   │   └── ai-chat.tsx               # AI Asistan
│   ├── _layout.tsx                   # Root Layout
│   └── +not-found.tsx
├── components/
│   ├── ui/                           # Temel UI bileşenleri
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── MacroBar.tsx
│   │   └── ...
│   ├── home/
│   │   ├── CalorieSummary.tsx
│   │   ├── MealCard.tsx
│   │   ├── WaterTracker.tsx
│   │   ├── StreakBadge.tsx
│   │   └── QuickActions.tsx
│   ├── food/
│   │   ├── FoodResultCard.tsx
│   │   ├── NutritionLabel.tsx
│   │   ├── PortionSlider.tsx
│   │   └── ConfidenceBadge.tsx
│   ├── stats/
│   │   ├── CalorieChart.tsx
│   │   ├── MacroPieChart.tsx
│   │   ├── WeightGraph.tsx
│   │   └── WeeklyReport.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── supabase.ts                   # Supabase client init
│   ├── openai.ts                     # OpenAI API wrapper (Edge Function üzerinden)
│   ├── revenuecat.ts                 # RevenueCat init
│   ├── analytics.ts                  # Analytics wrapper
│   └── notifications.ts             # Push notification setup
├── stores/
│   ├── authStore.ts                  # Auth state
│   ├── userStore.ts                  # User profile & preferences
│   ├── foodStore.ts                  # Food log state
│   ├── subscriptionStore.ts          # Subscription state
│   └── uiStore.ts                    # UI state (theme, modals)
├── hooks/
│   ├── useAuth.ts
│   ├── useCamera.ts
│   ├── useFoodAnalysis.ts
│   ├── useNutrition.ts
│   ├── useSubscription.ts
│   ├── useWaterTracking.ts
│   └── useStreak.ts
├── utils/
│   ├── calories.ts                   # BMR, TDEE hesaplamaları
│   ├── formatters.ts                 # Sayı, tarih formatlama
│   ├── validators.ts                 # Input validation
│   ├── constants.ts                  # Sabitler
│   └── types.ts                      # TypeScript tipleri
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── animations/                   # Lottie animasyonları
├── supabase/
│   ├── functions/
│   │   ├── analyze-food/
│   │   │   └── index.ts
│   │   ├── webhook-revenuecat/
│   │   │   └── index.ts
│   │   ├── daily-summary/
│   │   │   └── index.ts
│   │   ├── ai-assistant/
│   │   │   └── index.ts
│   │   └── generate-report/
│   │       └── index.ts
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_food_database.sql
│   │   ├── 003_rls_policies.sql
│   │   └── ...
│   └── seed/
│       ├── turkish_foods.sql
│       └── achievements.sql
├── app.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Supabase Veritabanı Şeması

### 6.1 ER Diyagramı (Tablo İlişkileri)

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   profiles   │────<│   food_logs      │>────│  food_items     │
│              │     │                  │     │                 │
│ id (FK auth) │     │ id               │     │ id              │
│ full_name    │     │ user_id (FK)     │     │ name_tr         │
│ avatar_url   │     │ food_item_id(FK) │     │ name_en         │
│ height_cm    │     │ meal_type        │     │ calories_per100g│
│ weight_kg    │     │ portion_grams    │     │ protein_per100g │
│ birth_date   │     │ calories         │     │ carbs_per100g   │
│ gender       │     │ photo_url        │     │ fat_per100g     │
│ activity_lvl │     │ ai_confidence    │     │ fiber_per100g   │
│ goal_type    │     │ is_manual_edit   │     │ category        │
│ daily_cal    │     │ logged_at        │     │ is_turkish       │
│ ...          │     │ ...              │     │ barcode          │
└──────┬───────┘     └──────────────────┘     │ serving_sizes   │
       │                                       └─────────────────┘
       │
       │             ┌──────────────────┐     ┌─────────────────┐
       ├────────────<│  water_logs      │     │  achievements   │
       │             │                  │     │                 │
       │             │ id               │     │ id              │
       │             │ user_id (FK)     │     │ name            │
       │             │ amount_ml        │     │ description     │
       │             │ logged_at        │     │ icon_url        │
       │             └──────────────────┘     │ condition_type  │
       │                                       │ condition_value │
       │             ┌──────────────────┐     └────────┬────────┘
       ├────────────<│  weight_logs     │              │
       │             │                  │     ┌────────┴────────┐
       │             │ id               │     │ user_achieve.   │
       │             │ user_id (FK)     │>────│                 │
       │             │ weight_kg        │     │ id              │
       │             │ logged_at        │     │ user_id (FK)    │
       │             └──────────────────┘     │ achievement_id  │
       │                                       │ unlocked_at     │
       │             ┌──────────────────┐     └─────────────────┘
       ├────────────<│  subscriptions   │
       │             │                  │
       │             │ id               │
       │             │ user_id (FK)     │
       │             │ rc_customer_id   │
       │             │ plan_type        │
       │             │ status           │
       │             │ started_at       │
       │             │ expires_at       │
       │             │ ...              │
       │             └──────────────────┘
       │
       │             ┌──────────────────┐
       └────────────<│  daily_summaries │
                     │                  │
                     │ id               │
                     │ user_id (FK)     │
                     │ date             │
                     │ total_calories   │
                     │ total_protein    │
                     │ total_carbs      │
                     │ total_fat        │
                     │ total_water_ml   │
                     │ meal_count       │
                     │ streak_count     │
                     │ goal_met         │
                     └──────────────────┘
```

### 6.2 SQL Migration — Tam Şema

```sql
-- ============================================================
-- 001_initial_schema.sql
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Fuzzy text search için

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');
CREATE TYPE goal_type AS ENUM ('lose', 'maintain', 'gain');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE subscription_status AS ENUM ('free', 'trial', 'active', 'expired', 'cancelled', 'grace_period');
CREATE TYPE plan_type AS ENUM ('free', 'monthly', 'yearly');
CREATE TYPE food_category AS ENUM (
  'soup', 'salad', 'meat', 'chicken', 'fish', 'seafood',
  'vegetable', 'legume', 'rice_pasta', 'bread_pastry',
  'dessert', 'fruit', 'dairy', 'beverage', 'snack',
  'breakfast', 'fast_food', 'turkish_traditional', 'other'
);

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Fiziksel bilgiler
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  birth_date DATE,
  gender gender_type,
  
  -- Hedef ve tercihler
  activity_level activity_level DEFAULT 'moderate',
  goal_type goal_type DEFAULT 'maintain',
  weekly_goal_kg NUMERIC(3,2) DEFAULT 0.5,  -- Haftalık hedef (kg)
  
  -- Hesaplanan günlük hedefler
  daily_calorie_goal INTEGER,
  daily_protein_goal INTEGER,      -- gram
  daily_carb_goal INTEGER,         -- gram
  daily_fat_goal INTEGER,          -- gram
  daily_water_goal INTEGER DEFAULT 2500,  -- ml
  
  -- Diyet tercihleri
  diet_type TEXT[] DEFAULT '{}',   -- ['vegan', 'gluten_free', ...]
  allergens TEXT[] DEFAULT '{}',   -- ['gluten', 'lactose', 'nuts', ...]
  
  -- Uygulama ayarları
  preferred_language TEXT DEFAULT 'tr',
  measurement_unit TEXT DEFAULT 'metric',  -- metric / imperial
  notification_enabled BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  
  -- Onboarding durumu
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Zaman damgaları
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profil otomatik oluşturma trigger'ı
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FOOD ITEMS TABLE (Yemek Veritabanı)
-- ============================================================

CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Yemek bilgileri
  name_tr TEXT NOT NULL,             -- Türkçe isim
  name_en TEXT,                      -- İngilizce isim
  description TEXT,
  category food_category DEFAULT 'other',
  
  -- Besin değerleri (100g başına)
  calories_per_100g NUMERIC(7,2) NOT NULL,
  protein_per_100g NUMERIC(6,2) DEFAULT 0,
  carbs_per_100g NUMERIC(6,2) DEFAULT 0,
  fat_per_100g NUMERIC(6,2) DEFAULT 0,
  fiber_per_100g NUMERIC(6,2) DEFAULT 0,
  sugar_per_100g NUMERIC(6,2) DEFAULT 0,
  sodium_per_100g NUMERIC(6,2) DEFAULT 0,
  
  -- Mikro besinler (mg/100g)
  iron_mg NUMERIC(6,2),
  calcium_mg NUMERIC(6,2),
  vitamin_c_mg NUMERIC(6,2),
  vitamin_b12_mcg NUMERIC(6,2),
  vitamin_d_mcg NUMERIC(6,2),
  potassium_mg NUMERIC(6,2),
  
  -- Porsiyon bilgileri (JSONB — esnek yapı)
  serving_sizes JSONB DEFAULT '[
    {"label": "Küçük porsiyon", "grams": 100},
    {"label": "Normal porsiyon", "grams": 200},
    {"label": "Büyük porsiyon", "grams": 300}
  ]'::jsonb,
  
  -- Barkod (paketli ürünler için)
  barcode TEXT,
  brand TEXT,
  
  -- Meta
  is_turkish BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  photo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Arama optimizasyonu
  search_vector tsvector,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_food_items_search ON food_items USING gin(search_vector);
CREATE INDEX idx_food_items_name_tr ON food_items USING gin(name_tr gin_trgm_ops);
CREATE INDEX idx_food_items_barcode ON food_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_food_items_category ON food_items(category);

-- Search vector otomatik güncelleme
CREATE OR REPLACE FUNCTION food_items_search_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.name_tr, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.name_en, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.brand, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER food_items_search_trigger
  BEFORE INSERT OR UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION food_items_search_update();

-- ============================================================
-- FOOD LOGS TABLE (Yemek Günlüğü)
-- ============================================================

CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Yemek bilgisi
  food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
  custom_food_name TEXT,            -- AI tarafından tanınan ama DB'de olmayan yemekler
  meal_type meal_type NOT NULL,
  
  -- Porsiyon ve kalori
  portion_grams NUMERIC(7,1) NOT NULL,
  calories NUMERIC(7,1) NOT NULL,
  protein NUMERIC(6,1) DEFAULT 0,
  carbs NUMERIC(6,1) DEFAULT 0,
  fat NUMERIC(6,1) DEFAULT 0,
  fiber NUMERIC(6,1) DEFAULT 0,
  
  -- Fotoğraf
  photo_url TEXT,
  photo_storage_path TEXT,          -- Supabase Storage path
  
  -- AI metadata
  ai_confidence NUMERIC(4,2),       -- 0.00 - 1.00
  ai_raw_response JSONB,            -- AI'ın tam yanıtı (debug/improvement için)
  ai_detected_foods JSONB,          -- Birden fazla yemek tespiti
  is_manual_edit BOOLEAN DEFAULT false,  -- Kullanıcı AI sonucunu düzenledi mi?
  
  -- Zaman
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  logged_date DATE DEFAULT CURRENT_DATE,  -- Partition ve sorgu kolaylığı
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_date DESC);
CREATE INDEX idx_food_logs_user_meal ON food_logs(user_id, meal_type, logged_date);
CREATE INDEX idx_food_logs_logged_date ON food_logs(logged_date);

-- ============================================================
-- WATER LOGS TABLE (Su Takibi)
-- ============================================================

CREATE TABLE water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  logged_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, logged_date);

-- ============================================================
-- WEIGHT LOGS TABLE (Kilo Takibi)
-- ============================================================

CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,1) NOT NULL,
  note TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weight_logs_user ON weight_logs(user_id, logged_at DESC);

-- ============================================================
-- DAILY SUMMARIES TABLE (Günlük Özet — cache amaçlı)
-- ============================================================

CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Toplam değerler
  total_calories NUMERIC(7,1) DEFAULT 0,
  total_protein NUMERIC(6,1) DEFAULT 0,
  total_carbs NUMERIC(6,1) DEFAULT 0,
  total_fat NUMERIC(6,1) DEFAULT 0,
  total_fiber NUMERIC(6,1) DEFAULT 0,
  total_water_ml INTEGER DEFAULT 0,
  
  -- Meta
  meal_count INTEGER DEFAULT 0,
  photo_count INTEGER DEFAULT 0,
  
  -- Streak
  streak_count INTEGER DEFAULT 0,
  goal_met BOOLEAN DEFAULT false,
  
  -- Hedef (o güne ait snapshot)
  calorie_goal INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- ============================================================
-- SUBSCRIPTIONS TABLE (Abonelik Yönetimi)
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- RevenueCat bilgileri
  rc_customer_id TEXT UNIQUE,
  rc_entitlement_id TEXT,
  
  -- Plan bilgileri
  plan_type plan_type DEFAULT 'free',
  status subscription_status DEFAULT 'free',
  
  -- Tarihler
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Store bilgileri
  store TEXT,                      -- app_store / play_store
  product_id TEXT,                 -- Store product ID
  
  -- Kullanım limitleri (free plan)
  daily_scan_count INTEGER DEFAULT 0,
  daily_scan_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_rc ON subscriptions(rc_customer_id);

-- ============================================================
-- ACHIEVEMENTS TABLE (Başarılar)
-- ============================================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_tr TEXT NOT NULL,
  name_en TEXT,
  description_tr TEXT NOT NULL,
  description_en TEXT,
  icon_url TEXT,
  category TEXT,                   -- 'streak', 'logging', 'weight', 'social'
  condition_type TEXT NOT NULL,     -- 'streak_days', 'total_logs', 'weight_lost', etc.
  condition_value INTEGER NOT NULL, -- Hedef değer
  xp_reward INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- FAVORITE FOODS TABLE
-- ============================================================

CREATE TABLE favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, food_item_id)
);

-- ============================================================
-- CUSTOM RECIPES TABLE (Kullanıcı Tarifleri)
-- ============================================================

CREATE TABLE custom_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  
  -- Malzemeler (JSONB array)
  ingredients JSONB NOT NULL,
  -- Örnek: [{"food_item_id": "...", "name": "Pirinç", "grams": 200}, ...]
  
  -- Hesaplanan toplam değerler
  total_calories NUMERIC(7,1),
  total_protein NUMERIC(6,1),
  total_carbs NUMERIC(6,1),
  total_fat NUMERIC(6,1),
  
  servings INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI ANALYSIS LOGS (AI Kullanım Takibi — maliyet & iyileştirme)
-- ============================================================

CREATE TABLE ai_analysis_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Request detayları
  photo_storage_path TEXT,
  model_used TEXT DEFAULT 'gpt-4o',
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  latency_ms INTEGER,
  
  -- Sonuç
  detected_foods JSONB,
  confidence_avg NUMERIC(4,2),
  was_edited BOOLEAN DEFAULT false,  -- Kullanıcı düzenleme yaptı mı?
  user_corrections JSONB,            -- Düzeltme detayları (fine-tuning data)
  
  -- Maliyet
  estimated_cost_usd NUMERIC(8,4),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_user ON ai_analysis_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_logs_corrections ON ai_analysis_logs(was_edited) WHERE was_edited = true;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLİÇELERİ
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece kendi verisini görebilir/düzenleyebilir
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own food_logs" ON food_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own water_logs" ON water_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own weight_logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily_summaries" ON daily_summaries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own favorites" ON favorite_foods
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own recipes" ON custom_recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ai_logs" ON ai_analysis_logs
  FOR SELECT USING (auth.uid() = user_id);

-- food_items herkes okuyabilir
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read food_items" ON food_items
  FOR SELECT USING (true);

-- achievements herkes okuyabilir
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read achievements" ON achievements
  FOR SELECT USING (true);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- BMR Hesaplama (Mifflin-St Jeor)
CREATE OR REPLACE FUNCTION calculate_bmr(
  p_weight NUMERIC,
  p_height NUMERIC,
  p_age INTEGER,
  p_gender gender_type
) RETURNS NUMERIC AS $$
BEGIN
  IF p_gender = 'male' THEN
    RETURN (10 * p_weight) + (6.25 * p_height) - (5 * p_age) + 5;
  ELSE
    RETURN (10 * p_weight) + (6.25 * p_height) - (5 * p_age) - 161;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- TDEE Hesaplama
CREATE OR REPLACE FUNCTION calculate_tdee(
  p_bmr NUMERIC,
  p_activity activity_level
) RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE p_activity
    WHEN 'sedentary' THEN p_bmr * 1.2
    WHEN 'light' THEN p_bmr * 1.375
    WHEN 'moderate' THEN p_bmr * 1.55
    WHEN 'active' THEN p_bmr * 1.725
    WHEN 'very_active' THEN p_bmr * 1.9
    ELSE p_bmr * 1.55
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Günlük özet güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION refresh_daily_summary(
  p_user_id UUID,
  p_date DATE
) RETURNS void AS $$
DECLARE
  v_totals RECORD;
  v_water INTEGER;
  v_prev_streak INTEGER;
  v_calorie_goal INTEGER;
BEGIN
  -- Yemek toplamları
  SELECT 
    COALESCE(SUM(calories), 0),
    COALESCE(SUM(protein), 0),
    COALESCE(SUM(carbs), 0),
    COALESCE(SUM(fat), 0),
    COALESCE(SUM(fiber), 0),
    COUNT(*),
    COUNT(photo_url)
  INTO v_totals
  FROM food_logs
  WHERE user_id = p_user_id AND logged_date = p_date;

  -- Su toplamı
  SELECT COALESCE(SUM(amount_ml), 0) INTO v_water
  FROM water_logs
  WHERE user_id = p_user_id AND logged_date = p_date;

  -- Kalori hedefi
  SELECT daily_calorie_goal INTO v_calorie_goal
  FROM profiles WHERE id = p_user_id;

  -- Önceki gün streak
  SELECT COALESCE(streak_count, 0) INTO v_prev_streak
  FROM daily_summaries
  WHERE user_id = p_user_id AND date = p_date - 1;

  -- Upsert
  INSERT INTO daily_summaries (
    user_id, date, total_calories, total_protein, total_carbs,
    total_fat, total_fiber, total_water_ml, meal_count, photo_count,
    streak_count, goal_met, calorie_goal
  ) VALUES (
    p_user_id, p_date, v_totals.sum, v_totals.sum_1, v_totals.sum_2,
    v_totals.sum_3, v_totals.sum_4, v_water, v_totals.count, v_totals.count_1,
    CASE WHEN v_totals.count > 0 THEN v_prev_streak + 1 ELSE 0 END,
    v_totals.sum <= v_calorie_goal,
    v_calorie_goal
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    total_fiber = EXCLUDED.total_fiber,
    total_water_ml = EXCLUDED.total_water_ml,
    meal_count = EXCLUDED.meal_count,
    photo_count = EXCLUDED.photo_count,
    streak_count = EXCLUDED.streak_count,
    goal_met = EXCLUDED.goal_met,
    calorie_goal = EXCLUDED.calorie_goal,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================

-- Storage bucket'ları Supabase Dashboard'dan veya API ile oluşturulacak:
-- 1. "food-photos" → Yemek fotoğrafları (public okuma, authenticated yazma)
-- 2. "avatars" → Profil fotoğrafları (public okuma, authenticated yazma)
```

### 6.3 Örnek Türk Yemekleri Seed Data

```sql
-- 002_turkish_foods_seed.sql

INSERT INTO food_items (name_tr, name_en, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_turkish, is_verified, serving_sizes) VALUES

-- Kahvaltılıklar
('Menemen', 'Turkish Scrambled Eggs with Tomato', 'breakfast', 120, 7.5, 5.2, 8.1, 1.2, true, true,
 '[{"label":"1 porsiyon","grams":200},{"label":"Büyük porsiyon","grams":300}]'),

('Simit', 'Turkish Sesame Bagel', 'bread_pastry', 310, 9.5, 55.0, 5.8, 2.5, true, true,
 '[{"label":"1 adet","grams":120},{"label":"Yarım","grams":60}]'),

('Sucuklu Yumurta', 'Eggs with Turkish Sausage', 'breakfast', 195, 14.0, 1.5, 15.0, 0, true, true,
 '[{"label":"1 porsiyon (2 yumurta)","grams":180}]'),

-- Ana Yemekler
('Karnıyarık', 'Stuffed Eggplant', 'turkish_traditional', 145, 6.5, 8.0, 10.0, 3.5, true, true,
 '[{"label":"1 adet","grams":250},{"label":"2 adet","grams":500}]'),

('İskender Kebap', 'İskender Kebab', 'meat', 210, 15.0, 12.0, 12.5, 0.8, true, true,
 '[{"label":"1 porsiyon","grams":350},{"label":"Yarım porsiyon","grams":200}]'),

('Lahmacun', 'Turkish Pizza', 'turkish_traditional', 235, 10.0, 28.0, 9.5, 2.0, true, true,
 '[{"label":"1 adet","grams":180},{"label":"2 adet","grams":360}]'),

('Mantı', 'Turkish Dumplings', 'turkish_traditional', 195, 9.0, 22.0, 8.0, 1.5, true, true,
 '[{"label":"1 porsiyon","grams":300}]'),

('Kuru Fasulye', 'Turkish White Bean Stew', 'legume', 95, 6.0, 14.0, 1.5, 5.0, true, true,
 '[{"label":"1 porsiyon","grams":250},{"label":"Pilavlı","grams":400}]'),

('Mercimek Çorbası', 'Red Lentil Soup', 'soup', 65, 4.0, 9.5, 1.5, 2.5, true, true,
 '[{"label":"1 kase","grams":250},{"label":"Büyük kase","grams":350}]'),

('Döner (Tavuk)', 'Chicken Döner', 'chicken', 180, 22.0, 2.0, 9.0, 0.5, true, true,
 '[{"label":"Dürüm","grams":250},{"label":"Porsiyon","grams":200}]'),

('Döner (Et)', 'Beef/Lamb Döner', 'meat', 220, 18.0, 2.5, 15.0, 0.5, true, true,
 '[{"label":"Dürüm","grams":250},{"label":"Porsiyon","grams":200}]'),

('Pide (Kıymalı)', 'Turkish Flatbread with Ground Meat', 'turkish_traditional', 240, 11.0, 26.0, 10.0, 1.5, true, true,
 '[{"label":"1 dilim","grams":150},{"label":"Tam pide","grams":450}]'),

('İmam Bayıldı', 'Stuffed Eggplant (Olive Oil)', 'vegetable', 110, 2.0, 8.5, 8.0, 3.0, true, true,
 '[{"label":"1 adet","grams":200}]'),

('Hünkar Beğendi', 'Sultan\'s Delight', 'meat', 175, 12.0, 10.0, 10.5, 1.5, true, true,
 '[{"label":"1 porsiyon","grams":300}]'),

-- Tatlılar
('Baklava', 'Baklava', 'dessert', 430, 6.0, 45.0, 26.0, 2.0, true, true,
 '[{"label":"1 dilim","grams":60},{"label":"2 dilim","grams":120}]'),

('Künefe', 'Künefe', 'dessert', 350, 7.0, 38.0, 19.0, 0.5, true, true,
 '[{"label":"1 porsiyon","grams":150}]'),

('Sütlaç', 'Turkish Rice Pudding', 'dessert', 130, 3.5, 22.0, 3.0, 0.2, true, true,
 '[{"label":"1 kase","grams":200}]'),

-- İçecekler
('Ayran', 'Ayran (Yogurt Drink)', 'beverage', 35, 1.7, 2.5, 1.8, 0, true, true,
 '[{"label":"1 bardak","grams":200},{"label":"Büyük","grams":330}]'),

('Türk Kahvesi', 'Turkish Coffee', 'beverage', 2, 0.1, 0.3, 0, 0, true, true,
 '[{"label":"1 fincan","grams":60},{"label":"Şekerli","grams":60}]'),

('Çay (Şekersiz)', 'Turkish Tea (No Sugar)', 'beverage', 1, 0, 0.2, 0, 0, true, true,
 '[{"label":"1 bardak","grams":100},{"label":"2 şekerli","grams":100}]');
```

---

## 7. API Endpoint Tasarımı

### 7.1 Supabase Edge Functions

Tüm özel iş mantığı Supabase Edge Functions (Deno) üzerinde çalışır.

#### `analyze-food` — Ana AI Analiz Endpoint'i

```typescript
// supabase/functions/analyze-food/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AnalyzeRequest {
  image_base64: string;       // Base64 encoded image
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  user_language?: "tr" | "en";
}

interface DetectedFood {
  name_tr: string;
  name_en: string;
  estimated_grams: number;
  confidence: number;         // 0-1
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface AnalyzeResponse {
  success: boolean;
  foods: DetectedFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  processing_time_ms: number;
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Auth kontrolü
  const authHeader = req.headers.get("Authorization")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Abonelik ve limit kontrolü
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (sub?.plan_type === "free") {
    // Free: günde 3 tarama
    if (sub.daily_scan_date === new Date().toISOString().split('T')[0] 
        && sub.daily_scan_count >= 3) {
      return new Response(JSON.stringify({ 
        error: "daily_limit_reached",
        message: "Günlük ücretsiz tarama limitinize ulaştınız. Premium'a geçerek sınırsız tarama yapabilirsiniz.",
        upgrade_url: "calorieai://paywall"
      }), { status: 429 });
    }
  }

  const { image_base64, meal_type, user_language = "tr" }: AnalyzeRequest = await req.json();

  // OpenAI GPT-4o Vision API çağrısı
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Sen bir besin değeri analiz uzmanısın. Verilen yemek fotoğrafını analiz et ve her bir yemeği tespit et.

GÖREV:
1. Fotoğraftaki tüm yemekleri ayrı ayrı tespit et
2. Her yemek için porsiyon miktarını gram cinsinden tahmin et
3. Her yemek için kalori ve makro besin değerlerini hesapla
4. Güven skorunu belirle (0-1 arası)

ÖNEMLİ KURALLAR:
- Türk mutfağını çok iyi biliyorsun (mantı, lahmacun, karnıyarık, vs.)
- Porsiyon tahmini için tabak boyutunu referans al (standart yemek tabağı ~26cm)
- Yanındaki ekmek, pilav, salata gibi garnitürleri ayrı sayma — tek kalem olarak dahil et
- Paketli ürünler varsa markayı tespit etmeye çalış
- Güven skoru düşükse (< 0.6) bunu belirt

YANIT FORMATI (sadece JSON, başka metin yok):
{
  "foods": [
    {
      "name_tr": "Yemek adı (Türkçe)",
      "name_en": "Food name (English)",
      "estimated_grams": 250,
      "confidence": 0.85,
      "calories": 350,
      "protein": 20.5,
      "carbs": 30.0,
      "fat": 15.0,
      "fiber": 3.5
    }
  ]
}`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image_base64}`,
                detail: "high"
              }
            },
            {
              type: "text",
              text: "Bu yemek fotoğrafını analiz et. JSON formatında yanıt ver."
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,  // Deterministik sonuç için düşük
    }),
  });

  const openaiData = await openaiResponse.json();
  const content = openaiData.choices[0].message.content;
  
  // JSON parse
  let parsed;
  try {
    parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
  } catch {
    return new Response(JSON.stringify({ error: "AI parse error" }), { status: 500 });
  }

  const foods: DetectedFood[] = parsed.foods;
  
  // Toplam hesaplama
  const totals = foods.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein: acc.protein + f.protein,
    carbs: acc.carbs + f.carbs,
    fat: acc.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const processingTime = Date.now() - startTime;

  // AI log kaydet
  await supabase.from("ai_analysis_logs").insert({
    user_id: user.id,
    model_used: "gpt-4o",
    prompt_tokens: openaiData.usage?.prompt_tokens,
    completion_tokens: openaiData.usage?.completion_tokens,
    total_tokens: openaiData.usage?.total_tokens,
    latency_ms: processingTime,
    detected_foods: foods,
    confidence_avg: foods.reduce((s, f) => s + f.confidence, 0) / foods.length,
    estimated_cost_usd: (openaiData.usage?.total_tokens || 0) * 0.00001,
  });

  // Free plan scan count güncelle
  if (sub?.plan_type === "free") {
    const today = new Date().toISOString().split('T')[0];
    await supabase.from("subscriptions").update({
      daily_scan_count: sub.daily_scan_date === today ? sub.daily_scan_count + 1 : 1,
      daily_scan_date: today,
    }).eq("user_id", user.id);
  }

  const response: AnalyzeResponse = {
    success: true,
    foods,
    total_calories: Math.round(totals.calories),
    total_protein: Math.round(totals.protein * 10) / 10,
    total_carbs: Math.round(totals.carbs * 10) / 10,
    total_fat: Math.round(totals.fat * 10) / 10,
    processing_time_ms: processingTime,
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
});
```

#### `webhook-revenuecat` — Abonelik Webhook

```
POST /functions/v1/webhook-revenuecat

RevenueCat'ten gelen event'leri işler:
- INITIAL_PURCHASE → subscriptions tablosunu güncelle
- RENEWAL → expires_at uzat
- CANCELLATION → status = 'cancelled'
- EXPIRATION → status = 'expired'
- BILLING_ISSUE → status = 'grace_period'
```

#### `daily-summary` — Günlük Özet (CRON)

```
Supabase CRON job ile her gece 00:05'te çalışır.
Tüm aktif kullanıcıların günlük özetlerini hesaplar.
Streak kontrolü yapar.
Achievement kontrolü yapar ve yeni başarılar açar.
```

#### `ai-assistant` — AI Chat Asistanı

```
POST /functions/v1/ai-assistant

Body: { message: string, conversation_history: Message[] }

Kullanıcının günlük verilerini context olarak GPT-4o'ya gönderir.
Kişiselleştirilmiş beslenme önerileri üretir.
Premium özellik.
```

### 7.2 Supabase Client Tarafı API Kullanımı

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // generated types

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Örnek kullanımlar:

// Yemek log ekleme
const addFoodLog = async (log: FoodLogInsert) => {
  const { data, error } = await supabase
    .from('food_logs')
    .insert(log)
    .select()
    .single();
  return { data, error };
};

// Günlük yemek listesi
const getDailyFoods = async (date: string) => {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*, food_items(*)')
    .eq('logged_date', date)
    .order('logged_at', { ascending: true });
  return { data, error };
};

// Yemek arama
const searchFoods = async (query: string) => {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .or(`name_tr.ilike.%${query}%,name_en.ilike.%${query}%`)
    .limit(20);
  return { data, error };
};

// Fotoğraf yükleme
const uploadFoodPhoto = async (userId: string, uri: string) => {
  const fileName = `${userId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from('food-photos')
    .upload(fileName, decode(base64), {
      contentType: 'image/jpeg',
    });
  return { path: data?.path, error };
};
```

---

## 8. AI/ML Pipeline

### 8.1 Yemek Tanıma Akışı

```
Fotoğraf Çekilir
    │
    ▼
Ön İşleme (Client)
    ├── Görüntü sıkıştırma (max 1024px, JPEG %80)
    ├── EXIF data temizleme (gizlilik)
    └── Base64 encoding
    │
    ▼
Supabase Edge Function (analyze-food)
    │
    ├── Rate limit kontrolü
    ├── Abonelik kontrolü
    │
    ▼
OpenAI GPT-4o Vision API
    │
    ├── System prompt (Türk mutfağı uzmanı)
    ├── Fotoğraf analizi
    ├── Multi-food detection
    ├── Porsiyon tahmini
    └── Besin değeri hesaplama
    │
    ▼
Post-Processing
    ├── JSON parse & validation
    ├── Yerel veritabanı ile cross-check (varsa)
    ├── Güven skoru eşik kontrolü
    └── Response formatlama
    │
    ▼
Client Sonuç Gösterimi
    ├── Yemek kartları
    ├── Düzeltme imkanı
    └── Kaydetme
```

### 8.2 AI Prompt Engineering Stratejisi

#### Temel Prompt (v1)
System prompt'ta Türk mutfağı bilgisi, porsiyon referansları (tabak boyutu, kaşık ölçüsü), ve JSON output formatı tanımlanır.

#### Gelişmiş Prompt (v2) — Few-shot Learning
Bilinen Türk yemeklerinin örnek fotoğraf-sonuç çiftleri eklenir:
- Mercimek çorbası → tipik porsiyon 250g, 163 kcal
- Lahmacun → 1 adet 180g, 423 kcal
- Döner dürüm → 250g, 550 kcal

#### Fine-tuning Data Pipeline (v3)
Kullanıcıların düzeltmeleri (`is_manual_edit = true` olan kayıtlar) toplanarak:
1. Yanlış tanımalar → Doğru etiketler
2. Porsiyon hataları → Düzeltilmiş gramajlar
3. Bu veri ile custom model fine-tune edilir

### 8.3 Doğruluk İyileştirme Stratejisi

| Aşama | Yöntem | Hedef Doğruluk |
|-------|--------|----------------|
| MVP | GPT-4o vanilla + Türk mutfağı prompt | %70-75 |
| v1.5 | Few-shot examples + besin veritabanı cross-check | %80-85 |
| v2.0 | Fine-tuned model + kullanıcı düzeltme verisi | %85-90 |
| v3.0 | Custom vision model (yeterli veri toplandığında) | %90-95 |

### 8.4 Fallback Stratejisi

AI sonucu güven skoru < 0.5 ise:
1. Kullanıcıya "Bu yemek hakkında emin değilim" mesajı göster
2. Alternatif önerileri listele (en yakın 3-5 yemek)
3. Manuel arama imkanı sun
4. Düşük güvenli sonuçları ayrı logla (model iyileştirme için)

---

## 9. Abonelik ve Monetizasyon Modeli

### 9.1 Plan Karşılaştırma

| Özellik | Free | Premium |
|---------|------|---------|
| **Fotoğraf ile kalori analizi** | 3/gün | Sınırsız |
| **Manuel yemek arama** | ✅ | ✅ |
| **Günlük kalori takibi** | ✅ | ✅ |
| **Su takibi** | ✅ | ✅ |
| **Barkod tarama** | ❌ | ✅ |
| **Detaylı mikro besinler** | ❌ | ✅ |
| **Haftalık/aylık raporlar** | ❌ | ✅ |
| **PDF rapor çıktısı** | ❌ | ✅ |
| **AI Beslenme Asistanı** | ❌ | ✅ |
| **Tarif oluşturucu** | ❌ | ✅ |
| **Restoran menüleri** | ❌ | ✅ |
| **Reklam** | Banner (minimal) | Reklamsız |
| **Veri export** | ❌ | ✅ |
| **Öncelikli destek** | ❌ | ✅ |

### 9.2 Fiyatlandırma

| Plan | Fiyat | İndirim |
|------|-------|---------|
| **Aylık** | ₺149,99/ay | — |
| **Yıllık** | ₺899,99/yıl (₺75/ay) | %50 tasarruf |
| **7 Gün Ücretsiz Deneme** | Yıllık planla birlikte | — |

> Not: Fiyatlar Türkiye pazarı için optimize edilmiştir. Global genişlemede bölgesel fiyatlandırma uygulanacaktır.

### 9.3 RevenueCat Entegrasyonu

```typescript
// lib/revenuecat.ts
import Purchases from 'react-native-purchases';

export const initRevenueCat = async () => {
  Purchases.configure({
    apiKey: Platform.OS === 'ios' 
      ? REVENUECAT_IOS_KEY 
      : REVENUECAT_ANDROID_KEY,
  });
};

// Entitlements
const ENTITLEMENT_ID = "premium";

// Products
const PRODUCTS = {
  MONTHLY: "calorieai_premium_monthly",    // ₺149.99
  YEARLY: "calorieai_premium_yearly",      // ₺899.99
};

// Satın alma
export const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPremium };
  } catch (e: any) {
    if (!e.userCancelled) {
      // Hata logla
    }
    return { success: false, isPremium: false };
  }
};

// Premium kontrol
export const checkPremiumStatus = async (): Promise<boolean> => {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
};
```

### 9.4 Webhook ile Supabase Sync

RevenueCat webhook → Supabase Edge Function → `subscriptions` tablosu güncelleme

Bu sayede backend her zaman güncel abonelik durumunu bilir ve RLS policy'leri doğru çalışır.

### 9.5 Gelir Projeksiyonu (12 Ay)

| Metrik | Ay 1 | Ay 3 | Ay 6 | Ay 12 |
|--------|------|------|------|-------|
| Toplam İndirme | 5,000 | 25,000 | 80,000 | 200,000 |
| Aktif Kullanıcı (MAU) | 2,000 | 12,000 | 40,000 | 100,000 |
| Premium Dönüşüm | %3 | %5 | %6 | %7 |
| Premium Kullanıcı | 60 | 600 | 2,400 | 7,000 |
| Aylık Gelir (MRR) | ₺6,750 | ₺52,500 | ₺195,000 | ₺562,500 |
| Yıllık Gelir (ARR) | — | — | — | ₺6,750,000 |

> Varsayımlar: %60 yıllık plan tercih oranı, ortalama ₺93.75/kullanıcı/ay (blended), %30 churn/yıl.

---

## 10. Ekran Listesi ve UI/UX

### 10.1 Ekran Haritası

```
ONBOARDING (5 ekran)
├── Splash Screen
├── Welcome Carousel (3 sayfa)
├── Auth Screen (Login / Register)
├── Profile Setup (multi-step form)
└── Paywall (ilk gösterim)

MAIN APP (Tab Navigator — 4 tab)
├── 🏠 Home (Dashboard)
│   ├── Kalori Ring Chart
│   ├── Makro Progress Bars
│   ├── Öğün Kartları (collapsible)
│   ├── Su Takibi Widget
│   ├── Streak & Quick Actions
│   └── [FAB: Yemek Ekle]
│
├── 📓 Günlük (Diary)
│   ├── Takvim Header
│   ├── Günlük Yemek Listesi
│   ├── Günlük Toplam Özet
│   └── Fotoğraf Galeri Görünümü
│
├── 📊 İstatistikler (Stats)
│   ├── Kalori Trend Grafiği (7/30/90 gün)
│   ├── Makro Dağılım Pie Chart
│   ├── Kilo Değişim Grafiği
│   ├── Hedef Başarı Oranı
│   └── Haftalık Rapor Kartı
│
└── 👤 Profil (Profile)
    ├── Avatar & İsim
    ├── Fiziksel Bilgiler (düzenlenebilir)
    ├── Hedef Ayarları
    ├── Diyet Tercihleri
    ├── Abonelik Durumu
    ├── Başarılar (Achievements)
    ├── Bildirim Ayarları
    ├── Tema (Light/Dark)
    ├── Veri Export
    ├── Yardım & Destek
    └── Hesabı Sil

MODALS & SHEETS
├── 📸 Kamera / Fotoğraf Çekimi
├── 🔍 Yemek Arama (Search)
├── 📊 Barkod Tarama
├── 🍽️ AI Sonuç Ekranı
├── 📝 Yemek Detay / Düzenleme
├── 🍳 Tarif Oluşturucu
├── 🤖 AI Chat Asistanı
├── 💳 Paywall / Abonelik
├── ⚖️ Kilo Girişi
└── 💧 Su Ekleme
```

### 10.2 Tasarım Sistemi

| Element | Değer |
|---------|-------|
| **Ana Renk (Primary)** | #4CAF50 (Yeşil — sağlık, doğallık) |
| **Secondary** | #FF9800 (Turuncu — enerji, kalori) |
| **Accent** | #2196F3 (Mavi — su, güven) |
| **Background (Light)** | #FAFAFA |
| **Background (Dark)** | #121212 |
| **Card Background** | #FFFFFF / #1E1E1E |
| **Text Primary** | #212121 / #FFFFFF |
| **Text Secondary** | #757575 / #B0B0B0 |
| **Error** | #F44336 |
| **Success** | #4CAF50 |
| **Font** | Inter (UI) + DM Sans (Headings) |
| **Border Radius** | 12px (cards), 8px (buttons), 24px (chips) |
| **Spacing** | 4px grid system |
| **Elevation** | 3 seviye (flat, raised, floating) |

### 10.3 Animasyon Detayları

| Eleman | Animasyon | Kütüphane |
|--------|-----------|-----------|
| Progress Ring | Dolum animasyonu (0→değer) | react-native-reanimated |
| Makro Çubuklar | Slide-in + dolum | Reanimated Layout |
| Kamera shutter | Flash efekti | Lottie |
| AI Analiz | Pulse/scanning animasyonu | Lottie |
| Achievement unlock | Pop + confetti | Lottie |
| Tab geçişi | Shared element transition | Expo Router |
| Streak sayacı | 🔥 Flame animasyonu | Lottie |
| Paywall | Parallax carousel | Reanimated |

---

## 11. Güvenlik ve KVKK/GDPR

### 11.1 Veri Güvenliği

| Katman | Önlem |
|--------|-------|
| **Transport** | TLS 1.3 (Supabase default) |
| **Auth** | Supabase GoTrue (JWT), MFA opsiyonel |
| **Database** | RLS (Row Level Security) tüm tablolarda aktif |
| **Storage** | Signed URLs, time-limited erişim |
| **API Keys** | Edge Function env variables (hiçbir zaman client'ta) |
| **Image Privacy** | EXIF data client'ta strip edilir |
| **Encryption at Rest** | Supabase managed (AES-256) |

### 11.2 KVKK Uyumluluk Gereksinimleri

Türkiye'de KVKK (Kişisel Verilerin Korunması Kanunu) uyumluluğu zorunludur:

| Gereksinim | Uygulama |
|------------|----------|
| **Aydınlatma Metni** | Onboarding'de gösterim + kabul |
| **Açık Rıza** | Fotoğraf analizi için ayrı rıza |
| **Veri Minimizasyonu** | Yalnızca gerekli veri toplanır |
| **Veri Saklama Süresi** | Hesap silme → 30 gün içinde kalıcı silme |
| **Veri Taşınabilirlik** | JSON/CSV export özelliği |
| **Silme Hakkı** | Profil → Hesabı Sil (cascade delete) |
| **VERBİS Kaydı** | Veri Sorumluları Sicili'ne kayıt |
| **Veri İhlali Bildirimi** | 72 saat içinde KVKK Kurulu'na bildirim planı |

### 11.3 GDPR (Global genişleme için)

| Gereksinim | Uygulama |
|------------|----------|
| **Privacy Policy** | Çok dilli, erişilebilir |
| **Cookie Consent** | N/A (native app) |
| **DPA** | Supabase DPA + OpenAI DPA |
| **Data Residency** | Supabase EU region seçeneği |
| **Right to Erasure** | Otomatik cascade delete |

### 11.4 Fotoğraf Gizliliği

- Yemek fotoğrafları yalnızca analiz için OpenAI'a gönderilir
- OpenAI Data Usage Policy: API verisi model eğitiminde kullanılmaz (opt-out default)
- Fotoğraflar kullanıcının isteğiyle silinebilir
- Supabase Storage'da kullanıcı bazlı klasörleme + RLS

---

## 12. Performans ve Ölçeklenme

### 12.1 Performans Hedefleri

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| **App açılış süresi** | < 2 saniye | Cold start |
| **AI analiz süresi** | < 4 saniye | Fotoğraf → sonuç |
| **API yanıt süresi** | < 200ms | CRUD operasyonları |
| **Frame rate** | 60 FPS | Animasyonlar dahil |
| **APK/IPA boyutu** | < 50 MB | İlk indirme |
| **Crash rate** | < 0.5% | Sentry tracking |
| **Offline capability** | Temel takip | Zustand persist |

### 12.2 Ölçeklenme Stratejisi

| Kullanıcı Sayısı | Altyapı | Tahmini Maliyet/ay |
|-------------------|---------|-------------------|
| 0 - 10K | Supabase Free/Pro | $25-100 |
| 10K - 50K | Supabase Pro + edge caching | $100-500 |
| 50K - 200K | Supabase Team + read replicas | $500-2,000 |
| 200K+ | Supabase Enterprise / Self-hosted | Custom |

### 12.3 Caching Stratejisi

- **Client-side**: Zustand persist (AsyncStorage) → Günlük veriler, profil, favoriler
- **API-side**: Supabase connection pooling (PgBouncer)
- **Image caching**: expo-image (built-in disk cache)
- **Food DB**: Sık aranan yemekler client'ta cache'lenir

### 12.4 Offline Desteği

- Günlük kalori sayacı offline çalışır (local state)
- Su takibi offline çalışır
- Yemek arama offline çalışır (cached DB subset)
- Fotoğraf analizi online gerektirir (queue mechanism ile bağlantı geldiğinde gönderir)
- Sync mekanizması: online olunca local değişiklikler Supabase'e push edilir

---

## 13. Test Stratejisi

### 13.1 Test Piramidi

```
         ┌─────────────────┐
         │   E2E Tests     │  → Detox (5-10 kritik flow)
         │   (Top)         │
         ├─────────────────┤
         │  Integration    │  → Testing Library (20-30 test)
         │  Tests          │
         ├─────────────────┤
         │   Unit Tests    │  → Jest (100+ test)
         │   (Base)        │
         └─────────────────┘
```

### 13.2 Test Kapsamı

| Alan | Test Türü | Araç | Kapsam |
|------|-----------|------|--------|
| Kalori hesaplama | Unit | Jest | BMR, TDEE, makro hesapları |
| AI response parsing | Unit | Jest | JSON parse, fallback |
| Auth flows | Integration | RNTL | Login, register, logout |
| Food logging | Integration | RNTL | Ekleme, düzenleme, silme |
| Paywall | Integration | RNTL + RevenueCat mock | Satın alma akışı |
| Onboarding → Home | E2E | Detox | Tam kullanıcı yolculuğu |
| Fotoğraf → Kayıt | E2E | Detox | AI akışı uçtan uca |
| Edge Functions | Unit | Deno test | API logic |
| RLS Policies | Integration | pgTAP / Supabase test | Veri güvenliği |

### 13.3 AI Doğruluk Testi

Manuel test dataset'i:
- 100 Türk yemek fotoğrafı (kategorilere dağıtılmış)
- Her biri gerçek kalori değerleriyle etiketlenmiş
- Haftalık otomatik regression testi
- Hedef: ortalama hata oranı < %15

---

## 14. Geliştirme Fazları ve Sprint Planı

### Faz 1: Foundation (Hafta 1-4)

| Sprint | Süre | Görevler |
|--------|------|----------|
| **Sprint 1** | 2 hafta | Proje setup (Expo, Supabase, CI/CD), Auth flow (email + Google + Apple), Profil oluşturma & onboarding UI, Supabase şema migration |
| **Sprint 2** | 2 hafta | Home screen (dashboard) layout, Kalori ring chart + makro barlar, Supabase client integration, Basic navigation (tabs + modals) |

### Faz 2: Core AI Feature (Hafta 5-8)

| Sprint | Süre | Görevler |
|--------|------|----------|
| **Sprint 3** | 2 hafta | Kamera modülü, Edge Function: analyze-food, OpenAI GPT-4o entegrasyonu, AI sonuç ekranı (food result cards) |
| **Sprint 4** | 2 hafta | Yemek kaydetme (food_logs), Porsiyon düzenleme (slider), Öğün bazlı takip, Günlük özet hesaplama, Yemek geçmişi (diary) ekranı |

### Faz 3: Data & Analytics (Hafta 9-11)

| Sprint | Süre | Görevler |
|--------|------|----------|
| **Sprint 5** | 2 hafta | Manuel yemek arama + Türk yemek DB, Su takibi, Kilo takibi, İstatistik ekranı (grafikler) |
| **Sprint 6** | 1 hafta | Bildirimler (öğün hatırlatma, su), Streak sistemi, Favoriler, Dark mode |

### Faz 4: Monetization & Polish (Hafta 12-14)

| Sprint | Süre | Görevler |
|--------|------|----------|
| **Sprint 7** | 2 hafta | RevenueCat entegrasyonu, Paywall ekranı, Abonelik webhook, Free plan limitleri, A/B test setup |
| **Sprint 8** | 1 hafta | Bug fixing, Performance optimizasyonu, Animasyon polish, Accessibility, Store listing hazırlığı |

### Faz 5: Launch (Hafta 15-16)

| Görev | Süre |
|-------|------|
| Beta test (TestFlight + Google Play Internal) | 1 hafta |
| Son düzeltmeler | 3 gün |
| App Store / Google Play submit | 2-3 gün review |
| **LAUNCH** 🚀 | — |

---

## 15. Maliyet Analizi

### 15.1 Geliştirme Maliyetleri (Tek Seferlik)

| Kalem | Tahmini Maliyet |
|-------|----------------|
| Full-stack Developer (4 ay) | ₺200,000 - ₺400,000 |
| UI/UX Designer (2 ay) | ₺60,000 - ₺120,000 |
| QA Tester (1 ay) | ₺30,000 - ₺50,000 |
| Lottie Animasyonlar | ₺10,000 - ₺20,000 |
| **Toplam Geliştirme** | **₺300,000 - ₺590,000** |

### 15.2 Aylık İşletme Maliyetleri

| Kalem | 10K MAU | 50K MAU | 200K MAU |
|-------|---------|---------|----------|
| Supabase | $25 | $150 | $600 |
| OpenAI API (GPT-4o Vision) | $300 | $1,500 | $6,000 |
| RevenueCat | Free | $100 | $400 |
| Sentry | Free | $26 | $80 |
| OneSignal | Free | Free | $100 |
| Apple Developer | $8.25/ay | $8.25/ay | $8.25/ay |
| Google Play Developer | $2.08/ay | $2.08/ay | $2.08/ay |
| **Toplam/ay** | **~$340** | **~$1,790** | **~$7,190** |
| **Toplam/ay (₺)** | **~₺12,000** | **~₺63,000** | **~₺252,000** |

### 15.3 AI Maliyet Optimizasyonu

OpenAI GPT-4o Vision fiyatlandırması en büyük değişken maliyet kalemi. Optimizasyon stratejileri:

| Strateji | Tasarruf | Uygulama |
|----------|----------|----------|
| Görüntü sıkıştırma | %30-40 | Client'ta 512px resize, %70 JPEG |
| Response caching | %15-20 | Aynı yemek tespiti → cache'den dön |
| Free plan limiti | %50+ | Günde 3 tarama (organik AI çağrısı azaltır) |
| Batch processing | %10 | Birden fazla yemek tek çağrıda |
| Model downgrade | %60 | Basit yemekler için GPT-4o-mini |

---

## 16. KPI ve Başarı Metrikleri

### 16.1 Büyüme Metrikleri

| KPI | Hedef (6 ay) | Ölçüm |
|-----|-------------|-------|
| Toplam İndirme | 80,000 | App Store Connect + Google Play Console |
| MAU (Monthly Active Users) | 40,000 | PostHog |
| DAU/MAU Oranı | > %25 | PostHog |
| D1 Retention | > %40 | PostHog |
| D7 Retention | > %20 | PostHog |
| D30 Retention | > %10 | PostHog |

### 16.2 Gelir Metrikleri

| KPI | Hedef (6 ay) | Ölçüm |
|-----|-------------|-------|
| Free → Premium Dönüşüm | > %5 | RevenueCat |
| Trial → Paid Dönüşüm | > %40 | RevenueCat |
| MRR (Monthly Recurring Revenue) | ₺195,000 | RevenueCat |
| ARPU (Average Revenue Per User) | > ₺4.87 | MRR / MAU |
| Churn Rate (Aylık) | < %5 | RevenueCat |
| LTV:CAC Oranı | > 3:1 | Hesaplama |

### 16.3 Ürün Metrikleri

| KPI | Hedef | Ölçüm |
|-----|-------|-------|
| Günlük ortalama yemek log sayısı | > 2.5 | Supabase analytics |
| AI analiz doğruluk oranı | > %80 | Düzeltme oranı |
| Fotoğraf → kayıt tamamlama | > %70 | Funnel analizi |
| Onboarding tamamlama | > %60 | Funnel analizi |
| App Store rating | > 4.5 | Store |
| Crash-free sessions | > %99.5 | Sentry |
| NPS (Net Promoter Score) | > 40 | In-app survey |

---

## 17. Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| AI doğruluk düşüklüğü | Yüksek | Yüksek | Few-shot learning, kullanıcı düzeltme feedback loop, fallback arama |
| OpenAI API fiyat artışı | Orta | Yüksek | Alternatif model (Claude Vision, Gemini), self-hosted model R&D |
| Düşük retention | Yüksek | Yüksek | Gamification, bildirimler, sosyal özellikler, onboarding A/B test |
| Düşük premium dönüşüm | Orta | Yüksek | Paywall A/B test, pricing experiment, trial süresi deneme |
| App Store reject | Düşük | Orta | Guidelines uyum, health disclaimer, test hesapları |
| KVKK ihlali | Düşük | Çok Yüksek | Hukuki danışmanlık, VERBİS kaydı, DPA'lar, privacy-by-design |
| Rakip agresif hareket | Orta | Orta | Türk mutfağı differansiasyonu, hızlı iterasyon |
| Supabase kesinti | Düşük | Orta | Offline mode, local-first architecture |
| OpenAI API kesinti | Düşük | Yüksek | Fallback model (Gemini Vision), queue mechanism |

---

## 18. Rakip Analizi

| Uygulama | Güçlü Yanları | Zayıf Yanları | CalorieAI Avantajı |
|----------|---------------|---------------|---------------------|
| **FitCal** | Geniş veritabanı, güçlü AI | Türk mutfağı zayıf, pahalı | Türk yemekleri, uygun fiyat |
| **MyFitnessPal** | Dev veritabanı, topluluk | Manuel giriş ağırlıklı, eski UI | AI-first yaklaşım, modern UX |
| **Yazio** | Güzel UI, fotoğraf tanıma | Türkçe desteği sınırlı | Tam Türkçe, yerel yemekler |
| **Lose It!** | Barkod, kolay kullanım | Türkiye'de düşük penetrasyon | Yerel pazar odağı |
| **Samsung Health** | Pre-installed, ücretsiz | Genel amaçlı, AI yok | Uzmanlaşmış AI kalori takibi |

### Rekabet Avantajları

1. **Türk Mutfağı Uzmanı**: 5.000+ Türk yemeği veritabanı
2. **AI-First**: Fotoğraf çek → sonuç al (2-4 saniye)
3. **Yerel Fiyatlandırma**: Türkiye pazarına uygun fiyat
4. **Tam Türkçe**: UI, AI yanıtları, destek — hepsi Türkçe
5. **Modern UX**: Animasyonlu, gamified, sosyal

---

## 19. Gelecek Yol Haritası

### v2.0 (Launch + 3 ay)
- AI Chat Beslenme Asistanı
- Barkod tarayıcı (OpenFoodFacts API)
- Restoran menü entegrasyonu (popüler zincirler)
- Apple Health / Google Fit sync
- Widget (iOS/Android home screen)

### v2.5 (Launch + 6 ay)
- Diyetisyen Paneli (B2B SaaS)
- Sosyal özellikler (arkadaş, challenge)
- AI ile haftalık meal plan oluşturma
- Türk marketlerden barkod veritabanı genişletme
- Wear OS / watchOS companion app

### v3.0 (Launch + 12 ay)
- Custom AI modeli (fine-tuned, düşük maliyet)
- Ses ile yemek ekleme ("Öğlen 2 dilim pizza yedim")
- Fotoğraftan porsiyon tespiti iyileştirme (depth estimation)
- Grocery list oluşturma (meal plan'a göre)
- Multi-language (İngilizce, Almanca, Arapça)
- Kurumsal wellness programı (B2B2C)

### v4.0 (Launch + 18 ay)
- Real-time video analiz (yemeği çekerken anlık tanıma)
- AR porsiyon gösterimi (kamerada overlay)
- Genetik/kan testi verisi entegrasyonu (kişiselleştirilmiş beslenme)
- AI diyet koçu (uzun vadeli plan + adaptasyon)
- API marketplace (3. parti entegrasyonlar)

---

## Ekler

### Ek A: Ortam Değişkenleri (.env)

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# RevenueCat
REVENUECAT_IOS_KEY=appl_xxxxx
REVENUECAT_ANDROID_KEY=goog_xxxxx

# OpenAI (yalnızca Edge Function'da)
OPENAI_API_KEY=sk-xxxxx

# Analytics
POSTHOG_API_KEY=phc_xxxxx
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# OneSignal
ONESIGNAL_APP_ID=xxxxx
```

### Ek B: App Store Listing Bilgileri

**Uygulama Adı**: CalorieAI — Fotoğrafla Kalori Takibi
**Subtitle**: Yapay Zeka ile Besin Analizi
**Kategori**: Health & Fitness
**Keywords**: kalori, diyet, besin, yemek, fotoğraf, yapay zeka, protein, kilo, sağlık, beslenme

**Açıklama (Kısa)**: Yemek fotoğrafını çek, yapay zeka ile anında kalori ve besin değerlerini öğren. Türk mutfağını anlayan tek uygulama.

### Ek C: Gerekli Hesaplar ve API Anahtarları

| Servis | URL | Gerekli Plan |
|--------|-----|-------------|
| Supabase | supabase.com | Pro ($25/ay) |
| OpenAI | platform.openai.com | Pay-as-you-go |
| RevenueCat | revenuecat.com | Free (başlangıç) |
| Apple Developer | developer.apple.com | $99/yıl |
| Google Play Developer | play.google.com/console | $25 (tek seferlik) |
| Sentry | sentry.io | Free (başlangıç) |
| PostHog | posthog.com | Free (başlangıç) |
| EAS (Expo) | expo.dev | Free (başlangıç) |

---

> **Doküman Versiyonu**: 1.0
> **Son Güncelleme**: Şubat 2026
> **Hazırlayan**: Legal Operating System — CalorieAI Proje Ekibi
