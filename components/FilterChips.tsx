
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';

interface ChipOption {
  key: string;
  label: string;
}
interface Props {
  label: string;
  options: ChipOption[];
  value: string;
  onChange: (val: string) => void;
}

export default function FilterChips({ label, options, value, onChange }: Props) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((o) => (
          <TouchableOpacity
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.chip, value === o.key && styles.chipActive]}
            activeOpacity={0.85}
          >
            <Text style={styles.chipText}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, marginBottom: 6, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2d3a57',
    backgroundColor: '#162133',
  },
  chipActive: { backgroundColor: '#2753d9' },
  chipText: { color: '#fff', fontWeight: '600' },
});
