import { ActivityIndicator, StyleSheet } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'

WebBrowser.maybeCompleteAuthSession()

export default function AuthCallbackScreen() {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator />
      <ThemedText type="subtitle">正在完成登录...</ThemedText>
      <ThemedText>如果没有自动返回，请关闭当前页面后回到 App。</ThemedText>
    </ThemedView>
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
