import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { useStore } from '@/store';
import { chat } from '@/lib/divination';
import { supabase } from '@/db/supabase';
import type { ModuleFourData, ChatMessage } from '@/components/detail/types';

function GradientWelcomeText({ text }: { text: string }) {
  return (
    <View className="min-h-[48px] items-center justify-center bg-transparent">
      <MaskedView
        maskElement={
          <View className="items-center justify-center bg-transparent">
            <Text
              size={24}
              className="text-white"
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
          <Text size={24} className="text-white" style={{ opacity: 0, textAlign: 'center' }}>
            {text}
          </Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[85%] rounded-xl px-4 py-3 ${
        isUser
          ? 'bg-blue-600/20 border border-blue-500/20'
          : 'bg-cyan-950/10 border border-cyan-500/10'
      }`}>
        <Text className="text-[10px] font-bold tracking-wider text-cyan-400 mb-1">
          {isUser ? '👤 你' : '🏛️ Hexa AI Counsel'}
        </Text>
        <Text className="text-sm leading-relaxed text-white/90">
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export function ModuleFourPanel({ data }: { data: ModuleFourData }) {
  const userTier = useStore((state) => state.userTier);
  const session = useStore((state) => state.session);
  const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);

  const [messages, setMessages] = useState<ChatMessage[]>(data.initialMessages ?? []);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isPro = userTier === 'Pro';

  // 加载历史聊天记录
  useEffect(() => {
    if (historyLoaded || !data.divinationId) return;

    const loadHistory = async () => {
      try {
        const { data: rows } = await supabase
          .from('chat_messages')
          .select('role, content, created_at')
          .eq('divination_id', data.divinationId)
          .order('created_at', { ascending: true });

        if (rows && rows.length > 0) {
          setMessages(rows as ChatMessage[]);
        }
      } catch (err) {
        console.error('load chat history error:', err);
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [data.divinationId, historyLoaded]);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // 发送消息
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || sending || !isPro) return;

    // 乐观更新：立即显示用户消息
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setSending(true);

    try {
      // 构造历史记录
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await chat({
        divinationId: data.divinationId,
        message: text,
        chatHistory,
      });

      if (result.success && result.reply) {
        // AI 回复（Edge Function 已存到 DB，这里直接显示）
        const aiMsg: ChatMessage = { role: 'model', content: result.reply };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(result.error || 'AI 回复失败');
      }
    } catch (err: any) {
      console.error('chat error:', err);
      // 移除刚才乐观添加的用户消息
      setMessages((prev) => prev.slice(0, -1));
      Alert.alert('对话错误', err.message || '请稍后重试');
    } finally {
      setSending(false);
    }
  }, [inputValue, sending, messages, data.divinationId, isPro]);

  // 升级 Pro
  const handleUpgrade = useCallback(() => {
    // 关闭当前页面，回到首页弹出订阅窗？
    // 简单处理：提示用户
    Alert.alert(
      'Pro 会员专属',
      'Hexa AI Counsel 深度对话仅限 Pro 会员使用。是否前往升级？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '去升级',
          onPress: () => {
            // 打开订阅弹窗 - 通过 router 回到首页
            // 简化处理：存一个标记，首页检测到后自动弹出
          },
        },
      ],
    );
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="h-[420] min-h-0 flex-1 flex-col justify-between overflow-hidden border-white/5 bg-[#0d1322] p-4"
    >
      {/* Header */}
      <View className="mb-3 shrink-0 flex-row items-center justify-between border-b border-dashed border-cyan-500/15 pb-2.5">
        <View className="flex-row items-center gap-2 bg-transparent">
          <View className="h-2 w-2">
            <View className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <View className="h-full w-full rounded-full bg-cyan-500" />
          </View>
          <Text size={10} className="font-bold uppercase tracking-wider text-cyan-400">
            ⚡ Hexa AI Chat Counsel
          </Text>
        </View>
        {!isPro && (
          <View className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
            <Text size={8} className="font-bold uppercase tracking-wider text-amber-400">
              Pro
            </Text>
          </View>
        )}
      </View>

      {/* Messages area */}
      <ScrollView
        ref={scrollRef}
        className="mb-3 flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 4 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          /* Welcome screen */
          <View className="flex-1 items-center justify-center py-8">
            <View className="w-full max-w-lg px-2">
              {/* Welcome briefing */}
              {!historyLoaded ? (
                <ActivityIndicator size="small" color="#22d3ee" />
              ) : (
                <>
                  <View className="mb-4 rounded border border-dashed border-cyan-500/10 bg-white/5 p-3">
                    <Text className="mb-1 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                      ⚜️ [ Hexa Advisor Alignment Briefing ]
                    </Text>
                    <Text className="text-[11px] leading-relaxed text-white/70">
                      我是 Hexa 决策参谋。已挂载本卷轴的五行运数。请在下方输入您考虑的战术变化（如：延长收账期限、重构履约合同、引入第三方担保、进行仓储对冲），以便精确推演您的策略抉择、资金安全和外部应力的动态转化。
                    </Text>
                  </View>
                  {data.welcomeMessages.map((msg, i) => (
                    <GradientWelcomeText key={i} text={msg} />
                  ))}
                  {/* Free 用户提示 */}
                  {!isPro && (
                    <View className="mt-4 rounded border border-amber-500/20 bg-amber-500/5 p-3">
                      <Text className="text-center text-xs text-amber-400/80">
                        💎 Hexa AI Counsel 深度对话为 Pro 会员专属功能
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        ) : (
          /* Chat messages */
          <>
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            {sending && (
              <View className="mb-3 items-start">
                <View className="rounded-xl border border-cyan-500/10 bg-cyan-950/5 px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#22d3ee" />
                    <Text className="text-xs text-cyan-400/70">Hexa AI 思考中...</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input bar */}
      <View className="w-full rounded-full border border-neutral-800 bg-black/60 p-1 shadow-sm">
        <View className="flex-row items-center gap-2 bg-transparent">
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={isPro ? data.inputPlaceholder : 'Pro 会员专属功能'}
            placeholderTextColor="#525252"
            editable={isPro}
            className="flex-1 px-4 py-2 font-sans text-sm text-white"
          />
          {isPro ? (
            <Pressable
              disabled={!inputValue.trim() || sending}
              onPress={handleSend}
              className="mr-1 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm disabled:opacity-30"
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text size={14} className="font-bold text-white">↑</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={handleUpgrade}
              className="mr-1 h-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 px-3"
            >
              <Text size={10} className="font-bold text-amber-400">升级</Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
