import { MainLayout } from '@/components/main-layout';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { HistoryList, mockHistoryData } from '@/components/history';
import { Stack } from 'expo-router';

export default function HistoryScreen() {
    return (
        <MainLayout>
            <Stack.Screen options={{ headerShown: true, title: '历史' }} />
            <ParallaxScrollView>
                <HistoryList data={mockHistoryData} />
            </ParallaxScrollView>
        </MainLayout>
    );
}
