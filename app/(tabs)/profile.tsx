import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { NeonButton } from '../../components/ui/NeonButton';

export default function ProfileScreen() {
    return (
        <View className="flex-1 bg-black justify-center items-center p-4">
            <Text className="text-white text-2xl font-bold mb-8">Pilot Profile</Text>
            <NeonButton onPress={() => supabase.auth.signOut()} variant="secondary" className="w-full">
                Sign Out / Eject
            </NeonButton>
        </View>
    );
}
