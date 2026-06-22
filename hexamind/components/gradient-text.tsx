import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';

const GRADIENT_COLORS = ['#ef4444', '#f97316', '#22d3ee', '#9333ea'] as const;

type GradientTextProps = {
  size?: number;
  title?: string;
};

export function GradientText({ size = 16, title = '' }: GradientTextProps) {
  if (!title) {
    return null;
  }

  const textStyle = [styles.text, { fontSize: size }];

  return (
    <View style={styles.wrap}>
      <MaskedView maskElement={<Text className='text-white' style={textStyle}>{title}</Text>}>
        <LinearGradient colors={[...GRADIENT_COLORS]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
          <Text style={[...textStyle, { opacity: 0 }]}>{title}</Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});
