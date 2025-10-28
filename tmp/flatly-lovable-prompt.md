# FLATLY - Complete App Prompt for Lovable

## Core Concept
Flatly is a roommate matching app for students and young professionals. Users create profiles, complete detailed onboarding, and find compatible roommates using AI-powered compatibility scoring. The app prioritizes personality and lifestyle matching before flat hunting.

---

## 1. DESIGN & BRANDING

### Color Palette
- **Primary (Lavender)**: #9b87f5 - Used for main actions, buttons, active states
- **Mint Green**: #7FD1AE - Used for success states, secondary accents
- **Baby Blue**: #89CFF0 - Used for info states
- **Peach**: #FFB088 - Used for warm accents
- **Soft Lilac**: #F2E9FF - Used for card backgrounds and input fields
- **Background**: #FAFAFA (light mode) / #1A1A1A (dark mode)
- **Text Primary**: #1F2937
- **Text Secondary**: #6B7280
- **White**: #FFFFFF
- **Danger**: #EF4444

### Design Style
- Modern minimalist mobile-first design
- Glassmorphism effects with soft shadows and transparency
- Consistent rounded corners (12-20px border radius)
- Premium aesthetic with clean spacing
- Smooth micro-interactions and animations
- Icons from lucide-react-native

---

## 2. AUTHENTICATION FLOW

### Sign Up Screen
- Email and password fields with validation
- Password requirements visible (8+ chars, uppercase, lowercase, number)
- "Create Account" button (lavender background)
- Link to sign in if user already has account
- Clean, minimalist design with logo at top

### Sign In Screen
- Email and password fields
- "Sign In" button (lavender)
- "Forgot Password" link
- Link to sign up for new users
- Remember me option

**Important**: After successful authentication, automatically launch onboarding flow for new users

---

## 3. COMPREHENSIVE ONBOARDING FLOW

The onboarding is the most critical part of Flatly. Each answer contributes to the AI compatibility algorithm.

### Progress Bar
- Show progress at top of each onboarding screen
- Visual indicator showing current step out of total steps
- Back button to navigate to previous screens

### Step 1: Full Name
- Input for first name and last name
- Clean design with large input fields
- "Next" button at bottom

### Step 2: Basic Info
- Birthdate picker (must be 18+)
- Gender selection (Male, Female, Non-binary, Prefer not to say)
- Age automatically calculated from birthdate

### Step 3: School & City
- **University**: Searchable dropdown with top 500+ universities worldwide
- **City**: Auto-complete city picker with geolocation option
- **Country**: Auto-filled based on city
- System should auto-detect user's city and suggest it

### Step 4: Housing Status
- Toggle: "Do you have a room?" (Yes/No)
- **If YES (Room Owner)**:
  - Neighborhood input
  - Number of bedrooms/bathrooms
  - Monthly rent amount
  - Currency selector
  - Bills included toggle
  - Available from/to date pickers
  - "Are you the owner?" toggle
  
- **If NO (Room Seeker)**:
  - Budget range slider (min-max)
  - Currency selector
  - Preferred neighborhoods (multi-select with option to add custom)
  - Move-in date preferences (from/to)

### Step 5: Lifestyle Preferences
Each preference uses SLIDERS with emoji indicators that change based on value:

- **Cleanliness** (0-10 scale):
  - 0-3: 😌 Chill
  - 4-7: 🧹 Average  
  - 8-10: ✨ Meticulous
  
- **Sleep Rhythm** (0-10 scale):
  - 0-3: 🌅 Early bird
  - 4-7: 🔄 Flexible
  - 8-10: 🦉 Night owl

- **Guest Frequency** (0-10 scale):
  - 0-3: 🚫 Never
  - 4-7: 👥 Sometimes
  - 8-10: 🎉 Often

- **Noise Tolerance** (0-10 scale):
  - 0-3: 🤫 Low
  - 4-7: 🔊 Medium
  - 8-10: 🎵 High

- **Smoking**: Toggle (Yes/No)
- **Pet-friendly**: Toggle (Yes/No)
- **Food Preference**: Dropdown (Omnivore, Vegetarian, Vegan, Halal, Kosher, Other)

### Step 6: Interests
- **Hobbies**: Multi-select with predefined options + "Add Custom" button
  - Predefined: Music, Reading, Gaming, Photography, Art, Fitness, Travel, Cooking, Coffee, Sports
- **Sports**: Multi-select with option to add custom
- **Languages**: Multi-select with flag icons, searchable list of world languages

### Step 7: Vibe & Values
- **Political View**: Dropdown (Left, Center-left, Center, Center-right, Right, Apolitical, Prefer not to say)
  - Toggle: "Show on profile" (default: hidden)
  - If shown, slider for "How important is this?" (0-100%)

- **Religion**: Dropdown (Christian, Muslim, Jewish, Hindu, Buddhist, Atheist, Agnostic, Other, Prefer not to say)
  - Toggle: "Show on profile" (default: hidden)

- **Religious Practice**: Dropdown (Very religious, Somewhat religious, Not very religious)

- **Money Style**: Dropdown (Saver, Balanced, Spender)

### Step 8: Media Preferences
- **Favorite Series/Films**: Text input
- **Music Taste**: Text input

### Step 9: Photos
- Upload 1-6 photos
- First photo is primary photo
- Drag to reorder photos
- Camera and gallery options
- Photo preview with edit/delete options
- **Make this work with real photo upload** from device camera or gallery

### Step 10: Bio
- 240 character text area
- Character counter visible
- "Generate with AI" button that creates bio based on all onboarding data
- Placeholder: "Tell potential roommates about yourself!"

### Step 11: Review & Create Account
- Show preview of how profile will appear to others
- Display all entered information in attractive card format
- Email input (with confirmation)
- Password input (with confirmation and requirements)
- "Create Account" button
- **IMPORTANT**: When "Create Account" is clicked:
  1. Validate all inputs
  2. Create user account
  3. **Save the complete profile to database**
  4. Mark onboarding as completed
  5. Redirect to main app (Discovery tab)

---

## 4. MAIN APP FEATURES

### Tab Navigation (Bottom)
4 main tabs:
1. **Discover** (🔥 icon)
2. **Matches** (💬 icon)
3. **Groups** (👥 icon)
4. **Profile** (👤 icon)

---

### DISCOVER TAB (Swipe Interface)

**Design**:
- Tinder-style card stack
- Large photo cards with gradient overlay at bottom
- User info on card: Name, Age, City, University
- Compatibility score badge in top right corner (circle with percentage)

**Card Actions**:
- Swipe left = Pass (❌)
- Swipe right = Like (💚)
- Tap card = View full profile with all details

**Profile Detail Modal** (when card tapped):
- Full scrollable profile
- All photos in carousel
- Complete bio
- Lifestyle preferences
- Hobbies with icons
- Housing details
- Compatibility breakdown showing:
  - Overall score (large, prominent)
  - Top 3 reasons for compatibility
  - Examples: "🗣️ You both speak English and French", "🎓 Both at UCLA", "📍 Both in Los Angeles"

**AI Compatibility Scoring**:
The algorithm calculates match percentage based on:
- **Primary factors (60 points)**:
  - Same city (25 points)
  - Same university (20 points)
  - Common languages (25 points)
- **Secondary factors (25 points)**:
  - Similar cleanliness levels (8 points)
  - Similar sleep schedules (8 points)
  - Similar noise tolerance (9 points)
- **Tertiary factors (15 points)**:
  - Hobby overlap (5 points)
  - Food compatibility (3 points)
  - Political alignment (2 points)
  - Religious match (3 points)
  - Smoking/pets compatibility (2 points each)

**Important**: Sort feed by compatibility score (highest first)

---

### MATCHES TAB

**Design**:
- List of matched users
- Each item shows:
  - Profile photo (circular, 50px)
  - Name and age
  - Last message preview
  - Timestamp
  - Unread indicator (blue dot)
- Tap to open chat

**Match Animation**:
When two users match:
- Full-screen animation appears
- "It's a Match!" text
- Both user photos displayed
- Confetti/sparkle animation
- "Send a Message" button
- Auto-sends greeting message if enabled in settings

**Generate Fake Matches**:
Create 5-10 fake matches with the demo users for testing
- Use the mock user data
- Generate 3-5 fake messages per match
- Mix of recent and older conversations
- Some matches with unread messages

---

### GROUPS TAB

**Purpose**: Create groups of 2-5 people to find housing together

**Design**:
- List of groups user is part of
- Each group card shows:
  - Group name
  - Member count
  - Group compatibility score (average of all pairs)
  - Overlapping profile photos of members
  - "Propose Viewing Times" button
  - "Invite More" button

**Empty State**:
- Icon and text: "No groups yet"
- "Create a group with your matches to find housing together!"
- "Create Your First Group" button

**Create Group Modal**:
- Input for group name
- List of user's matches (scrollable)
- Select 1-4 matches to invite
- "Create" button
- System sends invitations to selected users

**Generate Fake Groups**:
Create 2-3 fake groups for demo:
- Mix of 2-4 members each
- Realistic group names like "Berkeley Dream Team" or "UCLA Housing Squad"
- Show compatibility scores
- Include group chat with a few messages

---

### PROFILE TAB

**Profile Strength Indicator**:
- Progress bar at top showing completion percentage
- Calculated based on:
  - 3+ photos (20%)
  - Bio 60+ characters (15%)
  - University added (10%)
  - City added (10%)
  - Housing completed (15%)
  - Lifestyle completed (15%)
  - Preferences set (15%)
- Show next action to improve profile

**Profile Display**:
- Large circular profile photo (120px)
- Edit photo button (camera icon overlay)
- Name, age, location
- University

**Editable Sections** (all with "Edit" button):

1. **About Me**:
   - Bio text
   - Edit opens text area
   - "AI Generate" button to recreate bio
   - Character counter
   - Save/Cancel buttons

2. **Photos**:
   - Horizontal scrollable gallery
   - Add photo button (+ icon)
   - Remove photo (X icon on each)
   - Tap photo to set as primary
   - **Support real photo upload** from device

3. **Basic Info**:
   - University, City, Job
   - Nationalities as chips
   - Languages with flag icons
   - Edit opens onboarding screen

4. **Lifestyle**:
   - All lifestyle preferences displayed
   - Hobbies with icons
   - Living preferences in grid
   - Smoking, pets, diet, etc.
   - Edit opens onboarding screen

5. **Housing Details**:
   - Current housing situation
   - If has room: show details (neighborhood, rent, bedrooms)
   - If seeking: show budget and preferences
   - Edit opens onboarding screen

6. **Matching Preferences**:
   - Age range
   - Max distance
   - Looking for (room/roommate/either)
   - Filters applied
   - Deal-breakers as red chips
   - Must-haves as green chips
   - Edit opens onboarding screen

**Account Settings**:
- "Save my account" button (syncs data)
- "Pause profile" toggle with zen emoji
  - Hides profile from discovery when enabled
- "Verify My Profile" button
  - Opens modal to upload ID or student card
- "Match Message" settings
  - Toggle for auto-send greeting
  - Text input for custom greeting (200 char limit)
  - Default: "Hi! Nice to meet you 👋"

**Bottom Actions**:
- "Log Out" button

**Privacy Section** (small text at bottom):
- "Export My Data"
- "Delete My Data"

**IMPORTANT**: All profile edits must save to database and persist after refresh

---

### CHAT SCREEN (Individual)

**Header**:
- Other user's name and age
- Small circular profile photo
- Tap header to view full profile
- Menu button (⋮) with options:
  - Report
  - Block

**Safety Banner** (appears at top):
- Shield icon
- "Safety tip: Never send money or deposits before viewing the place."
- Dismissible (X button)

**Messages**:
- WhatsApp-style chat bubbles
- Own messages: lavender background, right-aligned
- Other messages: white background, left-aligned
- Timestamp below each message
- Support text messages
- **Support image sharing** (camera and gallery buttons)

**Smart Openers** (appears when no messages yet):
- Lightbulb icon
- "Smart Openers" section
- 3 AI-generated conversation starters based on compatibility
- Example: "I saw you're into hiking! What's your favorite trail in Berkeley?"
- Tap opener to pre-fill input
- Generate button if not loaded

**Input Area**:
- Image button (📷) - opens camera/gallery
- Text input (multi-line, 500 char max)
- Lightbulb button (shows/hides openers)
- Send button (changes color when text entered)

**Generate Fake Messages**:
For each fake match, create 3-5 realistic messages:
- Mix of both users
- Natural conversation about housing, interests, meetups
- Recent timestamps (today, yesterday)
- Some matches with last message from other user (unread)

**Actions Bar**:
- "Create Group" button - adds 3rd person to form group
- Shows candidates from user's matches
- Select one and create group

---

### CHAT SCREEN (Group)

**Header**:
- Group name
- Member count
- Tap to view member list
- Calendar icon - propose viewing times

**Group Safety Banner**:
- Shows all group member names in chips
- Same safety warning

**Messages**:
- Same as individual chat
- Each message shows sender name
- Different colors per sender

**Special Features**:
- "Propose Viewing Times" button
  - Analyzes all members' availability
  - Suggests 3 optimal times
  - Posts in chat for everyone
- Add more members button

**Generate Fake Group Messages**:
Create realistic group conversations:
- Members coordinating flat viewings
- Discussing budget splits
- Sharing apartment listings
- Planning meetup times
- 5-8 messages per group

---

## 5. COMPATIBILITY ALGORITHM (AI-POWERED)

**Critical Requirement**: The compatibility algorithm must use AI/LLM to analyze all onboarding data

**How It Works**:
1. When calculating compatibility between two users, send their complete profiles to AI
2. AI analyzes:
   - All lifestyle preferences and slider values
   - Housing needs and budget compatibility
   - Personality indicators (cleanliness, sleep, social habits)
   - Interests and hobby overlap
   - Language and cultural fit
   - Location and university match
   - Values alignment (if shown)
   - Every single onboarding answer

3. AI returns:
   - Compatibility score (0-100)
   - Top 3 specific reasons for the score
   - Explanation of potential conflicts or synergies

**Prompt for AI**:
```
Analyze compatibility between these two potential roommates.
User A: [all profile data]
User B: [all profile data]

Consider:
- Location and university match
- Budget alignment
- Lifestyle habits (cleanliness, sleep, noise, guests)
- Shared interests and hobbies
- Language compatibility
- Values and personality fit
- Housing needs match

Return JSON:
{
  "score": 75,
  "reasons": [
    "🎓 Both study at UCLA",
    "🗣️ Both speak English and Spanish",
    "✨ Similar cleanliness expectations"
  ],
  "explanation": "Strong match overall..."
}
```

**Display**:
- Show percentage prominently on profile cards
- Display top 3 reasons in profile modal
- Use emojis to make reasons visual and engaging

---

## 6. FAKE DATA GENERATION

**Create 15-20 Fake Users** covering:
- Different cities (NYC, LA, London, Paris, Berlin, Barcelona)
- Various universities
- Mix of genders and ages (18-30)
- Diverse interests and lifestyles
- Different housing situations (half have rooms, half seeking)
- Range of budgets
- Different cleanliness/sleep/social levels
- Variety of hobbies and languages
- **Real-looking photos** from image services (use different faces)

**Each Fake User Must Have**:
- 2-4 realistic photos
- Complete profile with all onboarding data filled
- Realistic bio (100-200 chars)
- Appropriate compatibility with current user
- Data that makes sense together (e.g., student at UCLA lives in LA)

**Fake Matches** (5-10 total):
- Select users with 60%+ compatibility
- Generate 3-5 messages per match
- Natural conversations about housing
- Mix of recent (today) and older (days ago) chats
- Some with unread messages from other user

**Fake Groups** (2-3 groups):
- Groups of 3-4 people
- Members from same city
- Appropriate group names
- 5-8 messages per group
- Coordination about flat hunting
- Show member avatars overlapping

**Data Persistence**:
All fake data should persist across app restarts and work as if real users

---

## 7. TECHNICAL REQUIREMENTS

### Data Storage
- Use Lovable's database
- Store users, matches, messages, groups
- Persist profile edits
- Save match status and chat history

### Real Photo Upload
**Critical**: Users must be able to:
- Take photos with device camera
- Select from photo gallery
- Upload and display real images
- Not just placeholder URLs

### Profile Saving
After onboarding completes:
- Save ALL form data to database
- Create user account
- Set onboarding_completed = true
- Load user data when app restarts

### State Management
- Current user profile
- Match list
- Message lists per chat
- Feed of potential matches
- All app settings

### Responsive Design
- Mobile-first (320px - 768px)
- Works on iOS and Android
- Smooth scrolling and animations
- Touch-friendly buttons (min 44px)

---

## 8. KEY FEATURES SUMMARY

✅ Complete authentication (sign up, sign in, password)
✅ 11-step onboarding with all questions
✅ Sliders with dynamic emoji indicators
✅ AI-powered compatibility using LLM
✅ Swipe interface (Tinder-style)
✅ Profile editing (all sections)
✅ Real photo upload from camera/gallery
✅ Individual chat with messages and images
✅ Group chats with multiple members
✅ Smart AI openers for conversations
✅ Match animation with confetti
✅ Fake users with realistic data (15-20 users)
✅ Fake matches with messages (5-10 matches)
✅ Fake groups with chats (2-3 groups)
✅ Profile strength indicator
✅ Report and block functionality
✅ Safety warnings in chats
✅ Auto-send match greetings
✅ Viewing time coordination
✅ Match message customization

---

## 9. FINAL CHECKLIST

Before considering Flatly complete, ensure:

- [ ] Onboarding saves profile to database
- [ ] Profile persists after app restart
- [ ] All profile sections can be edited
- [ ] Photos can be uploaded from device
- [ ] Photos display correctly throughout app
- [ ] Compatibility scores show on all profile cards
- [ ] AI calculates compatibility using all onboarding data
- [ ] Swipe left/right works and updates feed
- [ ] Match animation plays when users match
- [ ] 15-20 fake users created with complete profiles
- [ ] 5-10 fake matches with realistic conversations
- [ ] 2-3 fake groups with member chats
- [ ] Chats support text and images
- [ ] Smart openers generate based on profiles
- [ ] Groups can be created from matches
- [ ] Profile strength shows accurate percentage
- [ ] All navigation works (tabs, back buttons)
- [ ] Settings persist (pause profile, match message)
- [ ] Report and block functionality works
- [ ] App is responsive on mobile screens
- [ ] Dark blue/lavender theme applied consistently

---

## COLOR CODES FOR REFERENCE

```css
--lavender: #9b87f5
--mint: #7FD1AE  
--baby-blue: #89CFF0
--peach: #FFB088
--soft-lilac: #F2E9FF
--background: #FAFAFA
--white: #FFFFFF
--text-primary: #1F2937
--text-secondary: #6B7280
--danger: #EF4444
```

---

**This is the complete specification for Flatly. Every feature, screen, and interaction is documented. Build this exactly as specified, ensuring all onboarding data is used for AI compatibility scoring, profile data persists, and users can upload real photos.**
