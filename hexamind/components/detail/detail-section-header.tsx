import Feather from '@expo/vector-icons/Feather';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';

type DetailSectionHeaderProps = {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
};

export function DetailSectionHeader({ icon, iconColor, title, subtitle }: DetailSectionHeaderProps) {
  return (
    <View className="flex-row items-start gap-2 bg-transparent pb-2">
      <Feather name={icon} size={14} color={iconColor} />
      <View className="flex-1 gap-1 bg-transparent">
        <Text className="font-bold uppercase tracking-wider text-white">
          {title}
        </Text>
        <Text size={12} className="text-white/40">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
