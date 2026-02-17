import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { HorizontalBar } from '../../components/dashboard/HorizontalBar';
import { BentoGrid } from '../../components/features/BentoGrid';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="mb-6">
                    <Text className="text-gray-400 text-sm uppercase tracking-wider">Overview</Text>
                    <Text className="text-3xl font-bold text-white">
                        Hello, <Text className="text-cyan-400">Pilot</Text>
                    </Text>
                </View>

                <HorizontalBar />

                <View className="mt-8">
                    <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
                    <BentoGrid />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
