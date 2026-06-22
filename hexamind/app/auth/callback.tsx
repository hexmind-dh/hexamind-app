import { ActivityIndicator, StyleSheet } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';

WebBrowser.maybeCompleteAuthSession()

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text type="subtitle">正在完成登录...</Text>
      <Text>如果没有自动返回，请关闭当前页面后回到 App。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})
