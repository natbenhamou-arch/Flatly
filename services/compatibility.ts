import { User, Lifestyle, Housing, Preferences, CompatibilityResult } from '@/types';

// Compatibility scoring weights (total = 100)
// Primary factors: City, University, Language (60 points)
// Secondary factors: Lifestyle (cleanliness, sleep, noise) (25 points)
// Tertiary factors: Hobbies, food, politics, religion (15 points)
const WEIGHTS = {
  SAME_CITY: 25,
  UNIVERSITY: 20,
  LANGUAGE: 15,
  CLEANLINESS: 8,
  SLEEP: 8,
  NOISE: 9,
  BUDGET_FIT: 8,
  HOBBIES: 5,
  FOOD: 3,
  POLITICS: 2,
  RELIGION: 3,
  SMOKING: 2,
  PETS: 2,
  GUESTS: 2,
  MOVE_IN: 2,
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
    hasBeenBlocked = false,
    hasBeenPassed = false
  } = input;

  let score = 0;
  const reasons: { text: string; weight: number }[] = [];

  // PRIMARY FACTORS (60 points total)
  
  // Same City (+25) - Most important
  if (currentUser.city === targetUser.city) {
    score += WEIGHTS.SAME_CITY;
    reasons.push({ text: `Both in ${currentUser.city}`, weight: WEIGHTS.SAME_CITY });
  }

  // University Match (+20)
  if (currentUser.university === targetUser.university) {
    score += WEIGHTS.UNIVERSITY;
    reasons.push({ text: `Both study at ${currentUser.university}`, weight: WEIGHTS.UNIVERSITY });
  }

  // Language Compatibility (+15)
  const languageScore = calculateLanguageCompatibility(currentLifestyle, targetLifestyle);
  if (languageScore.score > 0) {
    score += languageScore.score;
    reasons.push({ text: languageScore.reason, weight: languageScore.score });
  }

  // SECONDARY FACTORS (25 points total)
  
  // Cleanliness Match (+8)
  if (currentLifestyle?.cleanliness && targetLifestyle?.cleanliness) {
    if (currentLifestyle.cleanliness === targetLifestyle.cleanliness) {
      score += WEIGHTS.CLEANLINESS;
      const cleanLabel = currentLifestyle.cleanliness === 'meticulous' ? 'very clean' : 
                        currentLifestyle.cleanliness === 'avg' ? 'moderately clean' : 'relaxed about cleanliness';
      reasons.push({ text: `Both ${cleanLabel}`, weight: WEIGHTS.CLEANLINESS });
    }
  }

  // Sleep Schedule Match (+8)
  if (currentLifestyle?.sleep && targetLifestyle?.sleep) {
    if (currentLifestyle.sleep === targetLifestyle.sleep) {
      score += WEIGHTS.SLEEP;
      const sleepLabel = currentLifestyle.sleep === 'early' ? 'early birds' : 
                        currentLifestyle.sleep === 'night' ? 'night owls' : 'flexible sleepers';
      reasons.push({ text: `Both ${sleepLabel}`, weight: WEIGHTS.SLEEP });
    }
  }

  // Noise Tolerance Match (+9)
  if (currentLifestyle?.noise && targetLifestyle?.noise) {
    if (currentLifestyle.noise === targetLifestyle.noise) {
      score += WEIGHTS.NOISE;
      const noiseLabel = currentLifestyle.noise === 'low' ? 'prefer quiet' : 
                        currentLifestyle.noise === 'high' ? 'okay with noise' : 'moderate noise tolerance';
      reasons.push({ text: `Both ${noiseLabel}`, weight: WEIGHTS.NOISE });
    }
  }

  // Budget Fit (+8)
  const budgetScore = calculateBudgetFit(currentHousing, targetHousing);
  if (budgetScore.score > 0) {
    score += budgetScore.score;
    reasons.push({ text: budgetScore.reason, weight: budgetScore.score });
  }

  // TERTIARY FACTORS (15 points total)
  
  // Hobbies Overlap (+5)
  const hobbiesScore = calculateHobbiesOverlap(currentLifestyle, targetLifestyle);
  if (hobbiesScore.score > 0) {
    score += hobbiesScore.score;
    reasons.push({ text: hobbiesScore.reason, weight: hobbiesScore.score });
  }

  // Food Preference (+3)
  const foodScore = calculateFoodCompatibility(currentLifestyle, targetLifestyle);
  if (foodScore.score > 0) {
    score += foodScore.score;
    reasons.push({ text: foodScore.reason, weight: foodScore.score });
  }

  // Political Alignment (+2)
  const politicsScore = calculatePoliticsCompatibility(currentLifestyle, targetLifestyle);
  if (politicsScore.score > 0) {
    score += politicsScore.score;
    reasons.push({ text: politicsScore.reason, weight: politicsScore.score });
  }

  // Religion Match (+3)
  const religionScore = calculateReligionMatch(currentLifestyle, targetLifestyle);
  if (religionScore.score > 0) {
    score += religionScore.score;
    reasons.push({ text: religionScore.reason, weight: religionScore.score });
  }

  // Smoking Compatibility (+2)
  if (currentLifestyle?.smoker !== undefined && targetLifestyle?.smoker !== undefined) {
    if (currentLifestyle.smoker === targetLifestyle.smoker) {
      score += WEIGHTS.SMOKING;
      reasons.push({ text: currentLifestyle.smoker ? 'Both smoke' : 'Both non-smokers', weight: WEIGHTS.SMOKING });
    }
  }

  // Pet Compatibility (+2)
  if (currentLifestyle?.petsOk !== undefined && targetLifestyle?.petsOk !== undefined) {
    if (currentLifestyle.petsOk === targetLifestyle.petsOk) {
      score += WEIGHTS.PETS;
      reasons.push({ text: currentLifestyle.petsOk ? 'Both pet-friendly' : 'Both prefer no pets', weight: WEIGHTS.PETS });
    }
  }

  // Guest Frequency Match (+2)
  if (currentLifestyle?.guests && targetLifestyle?.guests) {
    if (currentLifestyle.guests === targetLifestyle.guests) {
      score += WEIGHTS.GUESTS;
      reasons.push({ text: 'Similar social habits', weight: WEIGHTS.GUESTS });
    }
  }

  // Move-in Date Alignment (+2)
  const moveInScore = calculateMoveInAlignment(currentHousing, targetHousing);
  if (moveInScore > 0) {
    score += moveInScore;
    reasons.push({ text: 'Similar move-in dates', weight: moveInScore });
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

  // Sort reasons by weight and take top 3
  const topReasons = reasons
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(r => r.text);

  return { score, reasons: topReasons };
}

function calculateBudgetFit(currentHousing?: Housing, targetHousing?: Housing): { score: number; reason: string } {
  if (!currentHousing || !targetHousing) return { score: 0, reason: '' };

  // Case 1: One has room, other needs room
  if (currentHousing.hasRoom && !targetHousing.hasRoom) {
    const rent = currentHousing.rent || 0;
    const minBudget = targetHousing.budgetMin || 0;
    const maxBudget = targetHousing.budgetMax || Infinity;
    
    if (rent >= minBudget && rent <= maxBudget) {
      const budgetRange = maxBudget - minBudget;
      const position = (rent - minBudget) / budgetRange;
      const score = WEIGHTS.BUDGET_FIT * (1 - Math.abs(position - 0.5) * 2);
      return { score, reason: 'Budget matches perfectly' };
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
      const score = WEIGHTS.BUDGET_FIT * (overlapSize / totalRange);
      return { score, reason: 'Similar budget range' };
    }
  }

  return { score: 0, reason: '' };
}

function calculateLanguageCompatibility(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reason: string } {
  if (!currentLifestyle || !targetLifestyle) {
    return { score: 0, reason: '' };
  }

  // Extract languages from dietary or other fields (simplified)
  // In a real app, you'd have a dedicated languages field
  // For now, we'll give partial points if they share hobbies that indicate language
  const currentHobbies = new Set(currentLifestyle.hobbies || []);
  const targetHobbies = new Set(targetLifestyle.hobbies || []);
  
  const languageIndicators = ['languages', 'travel', 'books', 'films'];
  const sharedLanguageInterests = languageIndicators.filter(indicator => 
    currentHobbies.has(indicator) && targetHobbies.has(indicator)
  );

  if (sharedLanguageInterests.length > 0) {
    return { score: WEIGHTS.LANGUAGE, reason: 'Share language interests' };
  }

  // Default: assume same language if in same city
  return { score: WEIGHTS.LANGUAGE * 0.5, reason: 'Can communicate easily' };
}

function calculateHobbiesOverlap(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reason: string } {
  if (!currentLifestyle || !targetLifestyle) {
    return { score: 0, reason: '' };
  }

  const currentHobbies = new Set(currentLifestyle.hobbies || []);
  const targetHobbies = new Set(targetLifestyle.hobbies || []);
  
  const intersection = new Set([...currentHobbies].filter(h => targetHobbies.has(h)));
  const union = new Set([...currentHobbies, ...targetHobbies]);

  if (union.size === 0) return { score: 0, reason: '' };

  const jaccardSimilarity = intersection.size / union.size;
  const score = WEIGHTS.HOBBIES * jaccardSimilarity;

  let reason = '';
  if (intersection.size >= 3) {
    reason = `Share ${intersection.size} hobbies`;
  } else if (intersection.size >= 1) {
    const sharedHobbies = Array.from(intersection).slice(0, 2).join(' & ');
    reason = `Both enjoy ${sharedHobbies}`;
  }

  return { score, reason };
}

function calculateFoodCompatibility(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reason: string } {
  if (!currentLifestyle || !targetLifestyle) {
    return { score: 0, reason: '' };
  }

  const currentFood = currentLifestyle.foodPreference;
  const targetFood = targetLifestyle.foodPreference;

  if (currentFood && targetFood && currentFood === targetFood) {
    const foodLabel = currentFood === 'vegetarian' ? 'vegetarian' :
                     currentFood === 'vegan' ? 'vegan' :
                     currentFood === 'halal' ? 'halal' :
                     currentFood === 'kosher' ? 'kosher' : 'similar diet';
    return { score: WEIGHTS.FOOD, reason: `Both ${foodLabel}` };
  }

  return { score: 0, reason: '' };
}

function calculatePoliticsCompatibility(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reason: string } {
  if (!currentLifestyle || !targetLifestyle) {
    return { score: 0, reason: '' };
  }

  const currentPolitics = currentLifestyle.politicalView;
  const targetPolitics = targetLifestyle.politicalView;

  if (currentPolitics && targetPolitics && currentPolitics === targetPolitics) {
    return { score: WEIGHTS.POLITICS, reason: 'Similar political views' };
  }

  return { score: 0, reason: '' };
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

function calculateReligionMatch(
  currentLifestyle?: Lifestyle,
  targetLifestyle?: Lifestyle
): { score: number; reason: string } {
  if (!currentLifestyle || !targetLifestyle) return { score: 0, reason: '' };

  // Only apply if both users opted to show religion
  if (!currentLifestyle.showReligion || !targetLifestyle.showReligion) return { score: 0, reason: '' };

  // Only apply if both have religion specified
  if (!currentLifestyle.religion || !targetLifestyle.religion) return { score: 0, reason: '' };

  if (currentLifestyle.religion === targetLifestyle.religion) {
    return { score: WEIGHTS.RELIGION, reason: 'Share religious values' };
  }

  return { score: 0, reason: '' };
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