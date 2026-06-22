import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import type { ModuleFourData } from '@/components/detail/types';

function GradientWelcomeText({ text }: { text: string }) {
  return (
    <View className="min-h-[48px] items-center justify-center bg-transparent">
      <MaskedView
        maskElement={
          <View className="items-center justify-center bg-transparent">
            <Text
              size={24}
              style={{
                fontFamily: 'System',
                fontWeight: '300',
                textAlign: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {text}
            </Text>
          </View>
        }
      >
        <LinearGradient
          colors={['#f1f5f9', '#a5f3fc', '#ccfbf1']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <Text size={24} style={{ opacity: 0, textAlign: 'center' }}>
            {text}
          </Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}

export function ModuleFourPanel({ data }: { data: ModuleFourData }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <View className="h-[420] min-h-0 flex-1 flex-col justify-between overflow-hidden border-white/5 bg-[#0d1322] p-4">
      <View className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
        {/* Header */}
        <View className="mb-3 shrink-0 flex-row items-center justify-between border-b border-dashed border-cyan-500/15 pb-2.5">
          <View className="flex-row items-center bg-transparent">
            <Text size={12} className="font-bold uppercase tracking-wider text-cyan-400">
              HEXA AI
            </Text>
          </View>
          <Text size={10} className="font-sans uppercase tracking-widest text-white/50">
            会话: {data.sessionId}
          </Text>
        </View>

        {/* Terminal scrollable area */}
        <ScrollView
          className="mb-3 flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-col items-center justify-center bg-transparent py-12">
            <View className="mx-auto w-full max-w-lg px-4">
              {data.welcomeMessages.map((msg, i) => (
                <View key={i} className="w-full bg-transparent py-4 text-center">
                  <GradientWelcomeText text={msg} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Input bar */}
      <View className="w-full rounded-full border border-neutral-800 bg-black/60 p-1 shadow-sm transition-all">
        <View className="flex-row items-center gap-2 bg-transparent">
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={data.inputPlaceholder}
            placeholderTextColor="#525252"
            className="flex-1 px-4 py-2 font-sans text-sm text-white"
          />
          <Pressable
            disabled={!inputValue.trim()}
            className="mr-1 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm disabled:opacity-30"
          >
            <Text size={14} className="font-bold text-white">
              ↑
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
