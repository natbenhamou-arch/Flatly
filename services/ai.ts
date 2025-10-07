import { User, Lifestyle, Housing, Preferences } from '@/types';

// AI Bio Generation
export async function generateBio(userData: {
  user?: Partial<User>;
  lifestyle?: Partial<Lifestyle>;
  housing?: Partial<Housing>;
  preferences?: Partial<Preferences>;
}): Promise<string> {
  try {
    console.log('Generating AI bio with data:', userData);
    
    // Extract key information
    const { user, lifestyle, housing } = userData;
    const hobbies = lifestyle?.hobbies?.slice(0, 3) || [];
    const university = user?.university || 'university';
    const hasRoom = user?.hasRoom;
    const cleanliness = lifestyle?.cleanliness;
    const sleep = lifestyle?.sleep;
    
    // Create a friendly bio based on available data
    const bioTemplates = [
      `${user?.firstName || 'Student'} at ${university}. Love ${hobbies.join(', ')}. ${hasRoom ? 'Have a room to share!' : 'Looking for the perfect place.'} ${cleanliness === 'meticulous' ? 'Super tidy' : cleanliness === 'chill' ? 'Pretty laid back' : 'Balanced'} and ${sleep === 'early' ? 'early bird' : sleep === 'night' ? 'night owl' : 'flexible with schedule'}.`,
      
      `${university} student who enjoys ${hobbies.join(' & ')}. ${hasRoom ? 'Got a great place looking for a roommate!' : 'Searching for my next home.'} I'm ${cleanliness === 'meticulous' ? 'very organized' : cleanliness === 'chill' ? 'easy-going' : 'pretty balanced'} and ${sleep === 'early' ? 'love morning routines' : sleep === 'night' ? 'productive at night' : 'adaptable'}. Let's chat!`,
      
      `Hey! I'm at ${university} and passionate about ${hobbies.join(', ')}. ${hasRoom ? 'Have an awesome room available!' : 'Looking for a great place to call home.'} I'm ${cleanliness === 'meticulous' ? 'neat and organized' : cleanliness === 'chill' ? 'relaxed and easy-going' : 'balanced'}, ${sleep === 'early' ? 'early riser' : sleep === 'night' ? 'night person' : 'flexible with timing'}.`
    ];
    
    // Select random template and ensure it's under 240 chars
    let bio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
    
    // Truncate if too long
    if (bio.length > 240) {
      bio = bio.substring(0, 237) + '...';
    }
    
    console.log('Generated bio:', bio);
    return bio;
    
  } catch (error) {
    console.error('Failed to generate bio:', error);
    return 'Student looking for the perfect roommate match! Let\'s connect and see if we\'re compatible.';
  }
}

// Smart Chat Openers
export async function generateChatOpeners(userData: {
  currentUser: User;
  targetUser: User;
  currentLifestyle?: Lifestyle;
  targetLifestyle?: Lifestyle;
}): Promise<string[]> {
  try {
    const { currentUser, targetUser, currentLifestyle, targetLifestyle } = userData;
    
    // Find common interests
    const commonHobbies = currentLifestyle?.hobbies?.filter(hobby => 
      targetLifestyle?.hobbies?.includes(hobby)
    ) || [];
    
    const openers: string[] = [];
    
    // Hobby-based openers
    if (commonHobbies.length > 0) {
      const hobby = commonHobbies[0];
      const hobbyOpeners = {
        'music': `I noticed we both love music! What's been on repeat for you lately?`,
        'fitness': `Fellow fitness enthusiast! What's your favorite way to stay active?`,
        'cooking': `I see we both enjoy cooking! What's your signature dish?`,
        'gaming': `Gaming buddy spotted! What are you playing these days?`,
        'hiking': `Another hiking lover! What's your favorite trail around here?`,
        'photography': `I love that we both do photography! What do you like to shoot?`,
        'travel': `Travel enthusiast here too! What's the best trip you've taken recently?`
      };
      openers.push(hobbyOpeners[hobby as keyof typeof hobbyOpeners] || `I see we both love ${hobby}! What got you into it?`);
    }
    
    // University-based openers
    if (currentUser.university === targetUser.university) {
      const universityOpeners = [
        `Fellow ${targetUser.university.split(',')[0]} student! What's your favorite spot on campus?`,
        `Hey! What's your major at ${targetUser.university.split(',')[0]}?`,
        `Nice to meet another ${targetUser.university.split(',')[0]} student! How are you liking it there?`
      ];
      openers.push(universityOpeners[Math.floor(Math.random() * universityOpeners.length)]);
    }
    
    // Housing-based openers
    if (currentUser.hasRoom && !targetUser.hasRoom) {
      const roomOpeners = [
        `I have a place available! What's your ideal living situation?`,
        `I've got a room to share! What are you looking for in a living space?`,
        `Perfect timing - I have a room! What's most important to you in a roommate?`
      ];
      openers.push(roomOpeners[Math.floor(Math.random() * roomOpeners.length)]);
    } else if (!currentUser.hasRoom && targetUser.hasRoom) {
      const seekingOpeners = [
        `Your place sounds great! What's the neighborhood like?`,
        `I'm interested in your listing! Tell me about the living situation.`,
        `Your place caught my eye! What's it like living there?`
      ];
      openers.push(seekingOpeners[Math.floor(Math.random() * seekingOpeners.length)]);
    }
    
    // Lifestyle-based openers
    if (currentLifestyle && targetLifestyle) {
      if (currentLifestyle.sleep === targetLifestyle.sleep) {
        const sleepOpeners = {
          'early': `Another early bird! What's your morning routine like?`,
          'night': `Fellow night owl! What keeps you up late?`,
          'flex': `I love that we're both flexible with schedules! Makes roommate life easier.`
        };
        openers.push(sleepOpeners[currentLifestyle.sleep]);
      }
      
      if (currentLifestyle.cleanliness === targetLifestyle.cleanliness) {
        const cleanOpeners = {
          'meticulous': `I appreciate that we both value a tidy space! Organization is key.`,
          'chill': `Love that we're both pretty laid back about tidiness!`,
          'avg': `We seem to have similar cleanliness standards - that's great!`
        };
        openers.push(cleanOpeners[currentLifestyle.cleanliness]);
      }
    }
    
    // City/location-based openers
    const cityOpeners = [
      `Hey ${targetUser.firstName}! What's your favorite thing about ${targetUser.city}?`,
      `Hi! Any hidden gems in ${targetUser.city} you'd recommend?`,
      `What's the best coffee shop in ${targetUser.city}? Always looking for new spots!`
    ];
    
    // Generic friendly openers
    const genericOpeners = [
      `Hey ${targetUser.firstName}! What's your ideal weekend like?`,
      `Hi there! What's keeping you busy these days?`,
      `Hey! What's your go-to study spot?`,
      `Hi ${targetUser.firstName}! What's been the highlight of your week?`,
      `What's your favorite way to unwind after a long day?`
    ];
    
    // Fill remaining slots with city or generic openers
    const remainingOpeners = [...cityOpeners, ...genericOpeners];
    while (openers.length < 3) {
      const randomOpener = remainingOpeners[Math.floor(Math.random() * remainingOpeners.length)];
      if (!openers.includes(randomOpener)) {
        openers.push(randomOpener);
      }
    }
    
    return openers.slice(0, 3);
    
  } catch (error) {
    console.error('Failed to generate chat openers:', error);
    return [
      'Hey! How\'s your day going?',
      'Hi there! What\'s your favorite thing about being a student?',
      'Hello! What are you looking for in a roommate?'
    ];
  }
}

// Image Analysis (stub for future implementation)
export async function analyzeImage(imageUri: string): Promise<{
  isAppropriate: boolean;
  tags: string[];
  confidence: number;
}> {
  // Stub implementation - in production would use image analysis API
  console.log('Analyzing image:', imageUri);
  
  return {
    isAppropriate: true,
    tags: ['person', 'photo'],
    confidence: 0.95
  };
}

// Content Moderation (stub)
export async function moderateText(text: string): Promise<{
  isAppropriate: boolean;
  flaggedWords: string[];
  confidence: number;
}> {
  // Basic word filtering - in production would use proper moderation API
  const flaggedWords = ['spam', 'scam', 'fake'];
  const foundFlags = flaggedWords.filter(word => 
    text.toLowerCase().includes(word)
  );
  
  return {
    isAppropriate: foundFlags.length === 0,
    flaggedWords: foundFlags,
    confidence: 0.8
  };
}