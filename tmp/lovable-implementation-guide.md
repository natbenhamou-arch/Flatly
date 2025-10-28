# Comprehensive Implementation Guide for Flatly App

## PART 1: UNIVERSITY DATABASE & CITY AUTO-SELECTION

### Task 1.1: Research and Create Universities Database
**What to do:**
1. Go to the web and research top universities in Europe and USA
2. For EACH university, you need to collect:
   - Full university name
   - City where it's located
   - Country
   - Coordinates (latitude, longitude)
3. Create a new file: `mocks/universities.ts`
4. Structure it like this:

```typescript
export interface University {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
}

export const universities: University[] = [
  { id: 'harvard', name: 'Harvard University', city: 'Cambridge', country: 'USA', coordinates: { lat: 42.3736, lng: -71.1097 } },
  { id: 'stanford', name: 'Stanford University', city: 'Palo Alto', country: 'USA', coordinates: { lat: 37.4275, lng: -122.1697 } },
  // Add at least 50+ major universities from Europe and USA
];
```

**How to research:**
- Search "top universities in USA" and "top universities in Europe"
- For each university, Google "[university name] location" to get city
- Use Google Maps to get exact coordinates

### Task 1.2: Auto-Fill City from University Selection
**How it currently works (READ THIS CAREFULLY):**
The app has an onboarding flow in `app/onboarding/school-city.tsx`. When a user selects a university, the city should be AUTOMATICALLY filled based on the university they selected.

**What you need to do:**
1. In `app/onboarding/school-city.tsx`:
   - When user selects a university from the list
   - Find that university in the universities database
   - AUTOMATICALLY set the city field to the university's city
   - Do NOT make user type the city manually
   - The city input should become read-only after university is selected

2. Add a small text below the city field: "📍 Auto-filled from your university"

### Task 1.3: Neighborhood Data for Each City
**What to do:**
1. Create a new file: `mocks/neighborhoods.ts`
2. For the top 20 cities from your universities list, research popular neighborhoods
3. Structure it like this:

```typescript
export interface CityNeighborhoods {
  city: string;
  neighborhoods: string[];
}

export const cityNeighborhoods: CityNeighborhoods[] = [
  { 
    city: 'Boston', 
    neighborhoods: ['Back Bay', 'Beacon Hill', 'South End', 'Allston', 'Brighton', 'Cambridge'] 
  },
  { 
    city: 'London', 
    neighborhoods: ['Camden', 'Shoreditch', 'Notting Hill', 'Brixton', 'Greenwich', 'Hackney'] 
  },
  // Add for all major cities
];
```

**How to research:**
- Google "[city name] popular neighborhoods students"
- Focus on student-friendly areas
- Include 6-10 neighborhoods per city

### Task 1.4: Display Neighborhoods in Housing Page
**What to do:**
1. In `app/onboarding/housing.tsx`:
   - Get the user's selected city from their profile
   - Look up neighborhoods for that city from your `cityNeighborhoods` database
   - Display these neighborhoods as selectable options
   - User should be able to select multiple preferred neighborhoods
   - Style them as pill-shaped buttons that can be toggled on/off

---

## PART 2: MATCHING SYSTEM DEEP DIVE

### Task 2.1: Understanding the Compatibility Algorithm
**READ THIS SECTION CAREFULLY:**

The compatibility system works by giving points for different factors. Here's how it's scored:

**Primary factors (60 points total):**
- Same City: +25 points (MOST IMPORTANT)
- Same University: +20 points
- Shared Language: +25 points

**Secondary factors (25 points total):**
- Similar Cleanliness: +8 points
- Similar Sleep Schedule: +8 points
- Similar Noise Tolerance: +9 points

**Tertiary factors (15 points total):**
- Budget compatibility: +8 points
- Hobby overlap: +3 points
- Same food preferences: +2 points
- Similar political views: +1 point
- Same religion: +2 points
- Same smoking status: +2 points
- Same pet preference: +2 points
- Similar guest frequency: +2 points
- Similar move-in dates: +2 points

**IMPORTANT:** Every question in onboarding counts toward compatibility! This is why we collect:
- City, University (primary match factors)
- Languages spoken (primary factor)
- Cleanliness level, Sleep schedule, Noise tolerance (secondary factors)
- Budget, Hobbies, Food preferences, etc. (tertiary factors)

### Task 2.2: Ensure ALL Onboarding Data is Saved
**What to check:**
1. Go through EVERY onboarding page
2. Make sure the data is being saved to the user's profile
3. Verify these fields are captured:
   - Personal: Name, Age, Gender, University, City
   - Housing: Budget, Move-in date, Has room?, Preferred neighborhoods
   - Lifestyle: Cleanliness, Sleep, Noise, Smoker, Pets, Guests, Languages
   - Interests: Hobbies (make sure bubbles appear when you add one)
   - Vibe: Bio, Photos

---

## PART 3: CONVERSATION & MESSAGING SYSTEM

### Task 3.1: Understanding the Current Chat System
**How it works now:**
- File: `app/chat/[matchId].tsx`
- Messages are stored in `messages` state
- The `sendMessage` function sends a message
- Messages show in a FlatList with sender on right, receiver on left

### Task 3.2: Implement REAL Working Messages
**What you need to fix:**
1. Messages should persist (use AsyncStorage or backend)
2. When you send a message, it should:
   - Show immediately (optimistic update)
   - Actually save to storage
   - Be visible when you close and reopen the chat
3. Message timestamps should be accurate
4. Read receipts should work (show when message was read)

### Task 3.3: Automatic Welcome Messages
**What to implement:**
1. When a match is created, automatically send a system message
2. Message should say: "🎉 You matched! Start chatting below."
3. This happens in the match creation logic (in swipe handler)

### Task 3.4: Smart Conversation Openers
**Already implemented but verify:**
- The lightbulb icon shows "Smart Openers"
- These use AI to generate personalized opening lines
- Make sure the `generateChatOpeners` function in `services/ai.ts` works
- Openers should be based on shared interests, university, etc.

---

## PART 4: GROUP CHAT FEATURES

### Task 4.1: Understanding Group Creation
**How it works:**
1. You're in a 1-on-1 chat with Match A
2. You click the "Users" icon in the header
3. A modal shows other potential matches
4. You select one person to add
5. Creates a new group chat with 3 people total

### Task 4.2: What Groups Should Enable
**Features to implement:**
1. Group name displayed in header
2. All 3 people can send messages
3. Messages show who sent them (not just left/right)
4. Propose viewing times feature:
   - Click Calendar icon
   - Suggests 3 time slots everyone is available
   - Sends as a special message in chat
5. Safety banner should show all participant names

### Task 4.3: Use Case Explanation
**Why groups exist:**
Groups allow matched roommates to coordinate finding an apartment together. For example:
- Sarah and John match (both need a room)
- They want to find a 3-bedroom with another person
- Sarah adds Mike to the group
- All 3 can now chat and schedule apartment viewings together

---

## PART 5: PHOTO UPLOAD IN ONBOARDING

### Task 5.1: Enable Real Photo Upload
**What to implement:**
Currently photos use placeholder URLs. Change this:

1. In `app/onboarding/vibe.tsx`:
   - Add an "Add Photo" button
   - Use `expo-image-picker` to let user select photos from their device
   - Allow up to 5 photos
   - First photo becomes main profile picture
   - Store photo URIs in user.photos array

2. Code example:
```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.8,
  });
  
  if (!result.canceled) {
    const uris = result.assets.map(asset => asset.uri);
    setPhotos([...photos, ...uris]);
  }
};
```

---

## PART 6: AUTOMATED BIO GENERATION

### Task 6.1: Implement AI Bio Generator
**What to create:**
1. In `app/onboarding/vibe.tsx`, add a button "✨ Generate Bio for Me"
2. When clicked, call an AI function that creates a bio based on:
   - Their hobbies
   - Their lifestyle (cleanliness, sleep schedule)
   - Their university and program
   - Their interests

3. Create function in `services/ai.ts`:
```typescript
export async function generateBio(profile: {
  hobbies: string[];
  lifestyle: Lifestyle;
  university: string;
  program: string;
}): Promise<string> {
  // Use AI to generate a friendly, authentic bio
  // Should be 2-3 sentences
  // Include emojis
  // Sound natural, not corporate
}
```

---

## PART 7: PROFILE MANAGEMENT

### Task 7.1: Pause Profile Feature
**What it does:**
- User can pause their profile
- When paused, they don't appear in other people's Discover feed
- They can still see their existing matches
- They CANNOT like new people

**Where to implement:**
1. In `app/(tabs)/profile.tsx` or `app/settings/index.tsx`:
   - Add toggle: "Pause Profile"
   - When ON: set `user.paused = true`
   - Show warning: "You're hidden from Discover"

2. Update Discover logic:
   - Filter out paused users from feed
   - If current user is paused, disable like buttons
   - Show banner: "⏸️ Profile paused"

**Already implemented - verify it works!**

### Task 7.2: Edit Profile After Onboarding
**What to implement:**
1. In `app/(tabs)/profile.tsx`:
   - Show all profile information
   - Add "Edit Profile" button
   - Opens modal or new screen where user can:
     - Change photos
     - Edit bio
     - Update interests
     - Modify housing preferences
     - Change lifestyle answers

---

## PART 8: PROFILE VERIFICATION

### Task 8.1: Verification Badge System
**What to implement:**
1. Add `verified: boolean` field to User type
2. In profile UI, show a blue checkmark ✓ badge next to verified users
3. Create verification flow:
   - User goes to Settings > Verify Profile
   - Takes a selfie holding their student ID
   - Submit for review
   - (For demo, auto-approve after 2 seconds)

4. Verified users get prioritized in Discover feed

---

## PART 9: FAKE DEMO USERS & MATCHES

### Task 9.1: Create 20 Realistic Demo Users
**What to do:**
1. Look at existing `mocks/users.ts`
2. Add 15 more diverse users with:
   - Real-looking names
   - Different universities from your database
   - Different cities
   - Varied lifestyles (clean vs messy, early bird vs night owl)
   - Unique hobbies and interests
   - Professional photos from Unsplash (use different faces)

3. Make sure they're diverse:
   - Different genders
   - Different nationalities
   - Different budget ranges
   - Some have rooms, some need rooms

### Task 9.2: Create Fake Matches with Messages
**What to implement:**
1. When user completes onboarding, automatically create 3 matches for them
2. Each match should have 2-5 existing messages (conversation starters)
3. Messages should feel natural:
   - "Hey! I saw you're also at [University]. What program are you in?"
   - "Hi! Love your interest in [hobby]. I'm also into that!"

### Task 9.3: Demo Match Animation
**Already implemented in `components/MatchAnimation.tsx` - verify:**
- When you swipe right and match, animation plays
- Shows "It's a Match!" with both photos
- Confetti or celebration effect
- Button to "Send Message"

**Make sure:**
- Animation plays immediately on match
- After animation, opens the chat
- First match shows tutorial explaining the chat

---

## PART 10: PREMIUM FEATURES

### Task 10.1: Premium Feature List
**Design a Premium tier with:**
1. **Unlimited Likes** (free users get 10/day)
2. **See Who Liked You** (grid view of people who swiped right)
3. **Advanced Filters** (filter by hobbies, religion, dietary)
4. **Rewind** (undo last swipe)
5. **Priority Placement** (appear more in others' feeds)
6. **Verification Badge** (faster verification)

### Task 10.2: Premium UI
**Where to add:**
1. Create `app/premium.tsx` screen
2. Add link from Profile tab: "✨ Go Premium"
3. Show pricing: $9.99/month or $59.99/year
4. List all premium features with icons
5. "Subscribe" button (for demo, just show success message)

### Task 10.3: Limit Free Features
**What to restrict:**
1. Free users can only like 10 people per day
2. Show counter: "3 likes remaining today"
3. When they run out: "Out of likes! Upgrade to Premium for unlimited."
4. Reset counter at midnight

---

## PART 11: GENDER & PREFERENCE FILTERS

### Task 11.1: Add Gender Selection to Onboarding
**What to add:**
1. In onboarding (add new page or add to existing):
   - "What's your gender?"
     - Options: Male, Female, Non-binary, Prefer not to say
   - "Who are you looking for?"
     - Options: Men, Women, Everyone

2. Save to user preferences
3. Use for filtering in Discover feed

### Task 11.2: Filter Logic
**Implement filtering:**
1. When generating feed, only show users that match preferences
2. Example: If user selected "Looking for Women", only show women
3. If user selected "Everyone", show all genders

---

## IMPLEMENTATION CHECKLIST

Use this checklist to track your progress:

### Phase 1: Data Foundation
- [ ] Create universities.ts with 50+ universities (Europe & USA)
- [ ] Create neighborhoods.ts with neighborhoods for top 20 cities
- [ ] Create 20 diverse fake users in mocks/users.ts

### Phase 2: Onboarding Flow
- [ ] Auto-fill city from university selection
- [ ] Show neighborhoods based on selected city
- [ ] Add hobby bubbles that appear when added
- [ ] Add gender and preference questions
- [ ] Enable real photo upload (expo-image-picker)
- [ ] Add AI bio generator button
- [ ] Save ALL data to user profile on completion

### Phase 3: Matching System
- [ ] Verify compatibility algorithm uses all onboarding data
- [ ] Test that scores calculate correctly
- [ ] Ensure all question responses affect compatibility

### Phase 4: Messaging
- [ ] Make messages persist (don't disappear on reload)
- [ ] Auto-send welcome message on new match
- [ ] Fix smart openers to work properly
- [ ] Add timestamps and read receipts

### Phase 5: Groups
- [ ] Verify group creation works
- [ ] Show all participant names in group
- [ ] Implement "Propose viewing times" feature
- [ ] Messages show sender name in groups

### Phase 6: Profile Features
- [ ] Add "Edit Profile" functionality
- [ ] Implement "Pause Profile" toggle
- [ ] Add verification badge system
- [ ] Verified users show checkmark

### Phase 7: Premium
- [ ] Create premium features page
- [ ] Limit free users to 10 likes/day
- [ ] Show premium upgrade prompts
- [ ] Add "See who liked you" feature (premium)

### Phase 8: Demo Experience
- [ ] Create 3 auto-matches on first login
- [ ] Add 2-5 messages to each match
- [ ] Verify match animation plays correctly
- [ ] Add tutorial walkthrough on first use

---

## TESTING INSTRUCTIONS

After implementation, test this flow:

1. **New User Journey:**
   - Start onboarding
   - Select "Harvard University" → City should auto-fill to "Cambridge"
   - Select budget and neighborhoods (should show Cambridge neighborhoods)
   - Add hobbies → bubbles should appear
   - Upload 3 real photos from device
   - Click "Generate Bio" → AI creates bio
   - Complete onboarding

2. **Discover Flow:**
   - See feed of users
   - Swipe right → Match animation plays
   - Click "Say Hi" → Opens chat with welcome message
   - Send a real message → Should persist

3. **Group Flow:**
   - In a chat, click Users icon
   - Select person to add
   - Group created with 3 people
   - All can send messages

4. **Premium Flow:**
   - Like 10 people
   - See "Out of likes" message
   - Click "Go Premium"
   - See pricing page

5. **Profile Management:**
   - Go to Profile
   - Click "Edit Profile" → Can change info
   - Toggle "Pause Profile" → Hidden from Discover
   - Request verification → Get verified badge

---

## KEY TECHNICAL NOTES FOR LOVABLE

1. **City Auto-Population Logic:**
```typescript
// When university is selected:
const selectedUniversity = universities.find(u => u.name === selectedName);
if (selectedUniversity) {
  setCity(selectedUniversity.city); // Auto-fill
  setCityReadOnly(true); // Make it read-only
}
```

2. **Neighborhood Display Logic:**
```typescript
// In housing.tsx:
const userCity = useAppStore(state => state.currentUser?.city);
const neighborhoods = cityNeighborhoods.find(c => c.city === userCity)?.neighborhoods || [];
// Show these as selectable pills
```

3. **Compatibility Uses Everything:**
Every field collected in onboarding feeds into `services/compatibility.ts`. Don't skip any fields!

4. **Messages Must Persist:**
Use AsyncStorage or backend to store messages. Don't rely on useState alone.

5. **Match Animation Trigger:**
When `swipeUser` returns a match, call `showMatchAnimation(true)` immediately.

---

## EXPECTED FINAL RESULT

After implementing all parts, the app should:
1. ✅ Have 50+ universities with auto-city-fill
2. ✅ Show city-specific neighborhoods
3. ✅ Calculate compatibility using ALL onboarding answers
4. ✅ Let users upload real photos
5. ✅ Generate AI bios
6. ✅ Have working, persistent messaging
7. ✅ Support group chats with viewing time proposals
8. ✅ Allow profile editing after onboarding
9. ✅ Have pause/verification features
10. ✅ Include 20 diverse demo users
11. ✅ Auto-create 3 matches with messages
12. ✅ Show match animation on new matches
13. ✅ Have premium tier with limits
14. ✅ Filter by gender and preferences

This creates a fully functional, realistic dating/roommate matching app!
