import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { MainLayout } from '@/components/main-layout'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { HistoryList } from '@/components/history'
import type { HistoryListData, StatusBadgeData, HistoryRecordData } from '@/components/history/types'
import { Text } from '@/components/themed-text'
import { View } from '@/components/themed-view'
import { useStore } from '@/store'
import { divinationsRepository } from '@/db/apis'
import type { Database } from '@/db/database.types'

type DivinationRow = Database['public']['Tables']['divinations']['Row']

/** 吉凶 → badge tone 映射 */
function auspiciousnessToBadge(ausp: string): StatusBadgeData {
  const map: Record<string, StatusBadgeData> = {
    'Extremely Auspicious': { label: '极佳态势', tone: 'emerald' },
    'Auspicious': { label: '积极顺遂', tone: 'cyan' },
    'Leak': { label: '外泄消耗', tone: 'amber' },
    'Exhausting': { label: '势均力敌', tone: 'slate' },
    'Highly Inauspicious': { label: '高危冲突', tone: 'amber' },
  }
  return map[ausp] || { label: ausp, tone: 'slate' }
}

/** 体用结论 → 关系描述 */
function conclusionToLabel(conclusion: string): string {
  const map: Record<string, string> = {
    '用生体': '用生体 — 外部赋能 / 供能通畅',
    '体用比和': '体用比和 — 平衡共生 / 双向赋能',
    '体生用': '体生用 — 资本支出 / 动能外泄',
    '体克用': '体克用 — 强力掌控 / 控制局面',
    '用克体': '用克体 — 高危摩擦 / 外部压制',
  }
  return map[conclusion] || conclusion
}

/** 格式化日期 */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** 将 DB row 转为历史卡片数据 */
function rowToRecord(row: DivinationRow): HistoryRecordData {
  return {
    id: row.id,
    date: formatDate(row.created_at),
    description: row.question,
    hexagramName: row.original_chart_name,
    statusBadge: auspiciousnessToBadge(row.relationship_auspiciousness),
    relationshipLabel: conclusionToLabel(row.relationship_conclusion),
    isActive: false,
    isLive: false,
  }
}

export default function HistoryScreen() {
  const session = useStore((state) => state.session)
  const localItems = useStore((state) => state.historyItems)
  const loadHistoryFromStorage = useStore((state) => state.loadHistoryFromStorage)
  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [serverRecords, setServerRecords] = useState<HistoryRecordData[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // 1. 先加载本地缓存
      await loadHistoryFromStorage()

      // 2. 从 Supabase 拉取服务端数据
      if (session?.user?.id) {
        try {
          const rows = await divinationsRepository.listByUser(session.user.id, { limit: 50 })
          if (!cancelled) {
            setServerRecords(rows.map(rowToRecord))
          }
        } catch (err) {
          console.error('Failed to fetch history from Supabase:', err)
          // 服务端失败时保留本地数据
        }
      }

      if (!cancelled) setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [session?.user?.id, loadHistoryFromStorage])

  // 合并：服务端数据优先，追加本地尚未同步的记录
  const serverIds = new Set(serverRecords.map((r) => r.id))
  const localExtra = localItems
    .filter((item) => !serverIds.has(item.id))
    .map((item) => ({
      id: item.id,
      date: formatDate(item.date),
      description: item.question,
      hexagramName: item.originalGua,
      statusBadge: auspiciousnessToBadge(item.auspiciousness),
      relationshipLabel: conclusionToLabel(item.conclusion),
      isActive: false,
      isLive: false,
    }))

  const mergedRecords = [...localExtra, ...serverRecords]

  const data: HistoryListData = {
    searchPlaceholder: t('searchHistory'),
    records: mergedRecords,
  }

  return (
    <MainLayout>
      <Stack.Screen options={{ headerShown: true, title: t('history') }} />
      <ParallaxScrollView>
        {loading ? (
          <View className="flex-1 items-center justify-center py-32">
            <ActivityIndicator />
            <Text className="mt-3 text-white/60">{t('loading')}</Text>
          </View>
        ) : (
          <HistoryList data={data} />
        )}
      </ParallaxScrollView>
    </MainLayout>
  )
}
