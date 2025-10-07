import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompatibilityResult } from '@/types';
import { ClayCard } from './ClayCard';
import { colors, spacing } from '@/constants/theme';
import { X, CheckCircle, Star } from 'lucide-react-native';

interface CompatibilityModalProps {
  visible: boolean;
  onClose: () => void;
  compatibility: CompatibilityResult | null;
  userName?: string;
}

export function CompatibilityModal({
  visible,
  onClose,
  compatibility,
  userName = 'this person',
}: CompatibilityModalProps) {
  if (!compatibility) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.mint;
    if (score >= 55) return colors.peach;
    return colors.textSecondary;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 85) return 'Excellent match! You have a lot in common.';
    if (score >= 70) return 'Great compatibility with shared interests.';
    if (score >= 55) return 'Good potential match worth exploring.';
    if (score >= 40) return 'Some compatibility, could work out.';
    return 'Limited compatibility, but you never know!';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Why You Match</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ClayCard style={styles.scoreCard}>
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreCircle, { borderColor: getScoreColor(compatibility.score) }]}>
                <Text style={[styles.scoreText, { color: getScoreColor(compatibility.score) }]}>
                  {compatibility.score}%
                </Text>
              </View>
              <Text style={styles.scoreTitle}>Compatibility Score</Text>
              <Text style={styles.scoreDescription}>
                {getScoreDescription(compatibility.score)}
              </Text>
            </View>
          </ClayCard>

          <ClayCard style={styles.reasonsCard}>
            <View style={styles.reasonsHeader}>
              <Star size={20} color={colors.textPrimary} />
              <Text style={styles.reasonsTitle}>What you have in common</Text>
            </View>
            
            {compatibility.reasons.length > 0 ? (
              <View style={styles.reasonsList}>
                {compatibility.reasons.map((reason, index) => (
                  <View key={`${reason}-${index}`} style={styles.reasonItem}>
                    <CheckCircle size={16} color={colors.success} />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noReasonsText}>
                No specific compatibility factors found, but that doesn&apos;t mean you won&apos;t get along!
              </Text>
            )}
          </ClayCard>

          <ClayCard style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Pro Tip</Text>
            <Text style={styles.tipText}>
              Compatibility scores are just a starting point. The best roommate relationships 
              often come from great communication and mutual respect, regardless of the score!
            </Text>
          </ClayCard>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.softLilac,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  scoreCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  scoreDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reasonsCard: {
    marginBottom: spacing.md,
  },
  reasonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  reasonsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reasonsList: {
    gap: spacing.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  reasonText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  noReasonsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tipCard: {
    backgroundColor: colors.softLilac,
    marginBottom: spacing.xl,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});