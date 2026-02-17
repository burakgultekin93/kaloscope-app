import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '../../lib/utils';
import { TrendingUp, CheckCircle, Video, Globe } from 'lucide-react-native';

interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

const itemsSample: BentoItem[] = [
    {
        title: "AI Analysis",
        meta: "v2.0",
        description: "Instant calorie & macro analysis from photos",
        icon: <TrendingUp size={20} color="#3b82f6" />, // Blue-500
        status: "Live",
        tags: ["Vision", "AI"],
        colSpan: 2,
    },
    {
        title: "Tracker",
        meta: "Daily",
        description: "Log meals & water seamlessly",
        icon: <CheckCircle size={20} color="#10b981" />, // Emerald-500
        status: "Updated",
        tags: ["Logs"],
    },
    {
        title: "History",
        meta: "Cloud",
        description: "Access your nutrition history anywhere",
        icon: <Video size={20} color="#a855f7" />, // Purple-500
        tags: ["Storage"],
        colSpan: 2,
    },
];

export function BentoGrid() {
    return (
        <View className="flex-1 p-4 bg-black">
            <View className="flex-row flex-wrap gap-3">
                {itemsSample.map((item, index) => (
                    <View
                        key={index}
                        className={cn(
                            "bg-zinc-900 border border-white/10 rounded-2xl p-4 overflow-hidden",
                            item.colSpan === 2 ? "w-full" : "flex-1 min-w-[45%]"
                        )}
                    >
                        {/* Glow Effect Background */}
                        <View className="absolute inset-0 bg-transparent" />

                        <View className="flex-row justify-between items-start mb-3">
                            <View className="bg-white/10 p-2 rounded-lg">
                                {item.icon}
                            </View>
                            {item.status && (
                                <View className="bg-white/10 px-2 py-1 rounded-md">
                                    <Text className="text-gray-300 text-xs font-medium">{item.status}</Text>
                                </View>
                            )}
                        </View>

                        <View className="space-y-1 mb-3">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-white font-semibold text-base">{item.title}</Text>
                                {item.meta && <Text className="text-gray-500 text-xs">{item.meta}</Text>}
                            </View>
                            <Text className="text-gray-400 text-sm leading-tight">{item.description}</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mt-auto">
                            {item.tags?.map((tag, i) => (
                                <View key={i} className="bg-white/5 px-2 py-1 rounded-md">
                                    <Text className="text-gray-400 text-[10px] uppercase">#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
