import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Notebook, BarChart2, User, ScanLine } from 'lucide-react-native';
import { useI18n } from '../../lib/i18n';

const CustomScanButton = ({ children, onPress }: any) => (
    <TouchableOpacity
        style={tabStyles.scanBtnWrapper}
        onPress={onPress}
    >
        <View style={tabStyles.scanBtnCircle}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function TabLayout() {
    const router = useRouter();
    const { t } = useI18n();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#09090b',
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.06)',
                    height: Platform.OS === 'web' ? 64 : 80,
                    paddingBottom: Platform.OS === 'web' ? 8 : 24,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#22d3ee',
                tabBarInactiveTintColor: '#52525b',
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tab_home'),
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="diary"
                options={{
                    title: t('tab_diary'),
                    tabBarIcon: ({ color, size }) => <Notebook size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: '',
                    tabBarIcon: ({ focused }) => (
                        <ScanLine size={28} color={focused ? '#22d3ee' : '#fff'} />
                    ),
                    tabBarButton: (props) => (
                        <CustomScanButton {...props} onPress={() => router.push('/camera')}>
                            <ScanLine size={28} color="#22d3ee" />
                        </CustomScanButton>
                    ),
                }}
                listeners={() => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push('/camera');
                    }
                })}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: t('tab_stats'),
                    tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('tab_profile'),
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

const tabStyles = StyleSheet.create({
    scanBtnWrapper: {
        top: -24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scanBtnCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#09090b',
        borderWidth: 2,
        borderColor: '#22d3ee',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
