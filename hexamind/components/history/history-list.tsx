import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View as RNView } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import type { HistoryListData, HistoryRecordData, StatusBadgeData } from '@/components/history/types';

const statusBadgeStyles: Record<
  StatusBadgeData['tone'],
  { bg: string; text: string; border: string }
> = {
  emerald: {
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  cyan: {
    bg: 'bg-cyan-950/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
  amber: {
    bg: 'bg-amber-950/30',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  slate: {
    bg: 'bg-slate-950/30',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  },
};

function LivePingDot() {
  return (
    <RNView className="absolute right-4 top-4 h-2 w-2">
      <RNView className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
      <RNView className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
    </RNView>
  );
}

function StatusBadge({ data }: { data: StatusBadgeData }) {
  const s = statusBadgeStyles[data.tone];
  return (
    <View className={`rounded-sm border px-1.5 py-0.5 ${s.bg} ${s.border}`}>
      <Text size={12} className={`font-bold uppercase tracking-wider ${s.text}`}>
        {data.label}
      </Text>
    </View>
  );
}

function HistoryRecordCard({ data }: { data: HistoryRecordData }) {
  const baseCard = data.isActive
    ? 'border-[#06b6d4] bg-[#161f32]'
    : 'border-neutral-850 bg-[#0d1322]';
  const hoverEffect = data.isActive ? '' : 'hover:bg-[#161f32] hover:border-[#06b6d4]';
  const shadowClass = data.isActive
    ? 'shadow-[0_0_15px_rgba(6,182,212,0.15)]'
    : '';

  return (
    <Pressable className={`group relative min-h-[145px] cursor-pointer flex-col justify-between overflow-hidden rounded-sm border p-4 text-left transition-all ${baseCard} ${hoverEffect} ${shadowClass}`}>
      {/* Delete button */}
      <View className="absolute right-3 top-3 z-10 rounded p-1 opacity-0 transition-all group-hover:opacity-100">
        <Feather name="trash-2" size={14} color="#737373" />
      </View>

      {/* Live ping */}
      {data.isLive && <LivePingDot />}

      {/* Top section */}
      <View className="bg-transparent">
        {/* Date / periodic label */}
        <View className="mb-2 flex-row items-center gap-1.5">
          <Feather name="calendar" size={12} color="rgba(6,182,212,0.7)" />
          {data.isPeriodicBriefing && data.periodicLabel ? (
            <Text size={16} className="font-bold tracking-wider text-[#06b6d4]">
              {data.periodicLabel}
            </Text>
          ) : (
            <Text size={16} className="text-neutral-500">
              {data.date}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text
          size={12}
          numberOfLines={2}
          className="mb-3.5 pr-4 font-sans font-normal leading-relaxed text-neutral-300"
        >
          {data.description}
        </Text>
      </View>

      {/* Bottom section */}
      <View className="flex-col gap-1.5 border-t border-neutral-850 pt-2.5 bg-transparent">
        <View className="flex-row items-center justify-between bg-transparent">
          <Text size={12} className="font-bold font-sans text-neutral-100">
            {data.hexagramName}
          </Text>
          <StatusBadge data={data.statusBadge} />
        </View>

        <Text size={12} className="font-semibold font-mono leading-relaxed text-cyan-400/90 opacity-85">
          {data.relationshipLabel}
        </Text>

        {/* Hover reveal action */}
        <View className="mt-1 max-h-0 justify-center overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-12 group-hover:opacity-100">
          <Text size={12} className="flex-row items-center gap-1 font-extrabold uppercase tracking-wider text-cyan-400">
            ⚡ [ 追踪事态 / Resume Consultation ]
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HistoryList({ data }: { data: HistoryListData }) {
  const [search, setSearch] = useState('');

  return (
    <View className="flex min-h-0 flex-1 flex-col bg-transparent p-4">
      {/* Search bar */}
      <View className="relative mb-4 shrink-0 bg-transparent">
        <RNView className="absolute left-3 top-4 z-10">
          <Feather name="search" size={16} color="#737373" />
        </RNView>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={data.searchPlaceholder}
          placeholderTextColor="#525252"
          className="w-full rounded-sm border border-neutral-800 bg-black/40 py-2 pl-9 pr-4 text-lg font-sans text-neutral-100 transition-colors"
        />
      </View>

      {/* Records list */}
      <ScrollView
        className="min-h-0 flex-1"
        contentContainerClassName="gap-3"
        showsVerticalScrollIndicator={true}
      >
        {data.records.map((record) => (
          <HistoryRecordCard key={record.id} data={record} />
        ))}
      </ScrollView>
    </View>
  );
}
