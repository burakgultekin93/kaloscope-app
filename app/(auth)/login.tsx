import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { NeonButton } from '../../components/ui/NeonButton';
import { NeonInput } from '../../components/ui/NeonInput';
import { BioluminescentHero } from '../../components/hero/BioluminescentHero';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Navigate to dashboard (tabs)
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-black"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {/* Background Mesh */}
                <View className="absolute inset-0 z-0">
                    <LinearGradient colors={['#0f172a', '#000000']} style={{ flex: 1 }} />
                </View>

                <View className="flex-1 justify-center px-6 py-12 z-10">
                    <View className="mb-10 items-center">
                        <Text className="text-4xl font-extrabold text-transparent bg-clip-text text-white">
                            Welcome Back
                        </Text>
                        <Text className="text-gray-400 mt-2 text-center text-lg">
                            Enter the <Text className="text-cyan-400 font-bold">Cockpit</Text>
                        </Text>
                    </View>

                    <View className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                        {/* Glow effect */}
                        <View className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

                        {error ? (
                            <View className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6">
                                <Text className="text-red-400 text-center">{error}</Text>
                            </View>
                        ) : null}

                        <NeonInput
                            label="Email"
                            placeholder="pilot@calorie.ai"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <NeonInput
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <View className="mt-6 mb-4">
                            <NeonButton onPress={handleLogin} loading={loading} variant="primary">
                                INITIATE LAUNCH
                            </NeonButton>
                        </View>

                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">New Recruit? </Text>
                            <Link href="/register" className="text-cyan-400 font-bold">
                                Join the Fleet
                            </Link>
                        </View>

                        <View className="mt-6 items-center">
                            <Link href="/" className="text-gray-600 text-xs uppercase tracking-widest">
                                Abort Mission (Back to Home)
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
