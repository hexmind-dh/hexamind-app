// Supabase Edge Function: 梅花易数推演
//
// 调用: supabase.functions.invoke('divinate', { body: { question, latitude, longitude, kineticValue, timestamp, language } })
// 部署: supabase functions deploy divinate --no-verify-jwt
//
// 1. 验证用户身份
// 2. 转发请求到 HexaMind AI 推理引擎
// 3. 保存占卜记录到 Supabase
// 4. 返回完整结果

import { createClient } from 'npm:@supabase/supabase-js@2.49.4'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

/** HexaMind AI 推理引擎地址 */
const AI_ENGINE_URL = 'https://hexamind-404145259086.asia-south1.run.app/api/divinate'

serve(async (req) => {
  // CORS 预检
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

    // ===== 2. 解析请求并获取用户 tier =====
    const { question, latitude, longitude, kineticValue, timestamp, language } = await req.json()

    if (!question?.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'question is required' }), { headers, status: 400 })
    }

    // 获取用户 tier，用于外部引擎的配额/功能控制
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single()

    const userTier = profile?.tier === 'Pro' ? 'Pro' : 'Free'

    // ===== 3. 转发到 AI 推理引擎 =====
    const engineResponse = await fetch(AI_ENGINE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        latitude,
        longitude,
        kineticValue,
        timestamp,
        language,
        user_tier: userTier,
      }),
    })

    if (!engineResponse.ok) {
      const errorText = await engineResponse.text()
      console.error('AI engine error:', engineResponse.status, errorText)
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

    // ===== 4. 保存占卜记录到 Supabase =====
    const payload = engineResult.payload
    const input = engineResult.input
    let recordId: string | null = null

    // 保存到数据库（如果失败则记录日志，不阻断返回）
    if (payload) {
      const { data: inserted, error: insertError } = await supabase
        .from('divinations')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          question: question.trim(),
          language: language || 'zh-CN',
          temporal_seed_raw: payload.temporalSeed?.rawValue ?? input?.timestamp ?? Date.now(),
          temporal_seed_hex: payload.temporalSeed?.hex ?? null,
          latitude: payload.spatialSeed?.lat ?? input?.latitude ?? 31.23,
          longitude: payload.spatialSeed?.lng ?? input?.longitude ?? 121.47,
          spatial_seed_formatted: payload.spatialSeed?.formatted ?? null,
          kinetic_seed_raw: payload.kineticSeed?.rawValue ?? input?.kineticValue ?? 1.23,
          original_chart_name: payload.charts?.original?.name ?? '',
          original_chart_english: payload.charts?.original?.english ?? null,
          original_chart_symbol: payload.charts?.original?.symbol ?? null,
          original_chart_lines: payload.charts?.original?.lines ?? null,
          original_upper_trigram: payload.charts?.original?.upper ?? null,
          original_lower_trigram: payload.charts?.original?.lower ?? null,
          nuclear_chart_name: payload.charts?.nuclear?.name ?? null,
          nuclear_chart_english: payload.charts?.nuclear?.english ?? null,
          nuclear_chart_symbol: payload.charts?.nuclear?.symbol ?? null,
          nuclear_chart_lines: payload.charts?.nuclear?.lines ?? null,
          nuclear_upper_trigram: payload.charts?.nuclear?.upper ?? null,
          nuclear_lower_trigram: payload.charts?.nuclear?.lower ?? null,
          transformed_chart_name: payload.charts?.transformed?.name ?? null,
          transformed_chart_english: payload.charts?.transformed?.english ?? null,
          transformed_chart_symbol: payload.charts?.transformed?.symbol ?? null,
          transformed_chart_lines: payload.charts?.transformed?.lines ?? null,
          transformed_upper_trigram: payload.charts?.transformed?.upper ?? null,
          transformed_lower_trigram: payload.charts?.transformed?.lower ?? null,
          changing_line: payload.changingLine ?? 0,
          ti_gua_role: payload.tiGua?.role ?? '',
          ti_trigram_id: payload.tiGua?.trigram?.id ?? 0,
          ti_trigram_name: payload.tiGua?.trigram?.name ?? null,
          ti_element: payload.tiGua?.trigram?.element ?? null,
          yong_gua_role: payload.yongGua?.role ?? '',
          yong_trigram_id: payload.yongGua?.trigram?.id ?? 0,
          yong_trigram_name: payload.yongGua?.trigram?.name ?? null,
          yong_element: payload.yongGua?.trigram?.element ?? null,
          relationship_type: payload.relationship?.type ?? '',
          relationship_conclusion: payload.relationship?.conclusion ?? '',
          relationship_auspiciousness: payload.relationship?.auspiciousness ?? '',
          relationship_chinese_interpretation: payload.relationship?.chineseInterpretation ?? null,
          confidence_score: engineResult.confidenceScore ?? null,
          ai_verdict: engineResult.aiOutput?.verdict ?? null,
          ai_analysis: engineResult.aiOutput?.analysis ?? null,
          ai_tactical_actions: engineResult.aiOutput?.tacticalAction ?? null,
          ai_phenomenological_echo: engineResult.aiOutput?.phenomenologicalEcho ?? null,
          ai_catalyst_window: engineResult.aiOutput?.catalystWindow ?? null,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Failed to save divination:', JSON.stringify(insertError))
      } else if (inserted) {
        recordId = inserted.id
      } else {
        console.error('Insert returned no data and no error - possible BEFORE trigger issue')
      }
    }

    // ===== 5. 返回完整结果 =====
    return new Response(JSON.stringify({
      success: true,
      recordId,
      input: engineResult.input,
      payload: engineResult.payload,
      confidenceScore: engineResult.confidenceScore,
      aiOutput: engineResult.aiOutput,
    }), { headers, status: 200 })

  } catch (err) {
    console.error('divinate error:', err)
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Internal server error',
    }), { headers, status: 500 })
  }
})
