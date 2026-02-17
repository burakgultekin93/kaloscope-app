import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Notebook, BarChart2, User, ScanLine } from 'lucide-react-native';

const CustomScanButton = ({ children, onPress }: any) => (
    <TouchableOpacity
        style={{
            top: -30,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow
        }}
        onPress={onPress}
    >
        <View
            style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#000',
                borderWidth: 2,
                borderColor: '#40D3F4', // Neon Cyan
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
            {children}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#40D3F4',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
});

export default function TabLayout() {
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000000',
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#22d3ee', // Cyan-400
                tabBarInactiveTintColor: '#6b7280', // Gray-500
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="diary"
                options={{
                    title: 'Diary',
                    tabBarIcon: ({ color, size }) => <Notebook size={size} color={color} />,
                }}
            />

            {/* Central Scan Button */}
            <Tabs.Screen
                name="scan"
                options={{
                    title: '',
                    tabBarIcon: ({ focused }) => (
                        <ScanLine size={30} color={focused ? '#40D3F4' : '#fff'} />
                    ),
                    tabBarButton: (props) => (
                        <CustomScanButton {...props} onPress={() => router.push('/camera')}>
                            <ScanLine size={30} color="#40D3F4" />
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
                    title: 'Stats',
                    tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
