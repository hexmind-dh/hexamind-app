import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { DetailSectionHeader } from '@/components/detail/detail-section-header';
import { HexagramCard } from '@/components/detail/hexagram-card';
import type { ModuleOneData } from '@/components/detail/types';

const toneClassMap = {
  orange: 'text-orange-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
} as const;

export function ModuleOnePanel({ data }: { data: ModuleOneData }) {
  return (
    <View className="gap-4 bg-transparent px-4">
      <DetailSectionHeader icon="activity" iconColor="#ff2056" title={data.title} subtitle={data.subtitle} />

      <View className="flex-row gap-3 rounded-sm border border-white/5 bg-black/45 p-3">
        {data.sources.map((source) => (
          <View key={source.label} className="flex-1 gap-1 bg-transparent">
            <Text size={10} className="uppercase font-normal text-white/40 opacity-75">
              {source.label}
            </Text>
            <Text size={10} className={`font-bold ${toneClassMap[source.tone]}`}>
              {source.value}
            </Text>
          </View>
        ))}
      </View>

      <View className="gap-5 bg-transparent">
        {data.cards.map((card) => (
          <HexagramCard key={card.label} {...card} />
        ))}
      </View>
    </View>
  );
}
