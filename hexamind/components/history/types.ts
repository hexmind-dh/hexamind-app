export type StatusBadgeData = {
  label: string;
  tone: 'emerald' | 'cyan' | 'amber' | 'slate';
};

export type HistoryRecordData = {
  id: string;
  date: string;
  description: string;
  hexagramName: string;
  statusBadge: StatusBadgeData;
  relationshipLabel: string;
  isActive?: boolean;
  isLive?: boolean;
  isPeriodicBriefing?: boolean;
  periodicLabel?: string;
};

export type HistoryListData = {
  searchPlaceholder: string;
  records: HistoryRecordData[];
};
