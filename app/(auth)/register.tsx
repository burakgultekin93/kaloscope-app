import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { NeonButton } from '../../components/ui/NeonButton';
import { NeonInput } from '../../components/ui/NeonInput';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                // Auto login or show success message, Supabase auto confirms if email confirm is off
                // For now redirected to login to establish session cleanly or dashboard if auto-session
                router.replace('/(tabs)');
            }

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
                <View className="absolute inset-0 z-0">
                    <LinearGradient colors={['#1c1c1e', '#000000']} style={{ flex: 1 }} />
                </View>

                <View className="flex-1 justify-center px-6 py-12 z-10">
                    <View className="mb-10 items-center">
                        <Text className="text-4xl font-extrabold text-transparent bg-clip-text text-white">
                            Join CalorieAI
                        </Text>
                        <Text className="text-gray-400 mt-2 text-center text-lg">
                            Start your <Text className="text-purple-400 font-bold">Transformation</Text>
                        </Text>
                    </View>

                    <View className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                        <View className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

                        {error ? (
                            <View className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6">
                                <Text className="text-red-400 text-center">{error}</Text>
                            </View>
                        ) : null}

                        <NeonInput
                            label="Full Name"
                            placeholder="Maverick"
                            value={fullName}
                            onChangeText={setFullName}
                        />

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
                            className="focus:border-purple-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                        />

                        <View className="mt-6 mb-4">
                            <NeonButton onPress={handleRegister} loading={loading} variant="secondary">
                                ESTABLISH UPLINK
                            </NeonButton>
                        </View>

                        <View className="flex-row justify-center mt-4">
                            <Text className="text-gray-500">Already enlisted? </Text>
                            <Link href="/login" className="text-purple-400 font-bold">
                                Login here
                            </Link>
                        </View>

                        <View className="mt-6 items-center">
                            <Link href="/" className="text-gray-600 text-xs uppercase tracking-widest">
                                Abort Mission
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
