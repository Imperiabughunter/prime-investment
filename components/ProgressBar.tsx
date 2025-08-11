
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors } from '../styles/commonStyles';

interface Props {
  progress: number; // 0..1
}

export default function ProgressBar({ progress }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress || 0));
    Animated.timing(anim, {
      toValue: clamped,
      duration: 600,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.bar, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    backgroundColor: '#142033',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: '#1e8e3e',
  },
});
