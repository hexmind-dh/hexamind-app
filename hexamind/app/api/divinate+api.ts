import { runMeihuaCalculation, getGanzhiTime, calculateSanCaiConfidence } from '@/utils/meihuaEngine'
import { supabaseAdmin } from '@/db/supabase-admin'

/**
 * POST /api/divinate
 *
 * 推演接口：接收决策问题 → 服务端计算梅花易数 → 写入 Supabase → 返回完整结果
 *
 * 请求头需携带:
 *   Authorization: Bearer <supabase_access_token>
 *
 * 请求体：
 *   { question, latitude, longitude, kineticValue, timestamp, language }
 *
 * 响应：
 *   { success, recordId, input, payload, confidenceScore, aiOutput }
 */
export async function POST(request: Request) {
  try {
    // 1. 从 Authorization header 提取并验证用户身份
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'Missing or invalid Authorization header' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !userData?.user?.id) {
      return Response.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    const userId = userData.user.id

    // 2. 解析请求体
    const body = await request.json()
    const {
      question,
      latitude = 31.23,
      longitude = 121.47,
      kineticValue = 1.23,
      timestamp = Date.now(),
      language = 'zh-CN',
    } = body

    if (!question?.trim()) {
      return Response.json({ success: false, error: 'question is required' }, { status: 400 })
    }

    // 3. 梅花易数计算
    const resolvedTs = typeof timestamp === 'number' ? timestamp : Date.now()
    const resolvedLat = typeof latitude === 'number' ? latitude : 31.23
    const resolvedLng = typeof longitude === 'number' ? longitude : 121.47
    const resolvedK = typeof kineticValue === 'number' ? kineticValue : 1.23

    const payload = runMeihuaCalculation(resolvedTs, resolvedLat, resolvedLng, resolvedK)
    const ganzhi = getGanzhiTime(resolvedTs)

    // 4. 三才置信度
    const monthPart = ganzhi.split(' ')[1]
    const monthBranch = monthPart ? monthPart.charAt(1) : '巳'
    const confidenceScore = calculateSanCaiConfidence(
      payload.tiGua.trigram.element,
      monthBranch,
      resolvedLat,
      resolvedLng,
      [resolvedK],
    )

    // 5. 写入 Supabase（service_role 绕过 RLS，显式设置 user_id）
    const { data: record, error } = await supabaseAdmin
      .from('divinations')
      .insert({
        user_id: userId,
        question: question.trim(),
        language,
        temporal_seed_raw: resolvedTs,
        temporal_seed_hex: payload.temporalSeed.hex,
        latitude: resolvedLat,
        longitude: resolvedLng,
        spatial_seed_formatted: payload.spatialSeed.formatted,
        kinetic_seed_raw: resolvedK,
        original_chart_name: payload.charts.original.name,
        original_chart_english: payload.charts.original.english,
        original_chart_symbol: payload.charts.original.symbol,
        original_chart_lines: payload.charts.original.lines as any,
        original_upper_trigram: payload.charts.original.upper as any,
        original_lower_trigram: payload.charts.original.lower as any,
        nuclear_chart_name: payload.charts.nuclear.name,
        nuclear_chart_english: payload.charts.nuclear.english,
        nuclear_chart_symbol: payload.charts.nuclear.symbol,
        nuclear_chart_lines: payload.charts.nuclear.lines as any,
        nuclear_upper_trigram: payload.charts.nuclear.upper as any,
        nuclear_lower_trigram: payload.charts.nuclear.lower as any,
        transformed_chart_name: payload.charts.transformed.name,
        transformed_chart_english: payload.charts.transformed.english,
        transformed_chart_symbol: payload.charts.transformed.symbol,
        transformed_chart_lines: payload.charts.transformed.lines as any,
        transformed_upper_trigram: payload.charts.transformed.upper as any,
        transformed_lower_trigram: payload.charts.transformed.lower as any,
        changing_line: payload.changingLine,
        ti_gua_role: payload.tiGua.role,
        ti_trigram_id: payload.tiGua.trigram.id,
        ti_trigram_name: payload.tiGua.trigram.name,
        ti_element: payload.tiGua.trigram.element,
        yong_gua_role: payload.yongGua.role,
        yong_trigram_id: payload.yongGua.trigram.id,
        yong_trigram_name: payload.yongGua.trigram.name,
        yong_element: payload.yongGua.trigram.element,
        relationship_type: payload.relationship.type,
        relationship_conclusion: payload.relationship.conclusion,
        relationship_auspiciousness: payload.relationship.auspiciousness,
        relationship_chinese_interpretation: payload.relationship.chineseInterpretation,
        confidence_score: confidenceScore,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    // 6. 构建 AI 输出
    const verdictMap: Record<string, string> = {
      'Extremely Auspicious': 'Critical Advantage',
      'Auspicious': 'Auspicious Growth',
      'Leak': 'Leaking / Drainage',
      'Exhausting': 'Warning / Conflict',
      'Highly Inauspicious': 'Systemic Risk',
    }

    const aiOutput = {
      verdict: verdictMap[payload.relationship.auspiciousness] || 'Equilibrium',
      analysis: `基于 ${payload.charts.original.name} 卦象分析。\n${payload.relationship.chineseInterpretation}`,
      tacticalAction: [
        `当前体用关系为 ${payload.relationship.conclusion}，${payload.relationship.chineseInterpretation}`,
      ],
      phenomenologicalEcho: `三才置信度：${confidenceScore.toFixed(2)} / 100`,
      catalystWindow: payload.tiGua.trigram.element === 'Fire' ? '午时 (11:00-13:00)' : '卯时 (05:00-07:00)',
    }

    // 7. 返回完整结果
    return Response.json({
      success: true,
      recordId: record.id,
      input: { question, latitude: resolvedLat, longitude: resolvedLng, kineticValue: resolvedK, timestamp: resolvedTs },
      payload,
      confidenceScore,
      aiOutput,
    })
  } catch (err: any) {
    console.error('/api/divinate error:', err)
    return Response.json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
