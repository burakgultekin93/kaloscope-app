import React from 'react';
import { View, ScrollView, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { BioluminescentHero } from '../components/hero/BioluminescentHero';
import { BentoGrid } from '../components/features/BentoGrid';
import { PricingCard } from '../components/pricing/PricingCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingPage() {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <ScrollView className="flex-1 bg-black">
                {/* Background Gradient Mesh */}
                <View className="absolute inset-0 z-0">
                    <LinearGradient
                        colors={['#1c1c1e', '#000000']}
                        style={{ flex: 1 }}
                    />
                </View>

                <View className="z-10">
                    {/* Hero Section */}
                    <BioluminescentHero className="mb-10 min-h-[500px]" />

                    {/* Features Section */}
                    <BentoGrid />

                    {/* Pricing Section */}
                    <View className="mt-10 mb-20">
                        <PricingCard />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});
