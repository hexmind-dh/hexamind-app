import type { HistoryListData } from '@/components/history/types';

export const mockHistoryData: HistoryListData = {
  searchPlaceholder: '搜索卦名或占问主题...',
  records: [
    {
      id: '1',
      date: '',
      description: '系统月度自动校准：Q2 宏观战略平衡评估与跨境资本流控制矩阵',
      hexagramName: '天火同人',
      statusBadge: { label: '极佳态势', tone: 'emerald' },
      relationshipLabel: '体用比和 — 平衡共生 / 双向赋能 (Equal Cohesion)',
      isActive: false,
      isLive: true,
      isPeriodicBriefing: true,
      periodicLabel: '[ PERIODIC BRIEFING / 定期分析 ]',
    },
    {
      id: '2',
      date: '2026年6月22日 17:07',
      description: '测试',
      hexagramName: '水天需',
      statusBadge: { label: '极佳态势', tone: 'emerald' },
      relationshipLabel: '用生体 — 外部赋能 / 供能通畅 (Yong Generates Ti)',
      isActive: true,
      isLive: false,
    },
    {
      id: '3',
      date: '2026年6月18日 18:32',
      description: '测试',
      hexagramName: '乾为天',
      statusBadge: { label: '积极顺遂', tone: 'cyan' },
      relationshipLabel: '体用比和 — 平衡共生 / 双向赋能 (Equal Cohesion)',
      isActive: false,
      isLive: false,
    },
  ],
};
