import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image } from 'expo-image';
import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { Redirect } from 'expo-router';


export default function IndexScreen() {
    // 重定向 登录
    return <Redirect href="/login" />;

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    className="w-[290rpx] h-[178rpx] absolute left-0 top-0"
                />
            }>
            <View className="w-full bg-red-300 p-0 rounded-xl">
                <Text className="text-4xl text-black font-bold">测试啊</Text>
            </View>
            {/*  
  
        <ThemedView style={styles.titleContainer}>
          <ThemedText onPress={() => inc()} type="title">
            Welcome! simon {count}x休息下
          </ThemedText>
          <HelloWave />
        </ThemedView>
  
      */}
        </ParallaxScrollView>
    );
}