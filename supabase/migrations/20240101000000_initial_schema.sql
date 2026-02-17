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
