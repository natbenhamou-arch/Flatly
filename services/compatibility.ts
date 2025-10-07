import { User, Lifestyle, Housing, Preferences, CompatibilityResult } from '@/types';

// Compatibility scoring weights (total = 100)
const WEIGHTS = {
  UNIVERSITY: 30,
  SAME_CITY: 20,
  BUDGET_FIT: 15,
  LIFESTYLE: 15,
  HOBBIES: 8,
  VIBE_QUIZ: 7,
  MOVE_IN: 3,
  ROOM_FIT: 2,
  RELIGION: 5, // max if opted in
  GENDER: 5,   // max if opted in
  BLOCKED_PENALTY: -10,
  DUPLICATE_PASS_PENALTY: -10
} as const;

interface CompatibilityInput {
  currentUser: User;
  targetUser: User;
  currentLifestyle?: Lifestyle;
  targetLifestyle?: Lifestyle;
  currentHousing?: Housing;
  targetHousing?: Housing;
  currentPreferences?: Preferences;
  targetPreferences?: Preferences;
  hasBeenBlocked?: boolean;
  hasBeenPassed?: boolean;
}

export function computeCompatibility(input: CompatibilityInput): CompatibilityResult {
  const {
    currentUser,
    targetUser,
    currentLifestyle,
    targetLifestyle,
    currentHousing,
    targetHousing,
    currentPreferences,
    targetPreferences,
    hasBeenBlocked = false,
    hasBeenPassed = false
  } = input;

  let score = 0;
  const reasons: string[] = [];

  // University Match (+30 for exact, +20 for same city group)
  if (currentUser.university === targetUser.university) {
    score += WEIGHTS.UNIVERSITY;
    reasons.push('Same university');
  } else if (currentUser.city === targetUser.city) {
    score += 20; // Same city university group
    reasons.push('Same city universities');
  }

  // Same City (+20)
  if (currentUser.city === targetUser.city) {
    score += WEIGHTS.SAME_CITY;
    reasons.push('Same city');
  }

  // Budget Fit (+15)
  const budgetScore = calculateBudgetFit(currentHousing, targetHousing);
  if (budgetScore > 0) {
    score += budgetScore;
    if (budgetScore >= 12) {
      reasons.push('Perfect budget match');
    } else if (budgetScore >= 8) {
      reasons.push('Good budget fit');
    } else {
      reasons.push('Budget compatible');
    }
  }

  // Lifestyle Similarity (+15 total, +3 each match)
  const lifestyleScore = calculateLifestyleCompatibility(currentLifestyle, targetLifestyle);
  if (lifestyleScore.score > 0) {
    score += lifestyleScore.score;
    reasons.push(...lifestyleScore.reasons);
  }

  // Hobbies Overlap (+8)
  const hobbiesScore = calculateHobbiesOverlap(currentLifestyle, targetLifestyle);
  if (hobbiesScore.score > 0) {
    score += hobbiesScore.score;
    reasons.push(hobbiesScore.reason);
  }

  // Vibe Quiz Alignment (+7)
  const vibeScore = calculateVibeQuizAlignment(currentPreferences, targetPreferences);
  if (vibeScore > 0) {
    score += vibeScore;
    reasons.push('Similar lifestyle preferences');
  }

  // Move-in Date Alignment (+3)
  const moveInScore = calculateMoveInAlignment(currentHousing, targetHousing);
  if (moveInScore > 0) {
    score += moveInScore;
    reasons.push('Similar move-in timing');
  }

  // Room Fit (+2)
  const roomFitScore = calculateRoomFit(currentUser, targetUser);
  if (roomFitScore > 0) {
    score += roomFitScore;
    reasons.push('Perfect housing match');
  }

  // Optional Religion Match (up to +5)
  const religionScore = calculateReligionMatch(currentLifestyle, targetLifestyle);
  if (religionScore > 0) {
    score += religionScore;
    reasons.push('Shared values');
  }

  // Optional Gender Preference (up to +5)
  const genderScore = calculateGenderPreference(currentLifestyle, targetLifestyle);
  if (genderScore > 0) {
    score += genderScore;
    reasons.push('Preferred demographics');
  }

  // Penalties
  if (hasBeenBlocked) {
    score += WEIGHTS.BLOCKED_PENALTY;
  }
  
  if (hasBeenPassed) {
    score += WEIGHTS.DUPLICATE_PASS_PENALTY;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, reasons };
}

function calculateBudgetFit(currentHousing?: Housing, targetHousing?: Housing): number {
  if (!currentHousing || !targetHousing) return 0;

  // Case 1: One has room, other needs room
  if (currentHousing.hasRoom && !targetHousing.hasRoom) {
    const rent = currentHousing.rent || 0;
    const minBudget = targetHousing.budgetMin || 0;
    const maxBudget = targetHousing.budgetMax || Infinity;
    
    if (rent >= minBudget && rent <= maxBudget) {
      const budgetRange = maxBudget - minBudget;
      const position = (rent - minBudget) / budgetRange;
      // Best fit is in the middle of their range
      return WEIGHTS.BUDGET_FIT * (1 - Math.abs(position - 0.5) * 2);
    }
  }

  // Case 2: Both need rooms - budget overlap
  if (!currentHousing.hasRoom && !targetHousing.hasRoom) {
    const currentMin = currentHousing.budgetMin || 0;
    const currentMax = currentHousing.budgetMax || Infinity;
    const targetMin = targetHousing.budgetMin || 0;
    const targetMax = targetHousing.budgetMax || Infinity;

    const overlapMin = Math.max(currentMin, targetMin);
    const overlapMax = Math.min(currentMax, targetMax);

    if (overlapMax > overlapMin) {
      const overlapSize = overlapMax - overlapMin;
      const totalRange = Math.max(currentMax - currentMin, targetMax - targetMin);
      return WEIGHTS.BUDGET_FIT * (overlapSize / totalRange);
    }
  }

  return 0;
}

function calculateLifestyleCompatibility(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reasons: string[] } {
  if (!currentLifestyle || !targetLifestyle) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];

  // Cleanliness match (+3)
  if (currentLifestyle.cleanliness === targetLifestyle.cleanliness) {
    score += 3;
    reasons.push(`Both ${currentLifestyle.cleanliness} about cleanliness`);
  }

  // Sleep schedule match (+3)
  if (currentLifestyle.sleep === targetLifestyle.sleep) {
    score += 3;
    reasons.push(`Both ${currentLifestyle.sleep} sleepers`);
  }

  // Guest frequency match (+3)
  if (currentLifestyle.guests === targetLifestyle.guests) {
    score += 3;
    reasons.push('Similar social preferences');
  }

  // Smoking compatibility (+3)
  if (currentLifestyle.smoker === targetLifestyle.smoker) {
    score += 3;
    reasons.push(currentLifestyle.smoker ? 'Both smoke' : 'Both non-smokers');
  }

  // Pet compatibility (+3)
  if (currentLifestyle.petsOk === targetLifestyle.petsOk) {
    score += 3;
    reasons.push(currentLifestyle.petsOk ? 'Both pet-friendly' : 'Both prefer no pets');
  }

  return { score, reasons };
}

function calculateHobbiesOverlap(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reason: string } {
  if (!currentLifestyle || !targetLifestyle) {
    return { score: 0, reason: '' };
  }

  const currentHobbies = new Set(currentLifestyle.hobbies);
  const targetHobbies = new Set(targetLifestyle.hobbies);
  
  const intersection = new Set([...currentHobbies].filter(h => targetHobbies.has(h)));
  const union = new Set([...currentHobbies, ...targetHobbies]);

  if (union.size === 0) return { score: 0, reason: '' };

  const jaccardSimilarity = intersection.size / union.size;
  const score = WEIGHTS.HOBBIES * jaccardSimilarity;

  let reason = '';
  if (intersection.size >= 3) {
    reason = `${intersection.size} shared interests`;
  } else if (intersection.size >= 1) {
    const sharedHobbies = Array.from(intersection).slice(0, 2).join(', ');
    reason = `Both enjoy ${sharedHobbies}`;
  }

  return { score, reason };
}

function calculateVibeQuizAlignment(
  currentPreferences?: Preferences,
  targetPreferences?: Preferences
): number {
  if (!currentPreferences || !targetPreferences) return 0;

  const currentAnswers = currentPreferences.quizAnswers || {};
  const targetAnswers = targetPreferences.quizAnswers || {};

  let matches = 0;
  let total = 0;

  // Compare common quiz answers
  const commonKeys = Object.keys(currentAnswers).filter(key => 
    key in targetAnswers
  );

  for (const key of commonKeys) {
    total++;
    if (currentAnswers[key] === targetAnswers[key]) {
      matches++;
    }
  }

  if (total === 0) return 0;

  return WEIGHTS.VIBE_QUIZ * (matches / total);
}

function calculateMoveInAlignment(
  currentHousing?: Housing,
  targetHousing?: Housing
): number {
  if (!currentHousing?.availableFrom || !targetHousing?.availableFrom) return 0;

  const currentDate = new Date(currentHousing.availableFrom);
  const targetDate = new Date(targetHousing.availableFrom);
  const diffDays = Math.abs(currentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 30) {
    return WEIGHTS.MOVE_IN * (1 - diffDays / 30);
  }

  return 0;
}

function calculateRoomFit(currentUser: User, targetUser: User): number {
  // Perfect fit: one has room, other needs room
  if (currentUser.hasRoom && !targetUser.hasRoom) {
    return WEIGHTS.ROOM_FIT;
  }
  if (!currentUser.hasRoom && targetUser.hasRoom) {
    return WEIGHTS.ROOM_FIT;
  }
  return 0;
}

function calculateReligionMatch(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): number {
  if (!currentLifestyle || !targetLifestyle) return 0;

  // Only apply if both users opted to show religion
  if (!currentLifestyle.showReligion || !targetLifestyle.showReligion) return 0;

  // Only apply if both have religion specified
  if (!currentLifestyle.religion || !targetLifestyle.religion) return 0;

  if (currentLifestyle.religion === targetLifestyle.religion) {
    return WEIGHTS.RELIGION;
  }

  return 0;
}

function calculateGenderPreference(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): number {
  if (!currentLifestyle || !targetLifestyle) return 0;

  // Only apply if both users opted to show gender
  if (!currentLifestyle.showGender || !targetLifestyle.showGender) return 0;

  // This is a simplified implementation
  // In a real app, you'd have more complex gender preference logic
  return WEIGHTS.GENDER * 0.5; // Partial score for showing gender preference
}

// Utility function to get compatibility explanation
export function getCompatibilityExplanation(score: number): string {
  if (score >= 85) return 'Excellent match! You have a lot in common.';
  if (score >= 70) return 'Great compatibility with shared interests.';
  if (score >= 55) return 'Good potential match worth exploring.';
  if (score >= 40) return 'Some compatibility, could work out.';
  return 'Limited compatibility, but you never know!';
}

// Utility function to determine if users should be shown to each other
export function shouldShowMatch(score: number, featureFlags?: { demoMode?: boolean }): boolean {
  // In demo mode, show more matches
  if (featureFlags?.demoMode) {
    return score >= 25;
  }
  
  // In production, be more selective
  return score >= 40;
}