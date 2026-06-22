import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { useStore } from '@/store';

export default function IndexScreen() {
    const session = useStore((state) => state.session);
    const authInitialized = useStore((state) => state.authInitialized);

    if (!authInitialized) {
        return (
            <View className="flex-1 items-center justify-center gap-3 px-6">
                <ActivityIndicator />
                <Text>正在检查登录状态...</Text>
            </View>
        );
    }

    return <Redirect href={session ? '/(tabs)' : '/login'} />;
}
