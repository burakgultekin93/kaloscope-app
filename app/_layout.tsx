import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator, useColorScheme, Platform, StyleSheet } from 'react-native';
import { i18n, Language } from '../lib/i18n';

import { registerForPushNotificationsAsync } from '../lib/notifications';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [session, setSession] = useState<Session | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Register for push notifications
        registerForPushNotificationsAsync();

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                loadLanguage(session.user.id);
            }
            setAuthInitialized(true);
        }).catch(() => {
            setAuthInitialized(true);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth Event:', _event, session ? 'Session Active' : 'No Session');
            setSession(session);
            if (session?.user) {
                loadLanguage(session.user.id);
            }
            setAuthInitialized(true);
        });

        // Mark as fully initialized after a safe delay if still not done
        const timer = setTimeout(() => setInitialized(true), 1500);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const loadLanguage = async (userId: string) => {
        try {
            const { data } = await supabase.from('profiles').select('language').eq('id', userId).limit(1);
            if (data && data.length > 0 && data[0].language) {
                i18n.setLanguage(data[0].language as Language);
            }
        } catch (e) {
            console.error('Failed to load language:', e);
        }
    };

    // Global navigation guard
    useEffect(() => {
        if (!authInitialized) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        const isAtRoot = segments[0] === 'index' || segments[0] === '' || !segments[0];

        console.log('Root Navigation Sync:', { inAuthGroup, inTabsGroup, isAtRoot, sessionExists: !!session });

        if (session) {
            if (inAuthGroup || isAtRoot) {
                router.replace('/(tabs)');
            }
        } else {
            // Redirect to login when signed out (not '/' which is the landing page)
            if (inTabsGroup) {
                router.replace('/(auth)/login');
            }
        }
    }, [session, authInitialized, segments]);

    if (!authInitialized) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#22d3ee" />
            </View>
        );
    }

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="camera" options={{ presentation: 'modal' }} />
                <Stack.Screen name="analysis-result" />
                <Stack.Screen name="recipe-assistant" />
            </Stack>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: '#09090b',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
