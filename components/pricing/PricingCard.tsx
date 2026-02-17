import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react-native';
import { Link } from 'expo-router';

export function PricingCard() {
    return (
        <View className="p-4 bg-black">
            <View className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                {/* Glow Header */}
                <View className="absolute top-0 left-0 right-0 h-32 bg-cyan-500/10 blur-3xl opacity-50" />

                <View className="mb-6">
                    <View className="bg-cyan-500/20 self-start px-3 py-1 rounded-full border border-cyan-500/30 mb-4">
                        <Text className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Most Popular</Text>
                    </View>
                    <Text className="text-3xl font-bold text-white mb-2">Yearly Pro</Text>
                    <Text className="text-gray-400">Full access to AI analysis and advanced tracking.</Text>
                </View>

                <View className="flex-row items-end gap-1 mb-6">
                    <Text className="text-4xl font-extrabold text-white">₺899</Text>
                    <Text className="text-gray-500 text-lg mb-1 line-through">₺1800</Text>
                    <Text className="text-gray-400 text-base mb-1">/year</Text>
                </View>

                <View className="space-y-4 mb-8">
                    {['Unlimited AI Food Scans', 'Detailed Macro Breakdown', 'Personalized Diet Plans', 'Ad-free Experience'].map((feat, i) => (
                        <View key={i} className="flex-row items-center gap-3">
                            <View className="bg-cyan-500/20 p-1 rounded-full">
                                <Check size={14} color="#22d3ee" />
                            </View>
                            <Text className="text-gray-300 text-sm">{feat}</Text>
                        </View>
                    ))}
                </View>

                <Link href="/register" asChild>
                    <TouchableOpacity className="bg-cyan-500 w-full py-4 rounded-xl items-center shadow-lg shadow-cyan-500/20">
                        <Text className="text-black font-bold text-base">Start 7-Day Free Trial</Text>
                    </TouchableOpacity>
                </Link>

                <Text className="text-gray-600 text-xs text-center mt-4">
                    Cancel anytime. No questions asked.
                </Text>
            </View>
        </View>
    );
}
