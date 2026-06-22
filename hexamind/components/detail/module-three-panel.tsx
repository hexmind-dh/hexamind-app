import Feather from '@expo/vector-icons/Feather';
import { Pressable } from 'react-native';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { DetailSectionHeader } from '@/components/detail/detail-section-header';
import type {
  ModuleThreeData,
  ModuleThreeVerdictTone,
  TacticStepData,
  InfoCardData,
} from '@/components/detail/types';

const verdictStyles: Record<
  ModuleThreeVerdictTone,
  { bg: string; text: string }
> = {
  rose: { bg: 'bg-rose-500', text: 'text-white' },
  amber: { bg: 'bg-amber-500', text: 'text-white' },
  emerald: { bg: 'bg-emerald-500', text: 'text-white' },
  slate: { bg: 'bg-slate-500', text: 'text-white' },
};

function VerdictBadge({
  label,
  tone,
}: {
  label: string;
  tone: ModuleThreeVerdictTone;
}) {
  const s = verdictStyles[tone];
  return (
    <View className={`rounded-sm flex-row items-center gap-1.5 px-3 py-1.5 ${s.bg}`}>
      <Feather name="award" size={14} color="#fff" />
      <Text
        size={12}
        className={`font-bold font-mono uppercase tracking-wider ${s.text}`}
      >
        {label}
      </Text>
    </View>
  );
}

function TacticStep({
  data,
}: {
  data: TacticStepData;
}) {
  return (
    <View className="flex-row items-start justify-between gap-4 rounded-sm border border-white/5 bg-black/25 p-3">
      <View className="flex-1 flex-row items-start gap-3">
        <View className="h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/5">
          <Text size={12} className="font-bold font-mono text-rose-500">
            {data.index}
          </Text>
        </View>
        <Text size={12} className="flex-1 leading-relaxed text-slate-300">
          {data.text}
        </Text>
      </View>

      <Pressable className="mt-0.5 shrink-0 flex-row items-center gap-1 whitespace-nowrap rounded-sm border border-rose-500/20 bg-rose-950/25 px-2 py-0.5">
        <Feather name="zap" size={12} color="#f43f5e" />
        <Text size={12} className="font-bold uppercase tracking-wider text-rose-400">
          {data.actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function InfoCard({ data }: { data: InfoCardData }) {
  return (
    <View className="flex-col justify-between rounded-sm border border-white/5 bg-black/30 p-4">
      <Text
        size={12}
        className="mb-2.5 block font-bold uppercase tracking-wider text-white/45"
      >
        {data.title}
      </Text>

      <View className="mt-1">
        {data.badge ? (
          <View className="w-full flex-row items-center justify-between gap-3">
            <Text size={12} className="flex-1 leading-relaxed text-slate-300">
              {data.body}
            </Text>
            <View className="shrink-0 items-center justify-center rounded-sm border border-rose-500/30 bg-rose-950/30 px-2.5 py-1">
              <Text size={12} className="font-semibold text-rose-400">
                {data.badge}
              </Text>
            </View>
          </View>
        ) : (
          <Text size={12} className="leading-relaxed text-slate-300">
            {data.body}
          </Text>
        )}
      </View>
    </View>
  );
}

export function ModuleThreePanel({ data }: { data: ModuleThreeData }) {
  return (
    <View className="rounded-sm bg-[#0b0c10]/30 p-4">
      <View className="mb-4 flex-row items-start justify-between gap-3 pb-3">
        <View className="flex-1">
          <DetailSectionHeader
            icon="zap"
            iconColor="#f43f5e"
            title={data.title}
            subtitle={data.subtitle}
          />
        </View>
        <VerdictBadge label={data.verdictLabel} tone={data.verdictTone} />
      </View>

      <View className="gap-6 bg-transparent">
        {/* Summary quote */}
        <Text size={12} className="border-b border-white/5 pb-3 italic leading-5 text-white/60">
          {data.summaryQuote}
        </Text>

        {/* Macro analysis */}
        <View className="bg-transparent">
          <Text size={12} className="mb-2.5 font-bold uppercase tracking-widest text-white/40">
            {data.macroAnalysis.heading}
          </Text>
          <View className="rounded-sm border border-white/5 bg-black/40 p-4">
            <Text size={12} className="leading-relaxed text-slate-300">
              {data.macroAnalysis.content}
            </Text>
          </View>
        </View>

        {/* Tactics */}
        <View className="bg-transparent">
          <Text size={12} className="mb-3 font-bold uppercase tracking-widest text-white/40">
            {data.tacticsHeading}
          </Text>
          <View className="gap-2.5 bg-transparent">
            {data.tactics.map((step) => (
              <TacticStep key={step.index} data={step} />
            ))}
          </View>
        </View>

        {/* Info cards */}
        <View className="gap-4 bg-transparent pt-2">
          {data.infoCards.map((card) => (
            <InfoCard key={card.title} data={card} />
          ))}
        </View>
      </View>
    </View>
  );
}
