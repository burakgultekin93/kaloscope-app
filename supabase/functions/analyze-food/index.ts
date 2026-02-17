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
