import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { MainLayout } from '@/components/main-layout';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Stack } from 'expo-router';
import Feather from '@expo/vector-icons/Feather'

export default function DetailScreen() {
    return (
        <MainLayout>
            <Stack.Screen options={{ headerShown: true, title: "易道流光" }} />
            <ParallaxScrollView>
                <View className="p-4 relative w-full">
                    <View className="flex flex-row items-center shrink-0 gap-2">
                        <Feather name="activity" size={14} color="#ff2056" />
                        <View className="flex-1 gap-1">
                            <Text className="font-bold uppercase tracking-wider text-white">
                                模块 1: 时空态势矢量及状态转移
                            </Text>
                            <Text size={14} className="text-white/40">
                                初始状态（本）、过渡关联状态（互）与前瞻终局状态（变）的对比分析
                            </Text>
                        </View>
                    </View>
                    <View className="mt-4 flex-row gap-3 rounded-sm border border-white/5 bg-black/45 p-3">
                        <View className="flex-1 gap-1">
                            <Text size={10} className="uppercase font-normal opacity-75 text-white/40">
                                时间随机源 (HEX)
                            </Text>
                            <Text size={10} className="font-bold text-orange-500">
                                0x19DE0D5C800
                            </Text>
                        </View>
                        <View className="flex-1 gap-1">
                            <Text size={10} className="uppercase font-normal opacity-75 text-white/40">
                                空间随机源 (LAT/LNG)
                            </Text>
                            <Text size={10} className="font-bold text-blue-500">
                                31.23°N, 121.47°E
                            </Text>
                        </View>
                        <View className="flex-1 gap-1">
                            <Text size={10} className="uppercase font-normal opacity-75 text-white/40">
                                触控动能源 (ACC)
                            </Text>
                            <Text size={10} className="font-bold text-purple-500">
                                0.500 m/s²
                            </Text>
                        </View>
                    </View>

                </View>
            </ParallaxScrollView>
        </MainLayout>
    );
}
