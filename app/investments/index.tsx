
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAppState } from '../../state/AppState';
import { colors, commonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

export default function InvestmentPlansScreen() {
  const { plans } = useAppState();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.title}>Investment Plans</Text>
      </View>

      {plans.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={commonStyles.card}
          onPress={() => router.push(`/investments/${p.id}`)}
          activeOpacity={0.9}
        >
          <Text style={styles.planName}>{p.name}</Text>
          <Text style={styles.planText}>Min: ${p.minAmount.toLocaleString()} | Max: ${p.maxAmount.toLocaleString()}</Text>
          <Text style={styles.planText}>ROI: {(p.roi * 100).toFixed(1)}% | Compounding: {p.compoundingRate}x</Text>
          <Text style={styles.planText}>Duration: {p.durationDays} days</Text>
        </TouchableOpacity>
      ))}

      <View style={commonStyles.card}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          Choose a plan, invest within limits, and your funds remain locked for the duration. Returns are calculated
          using the plan&apos;s ROI and compounding rate.
        </Text>
        <TouchableOpacity onPress={() => router.push('/calculator')} activeOpacity={0.8} style={styles.calcBtn}>
          <Icon name="calculator" size={18} />
          <Text style={styles.calcText}>Try Investment Calculator</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  backBtn: {
    backgroundColor: '#24314a',
    padding: 8,
    borderRadius: 10,
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 20 },
  planName: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  planText: { color: colors.text, opacity: 0.9, marginBottom: 4 },
  infoTitle: { color: colors.text, fontWeight: '700', marginBottom: 6 },
  infoText: { color: colors.text, opacity: 0.9 },
  calcBtn: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#2c3d61',
    padding: 10,
    borderRadius: 10,
  },
  calcText: { color: '#fff', fontWeight: '600' },
});
