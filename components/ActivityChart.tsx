
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useMemo } from 'react';
import { useAppState } from '../state/AppState';
import { colors } from '../styles/commonStyles';

export default function ActivityChart() {
  const { transactions } = useAppState();

  const bars = useMemo(() => {
    const now = new Date();
    const data: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const total = transactions
        .filter((t) => new Date(t.date).getMonth() === m)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      data.push({ label: d.toLocaleString(undefined, { month: 'short' }), value: total });
    }
    return data;
  }, [transactions]);

  const max = Math.max(1, ...bars.map((b) => b.value));

  // Create a stable array of Animated.Values that matches the number of bars
  const anims = useMemo(() => bars.map(() => new Animated.Value(0)), [bars.length]);

  useEffect(() => {
    const animations = anims.map((a, i) =>
      Animated.timing(a, {
        toValue: bars[i]?.value / max,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      })
    );
    Animated.stagger(80, animations).start();
  }, [bars, max, anims]);

  return (
    <View style={styles.wrap}>
      {bars.map((b, i) => {
        const height = anims[i].interpolate({ inputRange: [0, 1], outputRange: [8, 120] });
        return (
          <View key={i} style={styles.item}>
            <Animated.View style={[styles.bar, { height }]} />
            <Text style={styles.label}>{b.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    height: 160,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '80%',
    backgroundColor: '#2753d9',
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  label: {
    color: colors.text,
    opacity: 0.9,
    marginTop: 6,
  },
});
