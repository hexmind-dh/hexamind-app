import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { ModuleOnePanel } from '@/components/detail/module-one-panel';
import { ModuleTwoPanel } from '@/components/detail/module-two-panel';
import { ModuleThreePanel } from '@/components/detail/module-three-panel';
import { ModuleFourPanel } from '@/components/detail/module-four-panel';
import type { DetailScreenData } from '@/components/detail/types';

export function DetailScreenContent({ data }: { data: DetailScreenData }) {
  return (
    <>
      <View className="relative w-full gap-6 py-4">
        <ModuleOnePanel data={data.moduleOne} />
        <ModuleTwoPanel data={data.moduleTwo} />
        <ModuleThreePanel data={data.moduleThree} />
        <View className="h-[420] overflow-hidden rounded-sm">
          <ModuleFourPanel data={data.moduleFour} />
        </View>
      </View>

      {/* Footer */}
      <View className="border-t border-white/5 bg-neutral-950 px-4 py-4">
        <View className="w-full flex-col items-center justify-between gap-4 md:flex-row">
          <View className="flex-row items-center gap-1.5 whitespace-nowrap">
            <Text size={9} className="font-normal text-neutral-500">
              系统脉搏: 完全同步
            </Text>
            <Text size={9} className="text-neutral-500/30">
              •
            </Text>
            <Text size={9} className="font-normal text-neutral-500">
              模型要素对冲置信度:{' '}
              <Text size={9} className="font-bold text-neutral-500">
                80.11%
              </Text>
            </Text>
          </View>

          <View className="flex flex-col items-center gap-1.5 sm:gap-3">
            <Text size={9} className="font-normal text-neutral-500">
              数智决策逻辑演绎系统 • 商业风险量化分析终端
            </Text>
            <Text size={9} className="hidden text-neutral-500/30 sm:inline">
              |
            </Text>
            <Text
              size={8.5}
              selectable
              className="font-mono tracking-widest text-neutral-500"
            >
              Version 2.5.29 (Iter-Build: 2026.06.22)
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
