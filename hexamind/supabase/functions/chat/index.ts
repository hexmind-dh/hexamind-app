// @ts-nocheck
// Supabase Edge Function: Hexa AI Counsel 聊天
//
// 调用: supabase.functions.invoke('chat', {
//   body: { divinationId, message, chatHistory }
// })
// 部署: supabase functions deploy chat --no-verify-jwt
//
// 1. 验证用户身份 + Pro 权限检查
// 2. 保存用户消息到 chat_messages
// 3. 转发到 AI 推理引擎
// 4. 保存 AI 回复到 chat_messages
// 5. 返回回复

import { createClient } from 'npm:@supabase/supabase-js@2.49.4'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

/** HexaMind AI 聊天引擎地址 */
const AI_CHAT_URL = 'https://hexamind-404145259086.asia-south1.run.app/api/chat'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    // ===== 1. 验证用户身份 =====
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { headers, status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { headers, status: 401 })
    }

    const userId = user.id

    // ===== 2. 检查 Pro 权限 =====
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single()

    if (profile?.tier !== 'Pro') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Hexa AI Counsel 仅限 Pro 会员使用，请升级后重试',
      }), { headers, status: 403 })
    }

    // ===== 3. 解析请求 =====
    const { divinationId, message, chatHistory } = await req.json()

    if (!divinationId) {
      return new Response(JSON.stringify({ success: false, error: 'divinationId is required' }), { headers, status: 400 })
    }

    if (!message?.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'message is required' }), { headers, status: 400 })
    }

    // ===== 4. 获取 divination 元数据（用于 AI 上下文） =====
    const { data: divination } = await supabase
      .from('divinations')
      .select('question, original_chart_name, relationship_conclusion, relationship_auspiciousness, ai_verdict, ai_analysis, created_at')
      .eq('id', divinationId)
      .single()

    if (!divination) {
      return new Response(JSON.stringify({ success: false, error: 'Divination not found' }), { headers, status: 404 })
    }

    // ===== 5. 保存用户消息 =====
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        id: crypto.randomUUID(),
        divination_id: divinationId,
        user_id: userId,
        role: 'user',
        content: message.trim(),
      })

    if (msgError) {
      console.error('Failed to save user message:', msgError)
    }

    // ===== 6. 转发到 AI 聊天引擎 =====
    const metadata = {
      hexagram: divination.original_chart_name,
      relationship: {
        conclusion: divination.relationship_conclusion,
        auspiciousness: divination.relationship_auspiciousness,
      },
      analysis: divination.ai_analysis,
      verdict: divination.ai_verdict,
      question: divination.question,
      timestamp: divination.created_at,
    }

    const engineResponse = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: divinationId,
        user_tier: 'Pro',
        message: message.trim(),
        chat_history: chatHistory ?? [],
        metadata,
      }),
    })

    if (!engineResponse.ok) {
      const errorText = await engineResponse.text()
      console.error('AI chat engine error:', engineResponse.status, errorText)
      return new Response(JSON.stringify({
        success: false,
        error: `AI engine error: ${engineResponse.status}`,
      }), { headers, status: 502 })
    }

    const engineResult = await engineResponse.json()

    if (!engineResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: engineResult.error || 'AI engine returned failure',
      }), { headers, status: 502 })
    }

    const reply = engineResult.reply

    // ===== 7. 保存 AI 回复 =====
    const { error: replyError } = await supabase
      .from('chat_messages')
      .insert({
        id: crypto.randomUUID(),
        divination_id: divinationId,
        user_id: userId,
        role: 'model',
        content: reply,
      })

    if (replyError) {
      console.error('Failed to save AI reply:', replyError)
    }

    // ===== 8. 返回结果 =====
    return new Response(JSON.stringify({
      success: true,
      reply,
    }), { headers, status: 200 })

  } catch (err) {
    console.error('chat error:', err)
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    }), { headers, status: 500 })
  }
})
