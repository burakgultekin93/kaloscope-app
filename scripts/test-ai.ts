
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file BEFORE importing the library
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DEBUG: API Key present?', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY);
console.log('DEBUG: Key start:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? process.env.EXPO_PUBLIC_GEMINI_API_KEY.substring(0, 5) : 'NONE');

async function testAI() {
    // Dynamic import to ensure env vars are loaded first
    const { analyzeFood } = await import('../lib/openai');

    console.log('🧪 Starting AI Integration Test...');
    console.log('Model being used: gemini-2.5-flash (from lib/openai.ts)');

    // A simple 1x1 pixel white transparent base64 image
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

    try {
        console.log('🚀 Sending request to Gemini API...');
        const result = await analyzeFood(dummyBase64, 'snack');

        console.log('\n✅ AI Response Received:');
        console.log(JSON.stringify(result, null, 2));

        if (result.success && result.foods) {
            console.log('\n✨ Validation Passed: Response structure is correct.');
        } else {
            console.error('\n❌ Validation Failed: Response structure is invalid.');
        }

    } catch (error: any) {
        console.error('\n❌ Test Failed:', error.message);
    }
}

testAI();
