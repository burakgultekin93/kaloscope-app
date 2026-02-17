import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to camera screen when this tab is focused
        const timer = setTimeout(() => {
            router.push('/camera');
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#22d3ee" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
