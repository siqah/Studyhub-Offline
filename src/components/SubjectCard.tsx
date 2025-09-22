import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  name: string;
  description: string;
  icon?: string;
  color?: string; 
  onPress?: () => void;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
};

const SubjectCard = ({ name, description, icon = '📚', color = '#3B82F6', onPress, rightSlot, style }: Props) => {
  return (
    <TouchableOpacity style={[styles.wrapper, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.title}>{name}</Text>
            </View>
            <Text style={styles.desc}>{description}</Text>
          </View>
          {rightSlot ?? (
            <View style={styles.chev}>
              <Text style={styles.chevText}>→</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default SubjectCard;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 24, marginRight: 12 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  desc: { color: 'rgba(255,255,255,0.9)', fontSize: 16 },
  chev: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 12 },
  chevText: { color: 'white', fontSize: 18 },
});
