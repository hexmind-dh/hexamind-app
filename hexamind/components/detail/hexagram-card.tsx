import { StyleSheet } from 'react-native';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import type { HexagramCardData, HexagramLineData } from '@/components/detail/types';

function HexagramLine({ solid, active }: HexagramLineData) {
  const segmentClassName = active ? 'bg-[#f43f5e]' : 'bg-white/20';

  return (
    <View className={`rounded-sm border px-1 py-0.5 ${active ? 'border-[#f43f5e]/20 bg-[#f43f5e]/10' : 'border-transparent'}`}>
      <View className="h-5 items-center justify-center bg-transparent">
        {solid ? (
          <View className={`h-3.5 w-full ${segmentClassName}`} style={active ? styles.activeGlow : undefined} />
        ) : (
          <View className="h-3.5 w-full flex-row justify-between bg-transparent">
            <View className={`h-full w-[47%] ${segmentClassName}`} style={active ? styles.activeGlow : undefined} />
            <View className={`h-full w-[47%] ${segmentClassName}`} style={active ? styles.activeGlow : undefined} />
          </View>
        )}
      </View>
    </View>
  );
}

function TrigramMeta({ label, name, element }: { label: string; name: string; element: string }) {
  return (
    <View className="flex-1 rounded-sm border border-white/5 bg-white/5 p-1.5">
      <Text size={12} className="mb-0.5 font-semibold tracking-wider text-white/40">
        {label}
      </Text>
      <View className="flex-row items-center justify-between bg-transparent">
        <Text size={12} className="font-bold text-white/80">
          {name}
        </Text>
        <Text size={12} className="font-normal text-white/60">
          {element}
        </Text>
      </View>
    </View>
  );
}

export function HexagramCard({ label, name, symbol, top, bottom, lines }: HexagramCardData) {
  return (
    <View className="overflow-hidden rounded-sm border border-white/10 bg-white/5 p-4" style={styles.cardShadow}>
      <View className="bg-transparent">
        <View className="mb-3.5 border-b border-white/10 bg-transparent pb-2.5">
          <Text size={14} className="font-extrabold uppercase tracking-[2px] text-rose-500">
            {label}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5 bg-transparent">
            <Text size={17} className="font-bold tracking-wide text-white">
              {name}
            </Text>
            <Text size={12} className="font-medium text-white/40">
              {symbol}
            </Text>
          </View>
        </View>

        <View className="mb-4 w-full max-w-[280] self-center gap-1 bg-transparent">
          {lines.map((line, index) => (
            <HexagramLine key={`${label}-${index}`} {...line} />
          ))}
        </View>
      </View>

      <View className="mt-auto border-t border-white/10 bg-transparent pt-3.5">
        <View className="flex-row gap-1.5 bg-transparent">
          <TrigramMeta label="上卦" name={top.name} element={top.element} />
          <TrigramMeta label="下卦" name={bottom.name} element={bottom.element} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeGlow: {
    shadowColor: '#f43f5e',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
});
