import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface BentoItem {
    title: string;
    description: string;
    icon: string;
    status?: string;
    tags?: string[];
    meta?: string;
    colSpan?: number;
}

const itemsSample: BentoItem[] = [
    {
        title: "AI Analysis",
        meta: "v2.0",
        description: "Instant calorie & macro analysis from photos",
        icon: "📊",
        status: "Live",
        tags: ["Vision", "AI"],
        colSpan: 2,
    },
    {
        title: "Tracker",
        meta: "Daily",
        description: "Log meals & water seamlessly",
        icon: "✅",
        status: "Updated",
        tags: ["Logs"],
    },
    {
        title: "History",
        meta: "Cloud",
        description: "Access your nutrition history anywhere",
        icon: "☁️",
        tags: ["Storage"],
        colSpan: 2,
    },
];

export function BentoGrid() {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {itemsSample.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.card,
                            item.colSpan === 2 ? styles.cardFull : styles.cardHalf,
                        ]}
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.icon}>{item.icon}</Text>
                            </View>
                            {item.status && (
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>{item.title}</Text>
                                {item.meta && <Text style={styles.meta}>{item.meta}</Text>}
                            </View>
                            <Text style={styles.description}>{item.description}</Text>
                        </View>

                        <View style={styles.tagsRow}>
                            {item.tags?.map((tag, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
    },
    cardFull: {
        width: '100%',
    },
    cardHalf: {
        flex: 1,
        minWidth: width > 600 ? '45%' : '100%',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 8,
    },
    icon: {
        fontSize: 20,
    },
    statusBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#d4d4d8',
        fontSize: 12,
        fontWeight: '500',
    },
    cardBody: {
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    meta: {
        color: '#71717a',
        fontSize: 12,
    },
    description: {
        color: '#a1a1aa',
        fontSize: 14,
        lineHeight: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        color: '#a1a1aa',
        fontSize: 10,
        textTransform: 'uppercase',
    },
});
