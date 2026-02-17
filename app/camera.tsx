import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [camera, setCamera] = useState<CameraView | null>(null);
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const router = useRouter();

    // Scanner animation
    const scanLineY = useSharedValue(0);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const uploadAndAnalyze = async (uri: string) => {
        try {
            setAnalyzing(true);

            // 1. Resize and compress image
            const manipulated = await manipulateAsync(
                uri,
                [{ resize: { width: 800 } }], // Resize to reasonable width
                { compress: 0.6, format: SaveFormat.JPEG, base64: true }
            );

            // 2. Upload to Supabase Storage (food-images bucket)
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const fileName = `${userId}/${Date.now()}.jpg`;
            const arrayBuffer = decode(manipulated.base64!); // We need a base64 decoder or standard fetch blob

            // Simplified upload using base64 for Edge Function directly to avoid complex RN fetch/blob polyfills for now
            // Or we can upload to storage if we use standard FormData.
            // For this demo, we'll send base64 directly to the Edge Function as designed in the function.

            callEdgeFunction(manipulated.base64!, manipulated.uri);

        } catch (error: any) {
            Alert.alert("Error", error.message);
            setAnalyzing(false);
        }
    };

    // Helper to decode base64 (if needed for storage, but here we use Edge Function directly)
    // function decode(base64: string) { ... } 

    const callEdgeFunction = async (base64: string, localUri: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('analyze-food', {
                body: { image_base64: base64, meal_type: 'lunch' }, // You might want to detect meal type or ask user
            });

            if (error) throw error;

            // Navigate to results with data
            // For now, let's just log and show alert
            console.log("AI Analysis Result:", data);

            // Pass data to results screen (using params or context)
            // Since result might be large, we might want to store it in DB first (middleware usually does this)
            // The Edge function we wrote returns the analysis.

            // Let's assume the edge function also logs to 'food_logs' or 'daily_summaries'.
            // If the edge function implementation *only* returns JSON, we should save it here or in the function.
            // Looking back at the Edge Function code: it DOES insert into 'ai_analysis_logs', but maybe not 'food_logs'.

            // We'll navigate to a 'result' page with the data stringified
            router.push({
                pathname: '/analysis-result',
                params: { analysisResult: JSON.stringify(data), imageUri: localUri }
            });

        } catch (e: any) {
            Alert.alert("Analysis Failed", e.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const takePicture = async () => {
        if (camera) {
            setLoading(true);
            const photo = await camera.takePictureAsync({
                quality: 0.7,
                base64: true, // We need base64 for OpenAI
            });
            setLoading(false);

            if (photo) {
                uploadAndAnalyze(photo.uri);
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled) {
            uploadAndAnalyze(result.assets[0].uri);
        }
    };

    // Animation for scanner
    const animatedScanStyle = useAnimatedStyle(() => {
        // Simple vertical scan
        return {
            // transform: [{ translateY: withRepeat(withTiming(500, { duration: 2000, easing: Easing.linear }), -1, true) }]
            // keeping it simple for now without reanimated complexity to avoid errors
        }
    });

    return (
        <View style={styles.container}>
            {analyzing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#40D3F4" />
                    <Text style={styles.loadingText}>ANALYZING FOOD STRUCTURE...</Text>
                </View>
            )}

            <CameraView
                style={styles.camera}
                facing={facing}
                ref={(ref) => setCamera(ref)} // Proper ref assignment
            >
                {/* Scanner Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.scannerBorder} />
                    <Text style={styles.scannerText}>ALIGN FOOD IN GRID</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                        <Ionicons name="images" size={24} color="#40D3F4" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                        <View style={styles.shutterInner} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                        <Ionicons name="camera-reverse" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 100,
        left: 40,
        right: 40,
        bottom: 200,
        borderWidth: 1,
        borderColor: 'rgba(64, 211, 244, 0.5)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    scannerBorder: {
        position: 'absolute',
        top: -2, left: -2, right: -2, bottom: -2,
        borderWidth: 2,
        borderColor: '#40D3F4',
        borderRadius: 20,
        opacity: 0.6,
    },
    scannerText: {
        color: '#40D3F4',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: -20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 4,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    shutterButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#40D3F4', // Neon Cyan
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#40D3F4',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    shutterInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    galleryButton: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#40D3F4',
    },
    flipButton: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#40D3F4',
        marginTop: 20,
        fontSize: 16,
        letterSpacing: 2,
        fontWeight: 'bold',
    }
});
