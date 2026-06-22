import Feather from '@expo/vector-icons/Feather';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { DetailSectionHeader } from '@/components/detail/detail-section-header';
import type { ModuleTwoData, RoleFactorCardData } from '@/components/detail/types';

function RoleFactorCard({ data }: { data: RoleFactorCardData }) {
  return (
    <View className="relative flex-1 overflow-hidden rounded-sm border border-white/10 bg-black/30 p-4">
      <View className="absolute left-2 top-2 rounded-sm bg-white/10 px-1.5 py-0.5">
        <Text size={14} className="font-extrabold text-white">
          {data.role}
        </Text>
      </View>

      <Text size={12} className="mt-3 text-center font-normal uppercase text-white/40">
        {data.roleDescription}
      </Text>
      <Text size={32} className="my-2 text-center font-extrabold text-white">
        {data.symbol}
      </Text>

      <View className="self-center rounded-sm border border-white/10 bg-white/5 px-2 py-0.5">
        <Text size={12} className="font-bold uppercase text-white/90">
          {data.element}
        </Text>
      </View>

      <Text size={12} className="mt-2.5 text-center font-normal text-white/30">
        {data.factorLabel}
      </Text>
    </View>
  );
}

export function ModuleTwoPanel({ data }: { data: ModuleTwoData }) {
  return (
    <View className="rounded-sm bg-[#0b0c10]/30 p-4">
      <DetailSectionHeader icon="compass" iconColor="#f43f5e" title={data.title} subtitle={data.subtitle} />

      <View className="mt-4 gap-4 bg-transparent">
        <View className="flex-row gap-3 bg-transparent">
          <RoleFactorCard data={data.body} />
          <RoleFactorCard data={data.application} />
        </View>

        <View className="rounded-sm border border-white/10 bg-black/45 p-4">
          <View className="gap-1 bg-transparent">
            <Text size={12} className="font-bold uppercase tracking-wider text-white/40">
              {data.formulaEyebrow}
            </Text>
            <View className="flex-row items-center gap-2 bg-transparent">
              <Feather name="arrow-right-circle" size={16} color="#f43f5e" />
              <Text size={16} className="font-semibold text-rose-500">
                {data.formulaTitle}
              </Text>
            </View>
          </View>

          <View className="mt-4 rounded-sm border border-white/5 bg-white/5 p-3">
            <Text size={12} className="leading-5 text-white/90">
              {data.formulaQuote}
            </Text>
          </View>

          <View className="mt-4 border-t border-white/5 pt-3">
            <View className="flex-row flex-wrap items-center gap-2 bg-transparent">
              <Text size={12} className="font-bold uppercase text-white/40">
                {data.catalyst.label}
              </Text>
              <View className="rounded-sm border border-rose-500/20 bg-rose-500/10 px-2 py-0.5">
                <Text size={12} className="font-bold text-rose-500">
                  {data.catalyst.value}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 gap-3 border-t border-white/5 pt-4 bg-transparent">
            {data.interpretation.map((item) => (
              <View key={item.title} className="gap-1 bg-transparent">
                <Text size={16} className="font-bold text-slate-200">
                  {item.title}
                </Text>
                <Text size={14} className="leading-5 text-slate-400">
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
