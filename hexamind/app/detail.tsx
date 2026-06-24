import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable } from 'react-native'
import { Stack, useLocalSearchParams, router } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { MainLayout } from '@/components/main-layout'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { DetailScreenContent } from '@/components/detail'
import type { DetailScreenData } from '@/components/detail/types'
import { Text } from '@/components/themed-text'
import { View } from '@/components/themed-view'
import { useStore } from '@/store'
import { divinationsRepository } from '@/db/apis'
import type { Database } from '@/db/database.types'
import type { DivinationResult, Trigram } from '@/types'

type DivinationRow = Database['public']['Tables']['divinations']['Row']

/**
 * 将 DB row 映射为 DetailScreenData
 */
function mapRowToDetailData(row: DivinationRow): DetailScreenData {
  const originalUpper = row.original_upper_trigram as unknown as Trigram | null
  const originalLower = row.original_lower_trigram as unknown as Trigram | null
  const nuclearUpper = row.nuclear_upper_trigram as unknown as Trigram | null
  const nuclearLower = row.nuclear_lower_trigram as unknown as Trigram | null
  const transformedUpper = row.transformed_upper_trigram as unknown as Trigram | null
  const transformedLower = row.transformed_lower_trigram as unknown as Trigram | null

  function linesToHexagramLines(lines: number[] | null) {
    if (!lines) return []
    return lines.map((val, idx) => ({
      solid: val === 1,
      active: idx + 1 === row.changing_line,
    }))
  }

  const ausp = row.relationship_auspiciousness
  let verdictTone: 'emerald' | 'amber' | 'rose' | 'slate' = 'slate'
  if (ausp === 'Extremely Auspicious' || ausp === '大吉') verdictTone = 'emerald'
  else if (ausp === 'Auspicious' || ausp === '吉') verdictTone = 'amber'
  else if (ausp === 'Highly Inauspicious' || ausp === '凶') verdictTone = 'rose'

  const verdictLabels: Record<string, string> = {
    'Extremely Auspicious': '大吉',
    'Auspicious': '吉',
    'Leak': '泄',
    'Exhausting': '平',
    'Highly Inauspicious': '凶',
    'Neutral': '中',
  }

  const tacticalActions = (row.ai_tactical_actions as string[]) ?? []

  const originalLines = (row.original_chart_lines as number[]) ?? []

  return {
    moduleOne: {
      title: '模块 1: 时空态势矢量及状态转移',
      subtitle: '初始状态（本）、过渡关联状态（互）与前瞻终局状态（变）的对比分析',
      sources: [
        { label: '时间随机源 (HEX)', value: row.temporal_seed_hex ?? String(row.temporal_seed_raw), tone: 'orange' },
        { label: '空间随机源 (LAT/LNG)', value: row.spatial_seed_formatted ?? `${row.latitude}°N, ${row.longitude}°E`, tone: 'blue' },
        { label: '触控动能源 (ACC)', value: `${row.kinetic_seed_raw.toFixed(3)} m/s²`, tone: 'purple' },
      ],
      cards: [
        {
          label: '本卦',
          name: row.original_chart_name,
          symbol: row.original_chart_symbol ?? '',
          top: { name: originalUpper?.name ?? '', element: `(${originalUpper?.element ?? ''})` },
          bottom: { name: originalLower?.name ?? '', element: `(${originalLower?.element ?? ''})` },
          lines: linesToHexagramLines(originalLines),
        },
        {
          label: '互卦',
          name: row.nuclear_chart_name || '—',
          symbol: row.nuclear_chart_symbol || '—',
          top: { name: nuclearUpper?.name ?? '', element: `(${nuclearUpper?.element ?? ''})` },
          bottom: { name: nuclearLower?.name ?? '', element: `(${nuclearLower?.element ?? ''})` },
          lines: linesToHexagramLines(row.nuclear_chart_lines as number[]),
        },
        {
          label: '变卦',
          name: row.transformed_chart_name || '—',
          symbol: row.transformed_chart_symbol || '—',
          top: { name: transformedUpper?.name ?? '', element: `(${transformedUpper?.element ?? ''})` },
          bottom: { name: transformedLower?.name ?? '', element: `(${transformedLower?.element ?? ''})` },
          lines: linesToHexagramLines(row.transformed_chart_lines as number[]),
        },
      ],
    },
    moduleTwo: {
      title: '模块 2: 要素关联对冲矩阵',
      subtitle: '评估外部环境对决策主体的驱动或阻碍作用',
      body: {
        role: '体',
        roleDescription: '决策主体 / 自有资本',
        symbol: row.ti_trigram_name ?? '',
        element: `(${row.ti_element ?? ''})`,
        factorLabel: '(基准因子 (Ti))',
      },
      application: {
        role: '用',
        roleDescription: '分析目标 / 外部事件',
        symbol: row.yong_trigram_name ?? '',
        element: `(${row.yong_element ?? ''})`,
        factorLabel: '(关联因子 (Yong))',
      },
      formulaEyebrow: '要素多轴交互对冲公式',
      formulaTitle: row.relationship_conclusion,
      formulaQuote: row.relationship_chinese_interpretation ? `"${row.relationship_chinese_interpretation}"` : '—',
      catalyst: {
        label: '动态局势转换催化：',
        value: `从下往上数第 ${row.changing_line} 行决策变量（爻）发生转变，从而催化大局演变`,
      },
      interpretation: [
        { title: `第 ${row.changing_line} 爻（前线作业层）`, description: '项目直接骨干与核心推进要项' },
        { title: '现实场景决策影响推演', description: '当前变数发生在具体的执行层。策略上应重点调整直接承接团队或交付条款。' },
      ],
    },
    moduleThree: {
      title: '模块 3: 决策多能分析综述',
      subtitle: '结合易理提供定量风险提示及行动路径',
      verdictLabel: verdictLabels[ausp] || ausp,
      verdictTone: verdictTone as any,
      summaryQuote: `"${row.relationship_chinese_interpretation || '体用关系判定完成'}"`,
      macroAnalysis: {
        heading: '宏观战略局势判定与风险量化分析',
        content: row.ai_analysis || `基于 ${row.original_chart_name} 卦象分析。`,
      },
      tacticsHeading: '战略微调及对冲纠偏战术步骤',
      tactics: tacticalActions.length > 0
        ? tacticalActions.map((text, i) => ({ index: String(i + 1).padStart(2, '0'), text, actionLabel: '模拟推演' }))
        : [{ index: '01', text: `当前体用关系为 ${row.relationship_conclusion}，建议结合具体场景制定应对策略。`, actionLabel: '模拟推演' }],
      infoCards: [
        { title: '能量转换最佳执行窗口', body: row.ai_catalyst_window || '待 AI 分析补充', badge: '日历同步就绪' },
        { title: '环境微观物理信号指标', body: row.ai_phenomenological_echo || '待 AI 分析补充' },
        { title: '三才置信度评分', body: `San-Cai Confidence: ${(row.confidence_score ?? 0).toFixed(2)} / 100` },
        { title: '体用判定', body: `${row.relationship_conclusion} — ${row.relationship_type}` },
      ],
    },
    moduleFour: {
      divinationId: row.id,
      sessionId: row.id.slice(0, 8),
      inputPlaceholder: '问问 HEXA AI...',
      welcomeMessages: ['已就位，随时可以仿真要素演化路径。'],
      initialMessages: [],
    },
  }
}

/**
 * 将 store 中的 DivinationResult 映射为 DetailScreenData
 */
function mapResultToDetailData(result: DivinationResult, id: string): DetailScreenData {
  const { payload, confidenceScore } = result
  const { charts, relationship, tiGua, yongGua, changingLine, temporalSeed, spatialSeed, kineticSeed } = payload

  function linesToHexagramLines(lines: number[]) {
    return lines.map((val, idx) => ({ solid: val === 1, active: idx + 1 === changingLine }))
  }

  const ausp = relationship.auspiciousness
  const labels: Record<string, string> = { 'Extremely Auspicious': '大吉', 'Auspicious': '吉', 'Leak': '泄', 'Exhausting': '平', 'Highly Inauspicious': '凶', 'Neutral': '中' }
  let tone: 'emerald' | 'amber' | 'rose' | 'slate' = 'slate'
  if (ausp === 'Extremely Auspicious' || ausp === '大吉') tone = 'emerald'
  else if (ausp === 'Auspicious' || ausp === '吉') tone = 'amber'
  else if (ausp === 'Highly Inauspicious' || ausp === '凶') tone = 'rose'

  const tactics = result.aiOutput?.tacticalAction ?? []

  return {
    moduleOne: {
      title: '模块 1: 时空态势矢量及状态转移',
      subtitle: '初始状态（本）、过渡关联状态（互）与前瞻终局状态（变）的对比分析',
      sources: [
        { label: '时间随机源 (HEX)', value: temporalSeed.hex, tone: 'orange' },
        { label: '空间随机源 (LAT/LNG)', value: spatialSeed.formatted, tone: 'blue' },
        { label: '触控动能源 (ACC)', value: `${kineticSeed.rawValue.toFixed(3)} m/s²`, tone: 'purple' },
      ],
      cards: [
        { label: '本卦', name: charts.original.name, symbol: charts.original.symbol, top: { name: charts.original.upper.name, element: `(${charts.original.upper.element})` }, bottom: { name: charts.original.lower.name, element: `(${charts.original.lower.element})` }, lines: linesToHexagramLines(charts.original.lines) },
        { label: '互卦', name: charts.nuclear.name || '—', symbol: charts.nuclear.symbol || '—', top: { name: charts.nuclear.upper?.name ?? '', element: `(${charts.nuclear.upper?.element ?? ''})` }, bottom: { name: charts.nuclear.lower?.name ?? '', element: `(${charts.nuclear.lower?.element ?? ''})` }, lines: linesToHexagramLines(charts.nuclear.lines) },
        { label: '变卦', name: charts.transformed.name || '—', symbol: charts.transformed.symbol || '—', top: { name: charts.transformed.upper?.name ?? '', element: `(${charts.transformed.upper?.element ?? ''})` }, bottom: { name: charts.transformed.lower?.name ?? '', element: `(${charts.transformed.lower?.element ?? ''})` }, lines: linesToHexagramLines(charts.transformed.lines) },
      ],
    },
    moduleTwo: {
      title: '模块 2: 要素关联对冲矩阵',
      subtitle: '评估外部环境对决策主体的驱动或阻碍作用',
      body: { role: '体', roleDescription: '决策主体 / 自有资本', symbol: tiGua.trigram.name, element: `(${tiGua.trigram.element})`, factorLabel: '(基准因子 (Ti))' },
      application: { role: '用', roleDescription: '分析目标 / 外部事件', symbol: yongGua.trigram.name, element: `(${yongGua.trigram.element})`, factorLabel: '(关联因子 (Yong))' },
      formulaEyebrow: '要素多轴交互对冲公式',
      formulaTitle: relationship.conclusion,
      formulaQuote: relationship.chineseInterpretation ? `"${relationship.chineseInterpretation}"` : '—',
      catalyst: { label: '动态局势转换催化：', value: `从下往上数第 ${changingLine} 行决策变量（爻）发生转变，从而催化大局演变` },
      interpretation: [
        { title: `第 ${changingLine} 爻（前线作业层）`, description: '项目直接骨干与核心推进要项' },
        { title: '现实场景决策影响推演', description: '当前变数发生在具体的执行层。策略上应重点调整直接承接团队或交付条款。' },
      ],
    },
    moduleThree: {
      title: '模块 3: 决策多能分析综述',
      subtitle: '结合易理提供定量风险提示及行动路径',
      verdictLabel: labels[ausp] || ausp,
      verdictTone: tone as any,
      summaryQuote: `"${relationship.chineseInterpretation || '体用关系判定完成'}"`,
      macroAnalysis: {
        heading: '宏观战略局势判定与风险量化分析',
        content: result.aiOutput?.analysis || `基于 ${charts.original.name} 卦象分析。`,
      },
      tacticsHeading: '战略微调及对冲纠偏战术步骤',
      tactics: tactics.length > 0
        ? tactics.map((text, i) => ({ index: String(i + 1).padStart(2, '0'), text, actionLabel: '模拟推演' }))
        : [{ index: '01', text: `当前体用关系为 ${relationship.conclusion}，建议结合具体场景制定应对策略。`, actionLabel: '模拟推演' }],
      infoCards: [
        { title: '能量转换最佳执行窗口', body: result.aiOutput?.catalystWindow || '待 AI 分析补充', badge: '日历同步就绪' },
        { title: '环境微观物理信号指标', body: result.aiOutput?.phenomenologicalEcho || '待 AI 分析补充' },
        { title: '三才置信度评分', body: `San-Cai Confidence: ${(confidenceScore ?? 0).toFixed(2)} / 100` },
        { title: '体用判定', body: `${relationship.conclusion} — ${relationship.type}` },
      ],
    },
    moduleFour: {
      divinationId: id,
      sessionId: id.slice(0, 8),
      inputPlaceholder: '问问 HEXA AI...',
      welcomeMessages: ['已就位，随时可以仿真要素演化路径。'],
      initialMessages: [],
    },
  }
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const [data, setData] = useState<DetailScreenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('缺少占卜记录 ID')
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      // 优先从 Supabase 读取
      try {
        const row = await divinationsRepository.getById(id)
        if (!cancelled) {
          if (row) {
            setData(mapRowToDetailData(row))
            setLoading(false)
            return
          }
        }
      } catch {
        // Supabase 读取失败，降级到 store
      }

      // 降级：从 store 读取
      const state = useStore.getState()
      const result = state.currentResultId === id ? state.currentResult : null
      if (!cancelled && result) {
        setData(mapResultToDetailData(result, id))
        setLoading(false)
        return
      }

      if (!cancelled) {
        setError('记录未找到')
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-white/60">{t('loading')}</Text>
        </View>
      </MainLayout>
    )
  }

  if (error || !data) {
    return (
      <MainLayout>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-red-400">{error || t('errorGeneric')}</Text>
          <Pressable onPress={() => router.back()} className="rounded-sm border border-white/20 px-4 py-2">
            <Text className="text-white">{t('goBack')}</Text>
          </Pressable>
        </View>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Stack.Screen options={{ headerShown: true, title: data.moduleOne?.cards[0]?.name || 'HexaMind' }} />
      <ParallaxScrollView>
        <DetailScreenContent data={data} />
      </ParallaxScrollView>
    </MainLayout>
  )
}
