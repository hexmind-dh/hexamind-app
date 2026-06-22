import { MainLayout } from '@/components/main-layout';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { DetailScreenContent, mockDetailData } from '@/components/detail';
import { Stack } from 'expo-router';

export default function DetailScreen() {
  return (
    <MainLayout>
      <Stack.Screen options={{ headerShown: true, title: '易道流光' }} />
      <ParallaxScrollView>
        <DetailScreenContent data={mockDetailData} />
      </ParallaxScrollView>
    </MainLayout>
  );
}
