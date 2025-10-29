# FLATLY - Complete Application Architecture & Feature Guide

## 🎯 APPLICATION OVERVIEW

**Flatly** is a sophisticated roommate-finding mobile application built with React Native (Expo) that connects university students looking for housing or roommates. It combines Tinder-style swiping with AI-powered compatibility matching, messaging, and group coordination features.

---

## 📱 CORE CONCEPT

Flatly solves the problem of finding compatible roommates for university students by:
- Creating detailed profiles with lifestyle preferences, housing needs, and personalities
- Using an advanced AI-powered compatibility algorithm (0-100% score) based on 20+ factors
- Enabling swipe-based discovery (like/pass/superlike)
- Facilitating matches through 1-on-1 and group chats
- Coordinating apartment viewings through availability scheduling
- Supporting both room seekers and room owners

---

## 🏗️ APPLICATION ARCHITECTURE

### Technology Stack
- **Frontend**: React Native 0.81.5 with Expo SDK 54
- **State Management**: Zustand for global state, React Query for server state, @nkzw/create-context-hook for context management
- **Backend**: Hono + tRPC for type-safe API
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with custom design system
- **AI Integration**: OpenAI API for bio generation, chat openers, and compatibility analysis
- **Icons**: Lucide React Native
- **Animations**: React Native Animated API

### Project Structure
```
app/
  ├── (tabs)/          # Main tabbed navigation
  │   ├── discover.tsx  # Swipe screen
  │   ├── matches.tsx   # 1-on-1 matches list
  │   ├── groups.tsx    # Group matches list
  │   └── profile.tsx   # User profile editor
  ├── onboarding/      # Multi-step onboarding flow
  ├── chat/[matchId].tsx # Chat screen (1-on-1 and groups)
  ├── admin.tsx        # Admin panel (secret)
  ├── signin.tsx       # Authentication
  └── signup.tsx
components/          # Reusable UI components
services/           # Business logic & data services
store/             # Global state management
types/             # TypeScript type definitions
constants/         # Theme, colors, spacing
mocks/             # Demo data (users, universities)
backend/           # tRPC API routes
```

---

## 🔑 KEY FEATURES IN DETAIL

### 1. ONBOARDING FLOW (Multi-Step Profile Creation)

The onboarding is a **7-step wizard** that collects comprehensive user information:

#### Step 1: Welcome Screen (`app/onboarding/index.tsx`)
- Displays Flatly logo and branding
- "Get Started" button to begin onboarding
- Clean gradient background with brand colors

#### Step 2: Full Name (`app/onboarding/full-name.tsx`)
- First name and last name inputs
- Validates that both fields are filled
- Stores in user object

#### Step 3: School & City Selection (`app/onboarding/school-city.tsx`)
**CRITICAL AUTOMATED FEATURE:**
- University search with **autocomplete** from 150+ pre-loaded universities (US, UK, Canada, Europe, Australia)
- **AUTO-CITY SELECTION**: When user selects university, the city is **automatically populated** from the university database
  - Example: Select "Stanford University" → City auto-fills to "Stanford"
  - Example: Select "University College London" → City auto-fills to "London"
- Database stored in `mocks/universities.ts` with structure:
  ```typescript
  {
    id: 'stanford',
    name: 'Stanford University',
    city: 'Stanford',  // ← This is used for auto-fill
    country: 'United States',
    domain: 'stanford.edu',
    top500: true
  }
  ```
- Search function: `searchUniversities(query)` filters by name, city, or country
- **Neighborhoods**: After city is confirmed, system loads neighborhood options specific to that city from `NEIGHBORHOODS_BY_CITY` object
  - Example: London → ['Camden', 'Shoreditch', 'Notting Hill', 'Kensington', ...]
  - Example: Berkeley → ['North Berkeley', 'Downtown Berkeley', 'Southside', ...]
- User selects preferred neighborhoods (stored in Housing preferences)

#### Step 4: Housing Details (`app/onboarding/housing.tsx`)
**Two paths based on user type:**

**Path A: I Have a Room (Room Owner)**
- Neighborhood selection (from city-specific list)
- Number of bedrooms and bathrooms
- Monthly rent price
- Bills included? (yes/no toggle)
- Available from/to dates
- Property owner? (yes/no)
- Apartment description (free text)
- Upload room photos (1-6 photos)

**Path B: I Need a Room (Room Seeker)**
- Budget range (min/max monthly rent)
- Currency selection
- Preferred neighborhoods (multi-select from city list)
- Move-in date range (from/to)
- Additional preferences (free text)

#### Step 5: Lifestyle Preferences (`app/onboarding/lifestyle.tsx`)
Collects personality and living habits:
- **Interests/Hobbies**: Multi-select chips (music, fitness, cooking, gaming, hiking, photography, travel, etc.)
- **Cleanliness Level**: Slider/buttons (Chill → Average → Meticulous)
- **Sleep Schedule**: Early bird / Flexible / Night owl
- **Smoker**: Yes/No
- **Pets**: Have pets? (list), OK with pets? (yes/no)
- **Guest Frequency**: Never / Sometimes / Often
- **Noise Tolerance**: Low / Medium / High
- **Study Program Year**: Dropdown (Freshman, Sophomore, Junior, Senior, Grad, PhD)
- **Job/Internship**: Text input

#### Step 6: Vibe & Identity (`app/onboarding/vibe.tsx`)
Deeper personality traits:
- **Languages Spoken**: Multi-select (English, Spanish, French, Mandarin, etc.)
- **Nationalities**: Multi-select
- **Political View**: Conservative / Progressive / Centrist / Ecological / Apolitical (optional, can hide)
- **Religious**: Yes / No / Prefer not to say (optional, can hide)
- **Money Style**: Meticulous / Balanced / Loose
- **Food Preference**: Omnivore / Vegetarian / Vegan / Halal / Kosher / Other
- **Sports & Hobbies**: Multi-select
- **Favorite Series/Films**: Free text

#### Step 7: Interests Tags (`app/onboarding/interests.tsx`)
- Additional interest bubbles/tags
- Visual bubble interface
- Can add custom interests

#### Step 8: Media Upload (`app/onboarding/media.tsx`)
- Upload 1-6 profile photos
- First photo = primary display photo
- Can reorder photos
- Uses expo-image-picker for camera/gallery access
- **Real Photo Support**: Can upload actual photos from device

#### Step 9: Matching Preferences (`app/onboarding/preferences.tsx`)
Control who you see:
- **Gender**: What's your gender? (Male/Female/Non-binary/Other)
- **Looking For Gender**: Who are you looking for? (Male/Female/Both/No preference)
- **Age Range**: Min-Max slider (18-35)
- **Max Distance**: Kilometer radius from your city
- **Looking For**: Roommate / Room / Either
- **City Only**: Toggle (only show people in my exact city)
- **University Only**: Toggle (only show people at my university)
- **Deal-breakers**: Tags (Smoking, Loud parties, Messy, etc.)
- **Must-haves**: Tags (Clean, Respectful, Quiet hours, etc.)
- **Nice-to-haves**: Tags (Similar interests, Gym nearby, etc.)
- **Recommendation Code**: Optional code for filtering matches to specific cohorts

#### Step 10: Review & Create (`app/onboarding/review-create.tsx`)
- Shows complete profile preview
- **AI Bio Generation**: Button to auto-generate bio using OpenAI based on:
  - University, hobbies, housing status, cleanliness, sleep schedule
  - Bio is personalized, 240 characters max
  - Multiple templates randomized for variety
- Edit any section before completing
- "Complete Profile" button
- **IMPORTANT**: Profile is saved to data store only after completion
- Redirects to main app (Discover tab)

---

### 2. DISCOVER TAB (Swipe Matching)

The core feature where users find potential roommates.

#### UI Components
- **Card Stack**: Shows one user card at a time, with next card slightly visible behind
- **User Card** (`components/UserCard.tsx`):
  - Large profile photo (carousel for multiple photos)
  - Name, age, university
  - City and neighborhood
  - Short bio (240 chars)
  - Compatibility score badge (colored: 85%+ green, 70-84% yellow, <70% orange)
  - Distance indicator (km away)
  - Housing status icon (has room / looking for room)
  - Quick stats: cleanliness, sleep schedule, noise tolerance

#### Swipe Mechanics (PanResponder)
- **Swipe Right (Like)**: Card slides right with rotation, green border flash
- **Swipe Left (Pass)**: Card slides left with rotation, red border flash
- **Tap Card**: Opens full profile modal (see Profile Detail Modal below)
- **Tap Compatibility Score**: Opens compatibility explanation modal
- Animation using React Native's Animated API:
  ```typescript
  pan.setValue({ x: gestureX, y: gestureY })
  opacity.setValue(1 - Math.abs(gestureX) / screenWidth)
  rotation = gestureX / screenWidth * 15deg
  ```

#### Action Buttons (Bottom of screen)
- **Pass Button (X)**: Large pill button, dark gradient, explicitly passes
- **Like Button (Heart)**: Large pill button, blue gradient, explicitly likes
- Both buttons trigger same animations as swipe gestures

#### Feed Algorithm
**The feed is generated in `services/data.ts` by `generateFeed()`:**
1. Fetch all users from database
2. Filter out:
   - Current user
   - Already swiped users (likes + passes)
   - Existing matches
   - Banned users (from admin panel)
   - Users who blocked you
3. Apply preference filters:
   - **City filter**: If cityOnly=true, only show exact city matches
   - **University filter**: If universityFilter=true, only show same university
   - **Age range**: Within user's ageMin-ageMax preference
   - **Distance**: Within maxDistanceKm radius (calculated using geo coordinates)
   - **Recommendation code**: If useRecommendationCode=true, only show users with same code
4. Calculate compatibility score for each remaining user (see Compatibility System below)
5. **Filter by minimum score**: Only show users with score ≥ 40 (configurable)
6. **Sort by compatibility score**: Highest first
7. Return top 20 users

#### Match Animation
When both users like each other:
1. **Instant match** created in database
2. **Match animation** triggers (`components/MatchAnimation.tsx`):
   - Full-screen overlay
   - Celebratory confetti/particles
   - "IT'S A MATCH!" text with animation
   - Photos of both users slide together
   - "Say Hi 👋" button
3. Navigation to chat screen
4. **Automatic welcome message** sent if enabled in settings

#### Walkthrough (First-time Users)
- Modal overlay with 4 slides explaining:
  1. How to swipe (right=like, left=pass)
  2. How to view full profiles (tap card)
  3. How to create groups (turn match into group chat)
  4. How to manage profile (pause/edit in Profile tab)
- "Next" buttons, dots indicator
- "Got it" on final slide
- Saves `walkthroughSeen: true` to user profile

#### Paused Profile Feature
- Toggle in Profile tab
- When paused:
  - Red banner appears at top: "⏸️ Profile paused — You are hidden from Discover"
  - User is **removed from feed** (not shown to others)
  - User can still see feed and pass (but cannot like)
  - Like button disabled with opacity reduced
  - Toast message: "Profile paused" if attempting to like
- Useful for users who found a place or taking a break

---

### 3. COMPATIBILITY SCORING SYSTEM

**This is the secret sauce of Flatly.** The algorithm is in `services/compatibility.ts`.

#### Scoring Categories (Total = 100 points)

**PRIMARY FACTORS (60 points)**
1. **Same City** (+25 points): Both users in exact same city
   - Most important factor (housing must be in same area)
2. **Same University** (+20 points): Both attend same school
   - Strong indicator of shared schedule/lifestyle
3. **Language Compatibility** (+25 points): Share at least one common language
   - Critical for communication

**SECONDARY FACTORS (25 points)**
4. **Cleanliness Proximity** (+8 points):
   - Uses slider score (0-10)
   - Score = 8 * (1 - |userA.cleanlinessScore - userB.cleanlinessScore| / 10)
   - Example: Both 8/10 clean → difference 0 → 8 points
   - Example: One 2/10, other 9/10 → difference 7 → 2.4 points
5. **Sleep Rhythm Proximity** (+8 points):
   - Same calculation as cleanliness
   - Early birds match with early birds, night owls with night owls
6. **Noise Tolerance Proximity** (+9 points):
   - Same proximity calculation
   - Quiet people need quiet roommates
7. **Budget Fit** (+8 points):
   - **Case A**: One has room, other needs room
     - Check if rent fits in seeker's budget range
     - Perfect match = full 8 points
   - **Case B**: Both need rooms
     - Calculate budget overlap
     - More overlap = more points

**TERTIARY FACTORS (15 points)**
8. **Hobbies Overlap** (+5 points max):
   - Jaccard similarity: intersection / union
   - Share 3+ hobbies → ~5 points
   - Share 1-2 hobbies → 2-3 points
9. **Food Preference** (+3 points):
   - Both vegan → match
   - Both halal → match
   - Both vegetarian → match
10. **Political Alignment** (+2 points):
    - Both progressive / both conservative / both centrist
    - Optional, only if both users opted to show
11. **Religion Match** (+3 points):
    - Both same religion → match
    - Optional, only if both opted to show
12. **Smoking Compatibility** (+2 points):
    - Both smoke or both don't smoke
13. **Pet Compatibility** (+2 points):
    - Both pet-friendly or both no-pets
14. **Guest Frequency** (+2 points):
    - Proximity calculation like cleanliness
15. **Move-in Date Alignment** (+2 points):
    - If move-in dates within 30 days → points scale down with distance

**PENALTIES**
- **Blocked** (-10 points): User was blocked by you or blocked you
- **Already Passed** (-10 points): Duplicate pass action

#### Reasons Display
- Top 3 highest-weighted reasons shown in UI
- Examples:
  - "📍 Both in Berkeley" (25 points)
  - "🎓 Both at Stanford University" (20 points)
  - "🗣️ You both speak English and Spanish" (25 points)
  - "✨ Similar cleanliness expectations" (7 points)
  - "🎯 Share 4 hobbies" (4 points)

#### Compatibility Explanation
Users can tap the score badge to see:
- Exact percentage
- Top 3 matching factors with emojis
- Overall assessment:
  - 85%+ → "Excellent match! You have a lot in common."
  - 70-84% → "Great compatibility with shared interests."
  - 55-69% → "Good potential match worth exploring."
  - 40-54% → "Some compatibility, could work out."
  - <40% → Not shown in feed

#### Important Notes
- **Every question in onboarding counts** toward compatibility
- The more complete your profile, the better the matches
- Compatibility is **bidirectional** (same for both users)
- Score is **calculated real-time** when generating feed
- Stored in `FeedUser.compatibility.score` and `.reasons`

---

### 4. MATCHES TAB (1-on-1 Conversations)

Shows all successful matches (mutual likes).

#### Match List Display
- Sorted by most recent message/match time
- Each item shows:
  - User photo (with unread badge if new messages)
  - Name, age
  - University (truncated)
  - Last message preview (or "It's a match! Say hello!" if no messages)
  - Time ago (e.g., "2h ago", "3d ago")
  - Compatibility score badge
  - Unread count badge (red circle with number)

#### Empty State
- MessageCircle icon
- "No matches yet"
- "Keep swiping to find your perfect roommate match!"

#### Navigation
- Tap match → Navigate to `/chat/[matchId]`

---

### 5. CHAT SYSTEM (1-on-1 & Groups)

**The chat screen (`app/chat/[matchId].tsx`) handles both regular and group matches.**

#### Header
- User photo + name (for 1-on-1) or group name + member count
- Tap header → Opens full profile modal
- Right side actions:
  - **Calendar icon** (groups only): Propose viewing times
  - **Users icon** (1-on-1 only): Convert to group chat
  - **Three-dots menu**: Report or Block user

#### Message Display
- **FlatList** with messages scrolled to bottom
- Messages shown in bubbles:
  - **Your messages**: Purple/lavender background, right-aligned
  - **Other's messages**: White background, left-aligned
- Each message shows:
  - Text content
  - Image (if attached, tappable for full-screen view)
  - Timestamp (HH:MM format)
  - Read status (future feature)

#### Safety Banner (Top of chat)
- Dismissible card with shield icon
- "Safety tip: Never send money or deposits before viewing the place."
- For group chats, also shows: "Participants: [names as chips]"

#### Smart Openers (AI-Generated)
**Auto-loads for first message in 1-on-1 chats:**
- Uses OpenAI to generate 3 personalized conversation starters
- Based on:
  - **Common hobbies**: "I noticed we both love hiking! What's your favorite trail around here?"
  - **Same university**: "Fellow Stanford student! What's your favorite spot on campus?"
  - **Housing match**: "I have a place available! What's your ideal living situation?"
  - **Lifestyle match**: "Another early bird! What's your morning routine like?"
  - **City knowledge**: "What's the best coffee shop in Berkeley? Always looking for new spots!"
- Shown in expandable card with lightbulb icon
- Tap opener to auto-fill in input box
- Generate button to create new openers if user doesn't like first set

#### Message Input
- Multi-line TextInput (max 500 chars)
- Left side: Image picker button (📷)
  - On mobile: expo-image-picker (camera/gallery)
  - On web: HTML file input
  - Image preview in message bubble
- Center: Text input
- Right side buttons:
  - **Lightbulb icon** (1-on-1 only, on first load): Show smart openers
  - **Calendar icon** (groups only): Propose viewing times
  - **Send button**: Blue when text entered, gray when empty

#### Sending Messages
- Optimistic UI: Message appears immediately in list
- Actually sent via `useAppStore().sendMessage(matchId, text)`
- Stores in database
- Other user sees in real-time (in production with WebSockets)

#### Image Sharing
- Tap image icon → Choose from gallery or take photo
- Image uploaded (in demo, stored as base64/URL)
- Appears in message with thumbnail
- Tap to view full-screen

#### Group Chat Features
**When match has 3+ users:**
1. **Group Name**: Displayed in header
2. **Member List**: Shown in safety banner with chips
3. **Viewing Time Proposal**:
   - Tap calendar button
   - System generates 3 suggested time slots using `generateViewingTimes()`
   - Creates `ViewingProposal` object with:
     - Proposed times (array of datetime + location)
     - Responses array (each member can accept/decline)
   - Sends system message: "📅 Viewing times proposed: [times]"
   - All members get notification (future)
4. **Add Member**: Button to invite more people (2-5 person limit)

#### Converting Match to Group
From 1-on-1 chat, tap **Users icon** in header:
1. Opens modal with list of other matches
2. Select one+ people to add
3. Enter group name
4. System creates `GroupMatch` object
5. Sends invitations to selected users
6. Redirects to new group chat

#### Report & Block
Three-dots menu → Options:
- **Report**: Opens modal, user writes reason, submits to `services/report.ts`
- **Block**: Confirmation alert → Adds to blocked list → User disappears from feed forever

#### Auto-Match Message
When a new match is created:
- If user has `sendAutoMatchMessage: true` (default)
- System auto-sends `user.autoMatchMessage` (default: "Hi! Nice to meet you 👋")
- Configurable in Profile → Match Message Settings
- Can disable auto-send or customize message

---

### 6. GROUPS TAB (Group Finding)

Allows users to form groups of 2-5 people to search for housing together.

#### Group List
- Each group card shows:
  - Group name (user-created)
  - Member count and average compatibility
  - Compatibility badge (% score)
  - Member avatars (overlapping circles, +N for extras)
  - Action buttons:
    - **Propose Times**: Opens viewing coordination
    - **Invite**: Add more people to group

#### Creating a Group
1. Tap FAB (+ button) or "Create Your First Group"
2. Opens modal:
   - Enter group name
   - Select matches to invite (shows all 1-on-1 matches)
   - Checkboxes for multi-select
3. Tap ✓ to create
4. System:
   - Creates `GroupMatch` with user IDs array
   - Creates invitations for each member
   - Initializes group chat
   - Calculates group compatibility (average of all pair-wise scores)

#### Group Compatibility
- Calculated as: average of all pairwise compatibility scores
- Example: 3-person group:
  - User A ↔ B: 85%
  - User A ↔ C: 78%
  - User B ↔ C: 82%
  - Group score: (85 + 78 + 82) / 3 = 81.7%

#### Viewing Coordination
**Goal: Find times when all members are free**
- Group member taps "Propose Times"
- System uses `generateViewingTimes()`:
  - Fetches all members' availability schedules
  - Finds overlapping free time slots
  - Suggests 3 best options
- Creates `ViewingProposal` object
- All members get notification
- Each member responds: Available / Unavailable / Maybe
- When consensus reached, viewing is scheduled

#### Inviting More Members
- Tap "Invite" on group card
- Modal shows available matches
- Select user(s) to invite
- System creates invitation
- Invited users get notification

#### Empty State
- Users icon (large)
- "No groups yet"
- "Create a group with your matches to find housing together!"
- "Create Your First Group" button

---

### 7. PROFILE TAB (Edit Profile)

Comprehensive profile management screen.

#### Profile Strength Indicator
**Calculated in real-time:**
- **Score components** (total 100%):
  - 3+ photos: 20%
  - Bio 60+ chars: 15%
  - University set: 10%
  - City set: 10%
  - Housing complete: 15%
  - Lifestyle complete: 15%
  - Preferences set: 15%
- **Visual bar**: Gradient fill from 0-100%
- **Action button**: "Do: [next action]" (e.g., "Add 2+ photos")
- **Hint text**: Shows next 2-3 suggested actions

#### Profile Header Section
- **Large profile photo** (120x120, circular)
- **Edit photo button**: Opens photo editor
- **Photo Editor Mode**:
  - Horizontal scroll of all photos
  - First photo has "PRIMARY" badge (main profile pic)
  - Tap photo → Make it primary (moves to front)
  - X button on each → Delete photo
  - + Button → Add more (up to 6)
  - Uses expo-image-picker for real photo upload
  - Cancel/Save buttons
- Name, age (calculated from birthdate)
- University name
- City, country

#### About Me Section
- **View mode**: Shows bio text
- **Edit button**: Opens edit mode
- **Edit mode**:
  - Multi-line TextInput (240 char limit)
  - Character counter: "120/240"
  - **AI Generate button** (Sparkles icon):
    - Calls `services/ai.ts → generateBio()`
    - Uses OpenAI with user data (hobbies, university, housing, lifestyle)
    - Generates personalized bio in <5 seconds
    - Auto-fills in textarea
  - Cancel/Save buttons
- Bio displayed as regular text when not editing

#### Basic Info Section
- Shows: University, City, Country, Job/Internship
- Nationalities (chips)
- Languages spoken (chips)
- Edit button → Navigates to onboarding step (`/onboarding/school-city?edit=1`)

#### Lifestyle Section
- **Interests**: Chips with hobby icons
  - Music → 🎵, Fitness → 💪, Cooking → 🍳, Gaming → 🎮, etc.
- **Sports & Hobbies**: Additional chips
- **Living Preferences Grid**:
  - Cleanliness: 😌 Chill / 🧹 Average / ✨ Meticulous
  - Sleep Schedule: 🌅 Early bird / 🔄 Flexible / 🦉 Night owl
  - Guests: 🚫 Never / 👥 Sometimes / 🎉 Often
  - Noise: 🤫 Low / 🔊 Medium / 🎵 High
- **Additional prefs** (rows):
  - Smoker: Yes/No
  - Pet-friendly: Yes/No
  - Religion (if opted to show)
  - Political view (if opted to show)
  - Money style
  - Food preference
  - Dietary restrictions
  - Series/Films favorites
  - Study year
- Edit button → `/onboarding/lifestyle?edit=1`

#### Badges Section
- Shows earned badges (if any):
  - "Verified Student" (if verified with .edu email)
  - "ID Verified" (if uploaded ID)
  - "Early Bird" (if early sleep schedule)
  - "Pet Lover" (if has pets)
  - "Non-smoker", etc.

#### Housing Details Section
- **Location**: City with map pin icon
- **Status**: "I have a room to share" or "Looking for a room"
- **For Room Owners**:
  - Neighborhood
  - X bed, Y bath
  - $X/month (bills included/not included)
  - Available from [date] until [date]
  - Property owner: Yes/No
  - Apartment description
  - Room photos (carousel)
- **For Room Seekers**:
  - Budget: $X - $Y/month
  - Preferred neighborhoods (chips)
  - Looking for: [move-in date] - [move-out date]
  - Additional preferences (text)
- Edit button → `/onboarding/housing?edit=1`

#### Matching Preferences Section
- **Grid display**:
  - Age Range: X - Y years
  - Max Distance: X km
  - Looking For: Roommate / Room / Either
- **Filters**:
  - City only: Yes/No
  - University only: Yes/No
  - Recommendation code: [code] (if set)
- **Deal-breakers**: Red chips with ❌
- **Must-haves**: Green chips with ✅
- Edit button → `/onboarding/preferences?edit=1`

#### Viewing Availability Section
- Shows current availability schedule
- Button: "Set Times" → Navigates to `/availability`
- Clock icon: "Set your availability for apartment viewings"

#### Account Section
**Saving & Syncing**
- **"Save my account"** button: Syncs profile to server (toast: "Account synced securely")

**Pause Profile**
- Toggle switch (ON/OFF)
- When ON:
  - User hidden from Discover feed
  - Cannot like anyone (only pass)
  - Banner shows in Discover: "⏸️ Profile paused"
- When OFF:
  - Back in feed
  - Can like again
- Toast messages on toggle

**Verify Profile**
- Button with shield icon: "Verify My Profile"
- Opens modal with 2 options:
  1. **Upload ID**: Opens camera/gallery for government ID
  2. **Upload Student Card**: Opens camera/gallery for student ID
- In demo, shows alert (production would process verification)
- Upon verification, adds "ID Verified" or "Verified Student" badge

**Match Message Settings**
- Button with sparkles icon: "Match Message"
- Opens modal:
  - Toggle: "Send automatic message" (ON/OFF)
  - If ON, TextInput for custom message (max 200 chars)
  - Default: "Hi! Nice to meet you 👋"
  - Save button
- This message auto-sends when new matches occur

**Social Links**
- If user added Instagram or LinkedIn URLs in onboarding:
  - Displays as clickable links
  - Tappable → Opens URL in browser

**Log Out**
- Red-bordered button: "Log Out"
- Confirmation alert: "Are you sure?"
- On confirm:
  - Clears user session
  - Navigates to `/signin`

#### GDPR Section (Bottom of screen, small)
- "Data & Privacy" title
- Two links:
  1. **"Export My Data"**: Downloads JSON of all user data
  2. **"Delete My Data"**: Confirmation → Deletes all user info (irreversible)

#### Secret Admin Access
- **7 rapid taps** on profile photo → Opens `/admin` panel
- Only for authorized users
- See Admin Features below

---

### 8. ADMIN PANEL (Secret)

**Accessed via 7 taps on profile photo.**

Located at `/admin.tsx`, shows:

#### User Management
- **User Directory**: List of all users
  - Search by name/email
  - Filter by city, university, verified status
- **User Actions**:
  - View full profile
  - Ban user (removes from all feeds)
  - Unban user
  - Verify user manually
  - Edit user profile
  - Delete user account

#### Analytics Dashboard
- **Stats**:
  - Total users
  - Total matches
  - Total messages
  - Active users (last 24h)
  - Match rate
  - Average compatibility score
- **Charts** (future):
  - User growth over time
  - Match distribution by city
  - Most popular universities

#### Feature Flags
- Toggle experimental features:
  - **Super Likes**: Enable/disable superlike feature
  - **Boosts**: Profile visibility boosts
  - **Loosen City Gate**: Show users from nearby cities even if cityOnly=true
  - **Demo Mode**: Show more matches with lower threshold

#### Moderation
- **Reports Queue**: List of user reports
  - View report details
  - Review reported content
  - Actions: Dismiss, Warn User, Ban User
- **Blocked Users**: List of all block relationships
  - Unblock manually if needed

#### System Tools
- **Refresh Feed**: Regenerate feeds for all users
- **Clear Cache**: Reset compatibility scores
- **Export Analytics**: Download CSV of user data (anonymized)
- **Send Notifications**: Bulk message to all users (future)

---

### 9. AUTHENTICATION & SIGN-IN

#### Sign Up (`app/signup.tsx`)
- Email input (validates format)
- Password input (min 8 chars)
- Confirm password (must match)
- "Sign Up" button → Creates account → Redirects to onboarding
- Link to sign in if already have account

#### Sign In (`app/signin.tsx`)
- Email input
- Password input
- "Sign In" button → Validates → Redirects to app
- "Forgot password?" link (future)
- Link to sign up if new user

#### Demo Mode
- App includes **5 pre-populated fake users** in `mocks/users.ts`:
  1. Emma Johnson (Berkeley, Psychology major, looking for room)
  2. Alex Chen (Stanford, CS major, has room to share)
  3. Sophia Martinez (UCLA, Art major, has cat, looking for room)
  4. Marcus Williams (NYU, Business major, social, looking for either)
  5. Lily Zhang (MIT, Engineering major, has room, studious)
- These appear in feeds for testing
- Can swipe, match, message with them

---

### 10. DATA SERVICES & STATE MANAGEMENT

#### Global State Store (`store/app-store.ts`, `store/useAppStore.ts`)
Uses **Zustand** for state:
```typescript
interface AppState {
  currentUser: User | null;
  feedUsers: FeedUser[];
  matches: Match[];
  messages: Record<string, Message[]>; // keyed by matchId
  swipeUser: (user: FeedUser, action: 'like' | 'pass' | 'superlike') => void;
  refreshFeed: () => void;
  sendMessage: (matchId: string, text: string) => void;
  updateCurrentUser: (user: User) => void;
  signOut: () => void;
  showMatchAnimation: boolean;
  matchedUserName: string;
  // ... more
}
```

Key functions:
- **`swipeUser()`**: Records swipe action, checks if match created, triggers animation
- **`refreshFeed()`**: Regenerates feed based on filters + compatibility
- **`sendMessage()`**: Adds message to chat, updates last message
- **`updateCurrentUser()`**: Updates profile, refreshes feed

#### Data Services (`services/data.ts`)
All CRUD operations for:
- Users: `getUsers()`, `getUserById()`, `createUser()`, `updateUser()`
- Matches: `getMatches()`, `createMatch()`, `getMatchesByUser()`
- Messages: `getMessagesByMatch()`, `createMessage()`
- Lifestyle: `getLifestyleByUserId()`, `updateLifestyle()`
- Housing: `getHousingByUserId()`, `updateHousing()`
- Preferences: `getPreferencesByUserId()`, `updatePreferences()`
- Swipes: `recordSwipe()`, `getSwipesByUser()`
- Groups: `getGroupMatches()`, `createGroupMatch()`
- Availability: `getAvailability()`, `updateAvailability()`

**In-memory database** for demo (arrays), but structured for easy PostgreSQL/Firebase migration.

#### AI Services (`services/ai.ts`)
**Uses OpenAI API** (or in demo, templates):
1. **`generateBio(userData)`**: Creates personalized bio
2. **`generateChatOpeners(currentUser, targetUser)`**: Creates 3 smart openers
3. **`analyzeImage(imageUri)`**: Content moderation (stub)
4. **`moderateText(text)`**: Checks for inappropriate content (stub)

#### Compatibility Service (`services/compatibility.ts`)
- **`computeCompatibility(input)`**: Main algorithm (explained above)
- **`getCompatibilityExplanation(score)`**: Text explanation for score
- **`shouldShowMatch(score, flags)`**: Decides if user shown in feed

#### Report & Safety (`services/report.ts`)
- **`recordReport(reporterId, reportedUserId, reason)`**: Logs report
- **`blockUser(userId, blockedUserId)`**: Adds to block list
- **`getReportsByUser()`**: For admin panel

#### GDPR Compliance (`services/gdpr.ts`)
- **`exportMyData(userId)`**: Returns JSON of all user data
- **`deleteMyData(userId)`**: Permanently removes user + all related data

---

### 11. DESIGN SYSTEM & THEMING

#### Colors (`constants/theme.ts`)
**Light Theme (Default):**
```typescript
{
  primary: '#8B7FFF',      // Lavender (brand color)
  secondary: '#2D2D3A',    // Dark gray
  background: '#F7F7FA',   // Off-white
  surface: '#FFFFFF',      // White
  textPrimary: '#2D2D3A',  // Dark gray
  textSecondary: '#8F8FA0', // Medium gray
  lavender: '#8B7FFF',     // Accent
  mint: '#B5EAD7',         // Success green-mint
  softLilac: '#E8E5FF',    // Light purple
  white: '#FFFFFF',
  danger: '#EF4444',       // Red
}
```

**Dark Theme Support:**
- Toggle available in settings (future)
- Uses `useTheme()` hook
- All colors inverted/adjusted for OLED screens

#### Spacing (`constants/theme.ts`)
```typescript
{
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}
```

#### Border Radius
```typescript
{
  small: 8,
  medium: 12,
  large: 16,
}
```

#### Components
All use **clay morphism style** (soft shadows, subtle gradients):

**ClayCard** (`components/ClayCard.tsx`)
- Rounded corners
- Soft shadow (elevation 2-4)
- White background
- Used for all content cards

**ClayButton** (`components/ClayButton.tsx`)
- Variants: primary (lavender), secondary (white), danger (red)
- Sizes: small, medium, large
- Disabled state (reduced opacity)
- Active press state (scale 0.98)

**UserCard** (`components/UserCard.tsx`)
- Full profile card for swipe screen
- Photo carousel
- Info overlay
- Compatibility badge
- Tap regions (card vs. compatibility)

**TopBar** (`components/TopBar.tsx`)
- Right-side header icons
- Settings, Activity, Store icons
- Badge notifications (red dot)

**BrandHeader** (`components/BrandHeader.tsx`)
- Flatly logo in header
- Consistent across all tabs

**BrandPattern** (`components/BrandPattern.tsx`)
- Subtle geometric pattern overlay
- Used as background in some screens

**MatchAnimation** (`components/MatchAnimation.tsx`)
- Full-screen modal
- Celebration animation
- User photos sliding together
- "IT'S A MATCH!" text

---

### 12. ROUTING & NAVIGATION

Uses **Expo Router** (file-based routing like Next.js).

#### Tab Navigation (`app/(tabs)/_layout.tsx`)
4 tabs at bottom:
1. **Discover** (`discover.tsx`): Heart icon
2. **Matches** (`matches.tsx`): Message icon
3. **Groups** (`groups.tsx`): Users icon
4. **Profile** (`profile.tsx`): User icon

Active tab = filled icon + lavender color
Headers have BrandHeader + TopBar

#### Stack Navigation
- **Onboarding Flow**: Linear progression through steps
  - Progress bar at top
  - Back/Next buttons
  - Can skip some steps (but completeness affects profile strength)
- **Chat Screen**: Modal presentation
  - Opens from Matches or Groups tab
  - Full-screen
  - Header with back button
- **Admin Panel**: Modal presentation
  - Opens from secret gesture
  - Full-screen

#### Deep Linking (Future)
- `/chat/:matchId` → Opens specific chat
- `/user/:userId` → Views user profile
- `/group/:groupId` → Opens group

---

### 13. PLATFORM SUPPORT (WEB + MOBILE)

#### React Native Web Compatibility
**Challenges handled:**
- **PanResponder**: Works on web with mouse drag
- **Image Picker**: Falls back to HTML `<input type="file">` on web
- **Haptics**: Disabled on web (no vibration)
- **SafeAreaView**: Auto-handled by tabs
- **Fonts**: Loaded via expo-font

#### Responsive Design
- **Mobile-first**: Optimized for 375px-428px width
- **Tablet support**: Scales up gracefully
- **Web**: Full-width on desktop, centered card layout

---

### 14. PERFORMANCE OPTIMIZATIONS

#### Memoization
- **React.memo()**: Used on UserCard, ClayCard, ClayButton
- **useMemo()**: Compatibility calculations, filtered lists
- **useCallback()**: Event handlers in lists

#### Image Optimization
- **expo-image**: Fast image rendering with caching
- **Image sizes**: 400x600 for profile photos, 600x400 for room photos
- **Lazy loading**: Images loaded as needed in carousels

#### List Virtualization
- **FlatList**: Used for all lists (matches, messages, groups)
- **windowSize**: Set to 10 for optimal performance
- **getItemLayout**: Specified for known item heights

---

### 15. TESTING & DEMO MODE

#### Test Data
- **5 fake users** in `mocks/users.ts`
- **150+ universities** in `mocks/universities.ts`
- **City neighborhoods** in `NEIGHBORHOODS_BY_CITY`

#### Demo Features
- All features work without backend
- Can swipe, match, message
- Simulated delays for realistic feel

---

## 🎨 USER EXPERIENCE FLOW

### First-Time User Journey
1. **Open app** → Sees sign-up screen
2. **Sign up** with email/password
3. **Onboarding**:
   - Enter name
   - Select university (auto-fills city)
   - Enter housing details
   - Set lifestyle preferences
   - Add interests
   - Upload photos
   - Set matching preferences
   - Review + generate AI bio
   - Complete profile
4. **Walkthrough** → Explains features
5. **Discover** → Sees first potential match (high compatibility)
6. **Swipe right** → Match! (if other user liked too)
7. **Chat opens** → Smart openers suggested
8. **Send message** → Conversation begins
9. **Coordinate viewing** → Share availability
10. **Meet in person** → Find perfect place together!

### Returning User Journey
1. **Open app** → Lands on Discover tab
2. **Swipe through** → See new matches
3. **Check Matches tab** → See new messages (unread badges)
4. **Reply to chats** → Continue conversations
5. **Manage profile** → Update photos, bio, or pause
6. **Create group** → Invite matches to find place together

---

## 🚀 KEY DIFFERENTIATORS

What makes Flatly unique:

1. **University-Focused**: Specifically for students, verified with .edu emails
2. **Dual Purpose**: Handles both "I have a room" and "I need a room" scenarios
3. **Advanced Compatibility**: 20+ factors with transparent explanations
4. **Group Coordination**: 2-5 people can search together
5. **Safety First**: Block, report, verification, safety tips
6. **AI-Powered**: Bio generation, smart openers, compatibility analysis
7. **Real Photos**: Users upload actual photos, not avatars
8. **Availability Sync**: Coordinate viewing times easily
9. **Cross-Platform**: Works on iOS, Android, and web
10. **Privacy Controls**: Pause profile, hide info, GDPR compliance

---

## 🔮 FUTURE ENHANCEMENTS (ROADMAP)

### Near-Term (Next 2-3 months)
- **Real-time messaging**: WebSockets for instant chat
- **Push notifications**: New matches, messages, viewing proposals
- **Video profiles**: 15-second intro videos
- **Voice messages**: Record and send audio
- **Map view**: See matches on map by location
- **Advanced filters**: More granular preference controls
- **Student verification**: Integrate with university APIs for .edu verification
- **Photo verification**: Selfie + ID comparison using AI

### Mid-Term (3-6 months)
- **Payment integration**: Premium features (boosts, unlimited swipes)
- **Room listings marketplace**: Searchable database of available rooms
- **Lease management**: E-signatures, split bills, rent tracking
- **Roommate agreements**: Templates and digital signing
- **Background checks**: Optional criminal + credit checks
- **Reviews & ratings**: Post-living feedback system

### Long-Term (6-12 months)
- **International expansion**: More countries and universities
- **Language localization**: Support 10+ languages
- **Desktop app**: Electron version for laptop use
- **Landlord accounts**: Separate mode for property owners
- **Community features**: Events, forums, city guides
- **Move-in services**: Partner with moving companies, furniture rental

---

## 📊 METRICS & KPIs

To measure success:
- **User growth**: New signups per week
- **Match rate**: % of users who get matches
- **Response rate**: % of matches that lead to messages
- **Conversion rate**: % of users who find housing through Flatly
- **Engagement**: Daily/monthly active users
- **Retention**: 7-day, 30-day retention rates
- **Compatibility accuracy**: User feedback on match quality
- **Safety reports**: Number and resolution time

---

## 🏁 CONCLUSION

**Flatly** is a comprehensive, feature-rich roommate-finding platform that combines:
- Tinder-style discovery
- Advanced AI compatibility
- Rich profile creation
- 1-on-1 and group messaging
- Viewing coordination
- Safety & moderation
- Beautiful mobile-native design

Every question in onboarding counts toward compatibility. The university selection automatically populates the city. Neighborhoods are city-specific. The compatibility algorithm is transparent and explainable. Users can pause their profile anytime. Groups can coordinate viewings together. AI helps with bios and conversation starters. Real photos are supported.

The app is ready for production with minor backend integration (replace mock data with PostgreSQL/Firebase + WebSockets for real-time features).

---

## 📝 IMPLEMENTATION NOTES FOR DEVELOPERS

When building features, remember:
1. **Every onboarding question counts** in compatibility scoring
2. **City auto-fills from university** selection
3. **Neighborhoods are city-specific**
4. **Compatibility is bidirectional** (same for both users)
5. **Match animation triggers on mutual like**
6. **Groups support 2-5 members max**
7. **Paused profiles are hidden from feed**
8. **Profile strength affects match visibility**
9. **AI features have fallbacks** (templates if API fails)
10. **All lists use FlatList** for performance

---

*This comprehensive guide covers 100% of Flatly's features, flows, and architecture. Use it to explain the app to any developer, designer, or stakeholder.*
