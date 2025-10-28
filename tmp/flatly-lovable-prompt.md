# Flatly – Complete App Recreation Prompt for Lovable

## 1️⃣ App Overview & Concept

**App Name:** Flatly

**Purpose:** A mobile-first matchmaking platform that helps university students, Erasmus students, and young professionals find compatible roommates within their verified communities BEFORE searching for housing together. Unlike traditional housing platforms that focus on property listings, Flatly matches people first based on deep compatibility.

**Core Problem Solved:**
- Students struggle to find trustworthy, compatible flatmates in new cities
- Limited housing availability makes coordination essential
- Existing tools focus on listings, not on people-to-people matching
- Safety concerns when moving with strangers

**Target Users:**
- University students (domestic and international)
- Erasmus/exchange students
- Young professionals relocating to new cities
- People aged 18-30 looking for shared accommodation

**Key Differentiator:** Flatly uses a sophisticated compatibility algorithm (70+ factors) combining location verification, lifestyle preferences, housing needs, personality traits, and shared interests to create high-quality matches.

---

## 2️⃣ Account System & Authentication

### Sign-Up / Sign-In Flow

**Welcome Screen (/):**
- Display the Flatly logo (two people sitting on a couch icon, minimalist side profile silhouette)
- Brand name "flatly" in lowercase, bold typography
- Tagline: "Find your perfect roommate"
- Background: Clean white with subtle geometric patterns (optional light blue accent shapes)

**Authentication Options:**
1. Sign up with Apple (Apple OAuth - redirects to real Apple authentication)
2. Sign up with Google (Google OAuth - redirects to real Google authentication)
3. Sign up with Email (traditional email/password form)
4. "Already have an account? Sign In" link at bottom

**Sign-In Screen (/signin):**
- Email and password fields
- "Forgot password?" link
- Sign-in button
- Social sign-in options (Apple, Google)
- Link back to sign-up

**Sign-Up Screen (/signup):**
- If email selected: email, password, confirm password
- Terms of service checkbox
- Privacy policy checkbox
- Submit button redirects to onboarding

**Account Creation Rules:**
- Must verify email before accessing app
- Once email verified, automatically launch onboarding
- Store user authentication state
- Redirect authenticated users to appropriate screen (onboarding if incomplete, discover feed if complete)

---

## 3️⃣ Complete Onboarding Experience

The onboarding is **multi-step** and **essential** for the compatibility algorithm. Each answer feeds into the matching score.

### Onboarding Step 0: Welcome Screen
**Route:** `/onboarding/`
- Full-screen dark gradient background (#0B1220 to #0E1B3A)
- Flatly logo (large, centered, with text)
- Tagline: "Find your perfect roommate"
- Big "Get Started" button at bottom
- This is the gateway to the full onboarding process

### Onboarding Step 1: Full Name
**Route:** `/onboarding/full-name`
**Fields:**
- Full name input (single text field)
- Helper text: "We'll only show your first name and the initial of your last name publicly (e.g., Nathaniel B.)"
- Validates that at least first name is entered
- Splits into firstName and lastName on backend
- Continue button

### Onboarding Step 2: School & City
**Route:** `/onboarding/school-city`
**Fields:**
1. **University (Optional):**
   - Searchable autocomplete dropdown
   - Database: Global top 500 universities + extended database
   - Toggle: "Top-500 only" filter
   - Each university shows: name, city, country
   - Selected university auto-fills city field
   
2. **City (Required):**
   - Searchable autocomplete using OpenStreetMap Nominatim API
   - Returns: city name, country, latitude, longitude
   - Visual confirmation: "✓ Paris, France"
   - Stores geolocation for distance calculations

3. **Job/Occupation:**
   - Free text input
   - Examples: "Student", "Software Engineer", "Marketing Intern"

**Design:**
- Clean card-based layout
- Dropdown results shown as list with subtle shadows
- Info banner: "💡 We only show you potential roommates from the same city for safety"
- Continue button (disabled until city selected)

### Onboarding Step 3: Housing Status
**Route:** `/onboarding/housing`
**Primary Toggle:**
- 🔍 **Looking for a room** (default)
- 🏠 **I have a room to fill**

#### If "Looking for a room":
- **Budget Range:**
  - Min budget (numeric input)
  - Max budget (numeric input)
  - Currency dropdown (USD, EUR, GBP, etc. - 50+ currencies)
  
- **Preferred Neighborhoods:**
  - Display neighborhood chips based on city (pre-loaded list)
  - Multi-select chips (can select multiple)
  - "Other" option with custom text input for unlisted neighborhoods
  
- **When do you need the room? (Optional):**
  - From date (text input: "Sept 1, 2024")
  - Until date (text input: "Aug 31, 2025")
  - Calendar icon next to input
  
- **Additional Preferences (Optional):**
  - Free text area
  - Example: "Close to campus, quiet area preferred"

#### If "I have a room to fill":
- **Neighborhood:**
  - Chip selection or custom input
  
- **Apartment Description (Optional):**
  - Multiline text area
  - Example: "Large bright room, shared kitchen"
  
- **Room Details:**
  - Bedrooms (numeric)
  - Bathrooms (numeric)
  
- **Monthly Rent (Optional):**
  - Rent amount (numeric)
  - Currency dropdown
  
- **Toggles:**
  - Bills included in rent (switch)
  - I am the owner/landlord (switch)
  
- **Availability:**
  - Available from (text input with calendar icon)
  - Available until (text input, optional)

**Design:**
- Toggle buttons styled as large cards with icons
- Active state: blue border + light blue background
- Inactive: white background + gray border
- All inputs have rounded corners, soft shadows

### Onboarding Step 4: Interests & Hobbies
**Route:** `/onboarding/interests`
**Fields:**
1. **Hobbies:**
   - Multi-select tags/chips
   - Categories: music, fitness, cooking, gaming, books, films, photography, cycling, hiking, yoga, fashion, tech, startups, volunteering, travel, languages, pets, plants, board games
   - Option to add custom hobby (text input + "Add" button)
   - Select at least 3 hobbies

2. **Sports:**
   - Similar multi-select chip system
   - Examples: Football, Basketball, Tennis, Swimming, Gym, Yoga, Running, etc.
   - Custom input available

**Design:**
- Chips arranged in rows, wrap to next line
- Selected chips: solid blue background, white text
- Unselected: light gray background, dark text
- Add custom button at end of list

### Onboarding Step 5: Lifestyle Preferences
**Route:** `/onboarding/lifestyle`

**Interactive Sliders (0-10 scale) with Dynamic Emojis:**

1. **Cleanliness:**
   - Slider from "Chill" (😅) to "Meticulous" (✨)
   - Emoji changes based on value:
     - 0-2: 😅 Chill
     - 3-4: 🧹
     - 5-6: 🧼
     - 7-8: 🧽
     - 9-10: ✨ Meticulous
   - Rounded slider track with fill color
   - Draggable thumb with emoji inside
   - Numeric value displayed in floating bubble above thumb

2. **Sleep Rhythm:**
   - Slider from "Early bird" (🌅) to "Night owl" (🌃)
   - Emoji progression:
     - 0-2: 🌅 Early bird
     - 3-4: 😴
     - 5-6: 🌙
     - 7-8: 🦉
     - 9-10: 🌃 Night owl

3. **Guests:**
   - Slider from "Never" (🙅‍♂️) to "Often" (🎉)
   - Emoji progression:
     - 0-2: 🙅‍♂️ Never
     - 3-4: 🙂
     - 5-6: 👥
     - 7-8: 🎈
     - 9-10: 🎉 Often

4. **Noise Tolerance:**
   - Slider from "Low" (🤫) to "High" (🔊)
   - Emoji progression:
     - 0-2: 🤫 Quiet
     - 3-4: 🎧
     - 5-6: 🙂
     - 7-8: 📣
     - 9-10: 🔊 Loud

**Slider Design Requirements:**
- Track height: 16px
- Track background: light surface color with border
- Fill color: gradient blue (gets darker as value increases)
- Thumb: 28px circle, white background, blue border, emoji centered
- Shadow on track and thumb for depth
- Smooth drag interaction with PanResponder equivalent
- Value bubble floats above thumb showing numeric value

**Binary Toggles (Switches):**
- 🚬 I smoke (yes/no switch)
- 🐕 I'm okay with pets (yes/no switch)

**Cooking Habits (Multiple Choice):**
Question: "What are your cooking habits like?"
Options:
- 🍳 Love cooking elaborate meals
- 🥗 Simple meals
- 🍕 Mostly takeout/delivery

**Food Preference Pills:**
- 🥩 Omnivore (red/orange)
- 🥬 Vegetarian (green)
- 🌱 Vegan (blue)
- ☪️ Halal (yellow)
- ✡️ Kosher (purple)
- 🤔 Other (pink)

Each pill has background color that becomes solid when selected, translucent when not selected.

### Onboarding Step 6: Vibe & Values
**Route:** `/onboarding/vibe`

**Fields:**

1. **Languages Spoken:**
   - Multi-select tags with flags
   - Common languages with flag emojis
   - Examples: 🇬🇧 English, 🇪🇸 Spanish, 🇫🇷 French, 🇩🇪 German, etc.
   - Custom language input option
   - Select at least 1 language

2. **Nationalities:**
   - Multi-select with flag emojis
   - Can select multiple nationalities
   - Custom input available

3. **Political View (Optional):**
   - Slider with percentage (0-100)
     - 0 = Progressive (left)
     - 50 = Centrist
     - 100 = Conservative (right)
   - Alternative: Discrete options (Progressive / Centrist / Conservative / Ecological / Apolitical)
   - Toggle: "Show on my profile" (default: OFF for privacy)
   - Colored indicator based on selection

4. **Religious Values (Optional):**
   - Options:
     - Yes, important to me
     - No, not important
     - Prefer not to say
   - If "Yes": text input for specific religion
   - Toggle: "Show on my profile" (default: OFF for privacy)

5. **Money Management Style:**
   - Three options:
     - 💰 Meticulous tracker
     - ⚖️ Balanced approach
     - 🎈 Relaxed/spontaneous

6. **Series & Films:**
   - Free text area
   - Examples: "Game of Thrones, Breaking Bad, Marvel movies"

**Design:**
- Privacy emphasized: lock icons next to sensitive fields
- Show/hide toggles clearly visible
- Sliders follow same design as lifestyle sliders
- Pills and chips consistent throughout

### Onboarding Step 7: Photos & Media
**Route:** `/onboarding/media`

**Photo Upload:**
- Minimum 2 photos required
- Maximum 6 photos
- Drag-and-drop reorder
- First photo is profile picture (clearly labeled)
- Image picker integration
- Preview grid layout (2 columns)
- Delete button on each photo (X icon)

**Optional Media:**
- Video intro (30-60 seconds)
- Voice note intro (30-60 seconds)

**Social Links (Optional):**
- Instagram URL (text input with @ icon)
- LinkedIn URL (text input with LinkedIn icon)
- TikTok URL (text input with TikTok icon)

**Design:**
- Card-based upload zones with dashed borders
- Plus icon to add photos
- Grid preview with rounded corners

### Onboarding Step 8: Preferences & Filters
**Route:** `/onboarding/preferences`

**Matching Preferences:**

1. **Age Range:**
   - Min age slider (18-40)
   - Max age slider (18-40)

2. **Maximum Distance:**
   - Slider (1-50 km)
   - Shows numeric value

3. **What are you looking for?**
   - Roommate to find a place together
   - A room in an existing place
   - Either

4. **Deal-breakers:**
   - Multi-select tags
   - Examples: Smoking, Late-night parties, Loud music, Poor cleanliness, etc.
   - Custom input

5. **Must-haves:**
   - Multi-select tags
   - Examples: Pet-friendly, Close to public transport, Gym nearby, Fast WiFi, etc.
   - Custom input

6. **Nice-to-haves:**
   - Multi-select tags
   - Similar to must-haves but lower priority

**Filters:**
- City only (toggle)
- Same university filter (toggle)
- Same language filter (toggle)

**Design:**
- Sliders consistent with previous steps
- Tags/chips in accent colors
- Clear visual separation between sections

### Onboarding Step 9: Review & Create Profile
**Route:** `/onboarding/review-create`

**Summary Screen:**
- Display all collected information in organized sections:
  - Personal Info
  - Housing Needs
  - Interests
  - Lifestyle
  - Vibe & Values
  - Photos
  - Preferences

**Edit Buttons:**
- Small "Edit" link next to each section
- Takes user back to that specific step

**Short Bio Input:**
- Character limit: 500
- Example: "Psychology major who loves hiking and cooking! Looking for a clean, friendly roommate to share adventures with 🌟"

**Auto-Match Message (Optional):**
- Text input for custom greeting sent automatically on match
- Default: "Hi! Nice to meet you 👋"
- Toggle: "Send auto-match message" (default: ON)

**Recommendation Code (Optional):**
- Text input for entering code (if provided by university/organization)
- Helper text: "Have a code from your university or sports club? Enter it here to match within your verified community"

**Final Actions:**
- "Find a Roommate" button (primary, large, blue)
- Terms & Privacy checkbox (must accept)

**What Happens After:**
- Profile is created
- User is redirected to main app (/(tabs)/discover)
- Walkthrough modal appears on first app launch

---

## 4️⃣ Main In-App Features

### Navigation Structure

**Tab Bar Navigation (Bottom):**
1. **Discover** (Home icon)
2. **Matches** (Message icon with badge for unread)
3. **Groups** (Users icon)
4. **Profile** (User icon)

Each tab has its own stack navigation for nested screens.

---

### Discover Tab (/(tabs)/discover)

**Main Screen:**
- **Header:**
  - Flatly logo (small, centered)
  - Settings icon (right side)
  
- **Card Stack:**
  - Display one user card at a time
  - Next card slightly visible behind (scaled down 95%, opacity 80%)
  - Cards are swipeable

**User Card Design:**
- Full-screen card with rounded corners
- Primary photo as background (cover image)
- Gradient overlay at bottom for text readability
- **Visible Info on Card:**
  - First name + Last initial, Age (e.g., "Emma J., 21")
  - University name
  - Compatibility badge in top-right corner (e.g., "85% match" in blue pill)
  - Short bio snippet (first 2 lines)
  - Distance from user (e.g., "2 km away")
  - Housing status badge ("Has room" or "Looking for room")

**Tap Card for Full Profile:**
When user taps the card, open **ProfileDetailModal** (full-screen modal):
- Photo carousel (swipeable)
- Full name, age, university, city
- Complete "About Me" section with full bio
- Housing section:
  - If has room: neighborhood, bedrooms, bathrooms, rent, availability, description
  - If looking: budget range, preferred neighborhoods, move-in timeline
- Lifestyle section:
  - Visual indicators for sliders (emoji + level)
  - Smoking status, pet preference
  - Cooking habits, food preference
- Interests section:
  - Hobby chips (read-only display)
  - Sports, languages, nationalities
- Vibe section (if visible):
  - Political view indicator
  - Religious values
  - Money style
  - Series & films
- Social links (clickable):
  - Instagram, LinkedIn, TikTok icons
- Compatibility breakdown button (opens CompatibilityModal)

**Compatibility Tap:**
Opens **CompatibilityModal** showing:
- Large compatibility score (e.g., "85%")
- Color gradient from red (low) to green (high)
- Top 3 compatibility reasons with icons:
  - 📍 Both in Berkeley
  - 🎓 Both at UC Berkeley
  - 🗣️ You both speak English and Spanish
- Explanation text: "Great compatibility with shared interests"

**Swipe Actions:**
- **Swipe Right / Press Heart Button = Like**
  - Card flies off to the right
  - Check for mutual match
  - If match: trigger MatchAnimation, add to Matches
- **Swipe Left / Press X Button = Pass**
  - Card flies off to the left
  - Move to next card

**Action Buttons (Bottom):**
- Large rounded pill buttons with gradients
- **X Button (Left):**
  - Gray/black gradient
  - Icon: X
  - Action: Pass
- **Heart Button (Right):**
  - Blue gradient (#0F6BFF to #0A3FF0)
  - Icon: Heart (filled)
  - Action: Like
- Button states:
  - Normal: full opacity, shadow
  - Pressed: slight scale down (0.98)
  - Disabled (if profile paused): reduced opacity (60%)

**Paused Profile Banner:**
When user has paused their profile:
- Red gradient banner at top: "⏸️ Profile paused — You are hidden from Discover"
- Like button is disabled
- Pass still works (to clear feed)

**Empty State:**
- Icon: search illustration or emoji
- Title: "No new roommates nearby"
- Subtitle: "Expand your city or preferences to find more"
- Refresh button

**Match Animation:**
When a mutual like occurs:
- Full-screen modal with confetti animation
- "It's a Match!" text
- Both users' photos side by side
- Message: "You and [Name] liked each other!"
- "Send a Message" button (opens chat)
- "Keep Swiping" button (closes modal)

**Walkthrough (First Time Only):**
Multi-step modal overlay explaining:
1. Swipe to decide (left/right, lightning for super like)
2. Tap card to see full profile
3. Compatibility score shows how well you match
4. Create groups to coordinate apartments together
5. Manage profile in Profile tab
Each slide has:
- Icon
- Title
- Body text
- "Next" button
- Page dots indicator
Last slide: "Got it" button to dismiss

---

### Matches Tab (/(tabs)/matches)

**Header:**
- Title: "Matches"
- Subtitle: "[X] matches • New messages" (if unread exist)

**Match List:**
Each match card displays:
- **Avatar:**
  - Circular profile photo
  - Unread badge (red circle with count) if unread messages
  
- **Match Info:**
  - Name, age (e.g., "Alex C., 22")
  - University (smaller text)
  - Last message preview (2 lines max)
    - Bold if unread
    - Gray if read
  - Timestamp (e.g., "2h ago", "Just now")
  
- **Compatibility Badge:**
  - Small blue pill with percentage (e.g., "78%")
  
- **More Button:**
  - Three dots icon (kebab menu)

**Card Design:**
- White background with soft shadow
- Rounded corners
- Tap to open chat

**Empty State:**
- Icon: message bubble illustration
- Title: "No matches yet"
- Subtitle: "Keep swiping to find your perfect roommate match!"

**Match Card Tap:**
Navigate to `/chat/[matchId]`

---

### Groups Tab (/(tabs)/groups)

**Header:**
- Title: "Groups"
- Subtitle: "Find roommates together with 2-5 people"
- + FAB (Floating Action Button) in bottom-right corner

**Group Cards:**
Each group displays:
- **Group Name** (e.g., "Emma's Group", "Berkeley Roomies")
- **Member Count** (e.g., "4 members")
- **Compatibility Score** (e.g., "82% group compatibility")
- **Member Avatars:**
  - Overlapping circles (first 4 members)
  - "+N" indicator if more than 4 members
- **Action Buttons:**
  - "Propose Times" (calendar icon)
  - "Invite" (user-plus icon)

**Card Design:**
- White card with rounded corners, shadow
- Blue accent for compatibility badge
- Tap card to open group chat

**Create Group Modal:**
Triggered by + FAB:
- **Modal Header:**
  - "Create Group" title
  - X button to close
  - ✓ button to confirm
  
- **Group Name Input:**
  - Text field
  - Placeholder: "Enter group name..."
  
- **Select Matches to Invite:**
  - List of user's current matches
  - Each row: avatar, name, university
  - Checkboxes (multi-select)
  - Selected items highlighted
  
- **Create Button:**
  - Disabled until name + at least 1 match selected
  - On create: send invitations, navigate to group chat

**Empty State:**
- Icon: users illustration
- Title: "No groups yet"
- Subtitle: "Create a group with your matches to find housing together!"
- "Create Your First Group" button

---

### Profile Tab (/(tabs)/profile)

**Profile Header:**
- Large profile photo (circular or full-width banner)
- First name, age
- University, city
- "Edit Profile" button

**Profile Sections:**
1. **About Me:**
   - Bio text
   - Badges (Verified Student, ID Verified, etc.)

2. **Housing:**
   - Current status (Has room / Looking for room)
   - Details based on status
   - "Edit" button → `/onboarding/housing?edit=1`

3. **Lifestyle:**
   - Visual slider indicators (non-interactive)
   - Toggles (smoking, pets)
   - "Edit" button → `/onboarding/lifestyle?edit=1`

4. **Interests:**
   - Hobby chips (non-interactive)
   - Sports, languages, nationalities
   - "Edit" button → `/onboarding/interests?edit=1`

5. **Vibe & Values:**
   - Political view (if visible)
   - Religious values (if visible)
   - Money style
   - Series & films
   - "Edit" button → `/onboarding/vibe?edit=1`

6. **Photos & Media:**
   - Photo grid (editable)
   - Add/remove/reorder photos
   - Video intro, voice intro (if present)
   - "Edit" button → `/onboarding/media?edit=1`

7. **Preferences:**
   - Age range, distance, filters
   - Deal-breakers, must-haves
   - "Edit" button → `/onboarding/preferences?edit=1`

**Profile Controls:**
- **Pause Profile Toggle:**
  - Switch with zen emoji (😌)
  - Label: "Pause Profile"
  - Helper text: "You will be hidden from Discover and can't send likes"
  - When ON: profile is invisible, likes disabled

- **Activity Button:**
  - View profile views, likes received, match history

- **Settings Button:**
  - Navigate to `/settings/`
  - Includes: Notifications, Privacy, Support, Account

**Settings Submenu (/ settings/):**
- Notifications (push, email preferences)
- Privacy (who can see your info)
- Support (contact, FAQs)
- Account (change password, delete account)
- Privacy Policy & Terms links
- GDPR Data Export button
- Sign Out button (red, at bottom)

**Profile Store Page (/store):**
- Boost profile feature (premium)
- Super likes bundle (premium)
- Remove ads (premium)
- Placeholder for future monetization

---

### Chat Screen (/chat/[matchId])

**Header:**
- **1-on-1 Chat:**
  - Other user's photo (small, circular)
  - Name, age
  - University
  - Tap header → opens ProfileDetailModal
  
- **Group Chat:**
  - Group name
  - Member count (e.g., "4 members")
  - Tap header → shows member list modal
  
- **Header Actions (Right):**
  - Calendar icon (propose viewing times)
  - Users icon (add to group / create group from 1-on-1)
  - Three dots (More menu)

**Messages List:**
- Messages in bubbles
- **Current User Messages:**
  - Right-aligned
  - Blue background (#2563EB)
  - White text
  - Rounded corners (more rounded on left)
  
- **Other User Messages:**
  - Left-aligned
  - Light gray background (#F5F7FB)
  - Dark text
  - Rounded corners (more rounded on right)
  
- **Timestamp:**
  - Small gray text below each message

**Message Types:**
- Text messages
- Photo messages (inline preview, tap to enlarge)
- System messages (e.g., "Group created", "Viewing times proposed")

**Safety Banner (Top, Dismissible):**
- Shield icon
- Text: "Safety tip: Never send money or deposits before viewing the place"
- X button to dismiss
- Light blue background

**Smart Openers (First Message Only):**
- Lightbulb icon + "Smart Openers" title
- AI-generated conversation starters based on compatibility:
  - Example: "I saw you love hiking! Have you checked out the trails near Berkeley?"
  - Example: "What's your favorite thing about being a psychology major?"
- Tap to insert into input field
- "Generate" button if none loaded yet
- Disappears after first message sent

**Input Area (Bottom):**
- **Image Button (Left):**
  - Camera/image icon
  - Opens image picker
  - Uploads photo to chat
  
- **Text Input:**
  - Multiline, auto-expanding (up to 3 lines)
  - Placeholder: "Type a message..."
  - Character limit: 500
  
- **Smart Openers Button:**
  - Lightbulb icon
  - Shows smart openers card
  - Only visible in 1-on-1 before first message
  
- **Propose Times Button (Group Only):**
  - Calendar icon
  - Proposes AI-generated viewing times
  
- **Send Button:**
  - Paper plane icon
  - Blue when text present
  - Gray when empty
  - Pressing when empty shows toast: "Type a message first"

**More Menu (Three Dots):**
Options:
- Report (flag icon)
  - Opens modal: text area for reason
  - Submit button
  - Records report, alerts moderation team
  
- Block (shield icon, red text)
  - Confirmation dialog: "Are you sure you want to block this user?"
  - If confirmed: user is blocked, chat hidden, won't appear in feed again

**Propose Viewing Times Flow:**
1. User taps "Propose Times" button
2. AI generates 3-5 suggested times based on group availability
3. Modal shows suggested times with locations (default: "TBD")
4. User can edit times/locations
5. "Propose" button sends times to group
6. System message in chat: "📅 Viewing times proposed: [times]"
7. Group members can respond with availability

**Group Creation from 1-on-1:**
1. User taps Users icon in header
2. Modal: "Create a group"
3. Shows list of other matches from same city
4. User selects one person to add
5. Checkmark appears next to selected person
6. "Create" button
7. New group is created, both users added
8. Redirect to new group chat

**Image Viewer:**
Tap photo in chat → full-screen modal:
- Black background
- Image centered, zoomable
- Tap outside to close

---

## 5️⃣ Data Structure & Logic

### Core Data Models

**User Object:**
```
{
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  birthdate: string (ISO date)
  age: number (calculated)
  gender?: string
  university: string
  city: string
  country: string
  geo: { lat: number, lng: number }
  hasRoom: boolean
  shortBio: string
  photos: string[] (1-6 URLs)
  videoIntroUrl?: string
  voiceIntroUrl?: string
  igUrl?: string
  linkedinUrl?: string
  tiktokUrl?: string
  createdAt: string (ISO timestamp)
  badges: string[]
  paused: boolean (default: false)
  walkthroughSeen: boolean (default: false)
  autoMatchMessage?: string
  sendAutoMatchMessage: boolean (default: true)
  recommendationCode?: string
}
```

**Lifestyle Object:**
```
{
  userId: string
  hobbies: string[]
  // Categorical (backward compatibility)
  cleanliness: 'chill' | 'avg' | 'meticulous'
  sleep: 'early' | 'flex' | 'night'
  guests: 'never' | 'sometimes' | 'often'
  noise: 'low' | 'med' | 'high'
  // Numeric sliders (0-10)
  cleanlinessScore: number
  sleepRhythmScore: number
  guestsScore: number
  noiseLevelScore: number
  smoker: boolean
  petsHave: string[]
  petsOk: boolean
  religion?: string
  showReligion: boolean (default: false)
  dietary: string[]
  studyProgramYear: string
  jobOrInternship: string
  showGender: boolean (default: true)
  politicalView?: 'conservative' | 'progressive' | 'centrist' | 'ecological' | 'apolitical'
  politicsPercent?: number (0-100)
  showPoliticalView: boolean (default: false)
  religiousChoice?: 'yes' | 'no' | 'prefer_not'
  moneyStyle?: 'meticulous' | 'balanced' | 'loose'
  foodPreference?: 'omnivore' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'other'
  foodOther?: string
  sportsHobbies: string[]
  seriesFilms: string
  languages: string[]
  nationalities: string[]
}
```

**Housing Object:**
```
{
  userId: string
  hasRoom: boolean
  // If has room:
  neighborhood?: string
  bedrooms?: number
  bathrooms?: number
  rent?: number
  currency?: string
  billsIncluded?: boolean
  availableFrom?: string
  availableTo?: string
  isOwner?: boolean
  apartmentDescription?: string
  roomPhotos?: string[]
  // If looking for room:
  budgetMin?: number
  budgetMax?: number
  targetNeighborhoods: string[]
  preferencesText?: string
  wantedFrom?: string
  wantedTo?: string
}
```

**Preferences Object:**
```
{
  userId: string
  ageMin: number (default: 18)
  ageMax: number (default: 30)
  cityOnly: boolean (default: true)
  universityFilter: boolean (default: false)
  maxDistanceKm: number (default: 10)
  lookingFor: 'roommate' | 'room' | 'either'
  dealbreakers: string[]
  mustHaves: string[]
  niceToHaves: string[]
  quizAnswers: Record<string, any>
  languageMatchOnly: boolean (default: false)
  useRecommendationCode: boolean (default: false)
}
```

**Swipe Object:**
```
{
  swiperId: string (User ID who swiped)
  targetId: string (User ID who was swiped)
  action: 'like' | 'pass' | 'superlike'
  createdAt: string (ISO timestamp)
}
```

**Match Object:**
```
{
  id: string
  users: string[] (2-5 User IDs)
  createdAt: string
  blocked: boolean (default: false)
  groupName?: string (if group match)
}
```

**Message Object:**
```
{
  id: string
  matchId: string
  senderId: string (User ID)
  body: string
  imageUrl?: string
  createdAt: string (ISO timestamp)
  readAt?: string (ISO timestamp)
}
```

**CompatibilityResult Object:**
```
{
  score: number (0-100)
  reasons: string[] (top 3 reasons)
}
```

### Compatibility Algorithm (70+ Factors)

**Scoring System (0-100 points total):**

**PRIMARY FACTORS (60 points):**
1. **Same City (+25 points):**
   - Exact match required for safety
   - Reason: "📍 Both in [City]"

2. **University Match (+20 points):**
   - Same university = full points
   - Reason: "🎓 Both at [University]"

3. **Language Compatibility (+25 points):**
   - At least 1 shared language
   - Calculated using Jaccard similarity of language sets
   - Reason: "🗣️ You both speak [Language] and [Language]"

**SECONDARY FACTORS (25 points):**
4. **Cleanliness Proximity (+8 points):**
   - Compare cleanlinessScore (0-10)
   - Score = 8 * (1 - abs(diff) / 10)
   - Closer scores = higher points
   - Reason: "✨ Similar cleanliness expectations"

5. **Sleep Rhythm Proximity (+8 points):**
   - Compare sleepRhythmScore (0-10)
   - Same calculation as cleanliness
   - Reason: "😴 Compatible sleep rhythm"

6. **Noise Tolerance Proximity (+9 points):**
   - Compare noiseLevelScore (0-10)
   - Same calculation method
   - Reason: "🔉 Similar noise tolerance"

7. **Budget Fit (+8 points):**
   - Case A: One has room, other needs room
     - Check if rent fits within budget range
     - Score based on how well it fits (center of range = max points)
   - Case B: Both looking for rooms
     - Calculate budget overlap
     - Score based on overlap size
   - Reason: "💸 Budget matches perfectly" or "💸 Similar budget range"

**TERTIARY FACTORS (15 points):**
8. **Hobbies Overlap (+5 points):**
   - Jaccard similarity of hobby sets
   - Score = 5 * (intersection / union)
   - Reason: "🎯 Share [N] hobbies" or "🎯 Both enjoy [Hobby] & [Hobby]"

9. **Food Preference (+3 points):**
   - Exact match on foodPreference
   - Reason: "🍽️ Both [vegetarian/vegan/etc.]"

10. **Political Alignment (+2 points):**
    - Only if both users show political view
    - Exact match on politicalView
    - Reason: "🗳️ Similar political views"

11. **Religion Match (+3 points):**
    - Only if both users show religion
    - Exact match on religion field
    - Reason: "🙏 Share religious values"

12. **Smoking Compatibility (+2 points):**
    - Both smoker = true OR both false
    - Reason: "🚬 Both smoke" or "🚭 Both non-smokers"

13. **Pet Compatibility (+2 points):**
    - Both petsOk = same value
    - Reason: "🐾 Both pet-friendly" or "🚫🐾 Both prefer no pets"

14. **Guest Frequency Proximity (+2 points):**
    - Compare guestsScore (0-10)
    - Same calculation as sliders
    - Reason: "🎉 Similar social habits"

15. **Move-in Date Alignment (+2 points):**
    - Compare availableFrom / wantedFrom dates
    - Score based on days difference (max points if within 30 days)
    - Reason: "📅 Similar move-in dates"

**PENALTIES:**
- Blocked user: -10 points
- Previously passed: -10 points

**Final Score:**
- Sum all applicable points
- Clamp to 0-100 range
- Round to integer

**Compatibility Explanation Text:**
- 85+: "Excellent match! You have a lot in common."
- 70-84: "Great compatibility with shared interests."
- 55-69: "Good potential match worth exploring."
- 40-54: "Some compatibility, could work out."
- <40: "Limited compatibility, but you never know!"

**Matching Rules:**
- **Production Mode:** Only show users with score ≥ 40
- **Demo Mode:** Show users with score ≥ 25 (more lenient for testing)

**Feed Algorithm:**
1. Filter users:
   - Same city (required)
   - Within age range (from preferences)
   - Within max distance (from preferences)
   - Not blocked
   - Not previously passed (or passed long ago)
   - University filter (if enabled in preferences)
   - Language filter (if enabled)
   - Recommendation code filter (if enabled)

2. Calculate compatibility for each user

3. Sort by compatibility score (descending)

4. Return top 20-50 users

5. Refresh feed periodically or on user request

---

## 6️⃣ Design System & Branding

### Color Palette

**Primary Colors:**
- Primary Blue: `#2563EB`
- Primary Dark Blue: `#1D4ED8`
- Secondary Dark: `#121829`
- Accent Blue: `#3B82F6`

**Gradients:**
- Blue Gradient: `['#2563EB', '#3B82F6']`
- Light Blue Gradient: `['#60A5FA', '#3B82F6']`
- Navy Gradient: `['#121829', '#0E1525']`
- Sky Gradient: `['#93C5FD', '#60A5FA']`

**Text Colors:**
- Primary Text: `#121829`
- Secondary Text: `#667085`
- Light Text: `#98A2B3`

**Surface Colors:**
- Background: `#F5F7FB` (light off-white)
- Surface: `#FFFFFF` (white cards)
- Border: `#E6EAF2` (light gray borders)

**Status Colors:**
- Success: `#10B981` (green)
- Danger: `#EF4444` (red)
- Warning: `#F5A524` (orange)
- Info: `#2563EB` (blue)

### Typography

**Font Family:**
- Primary: Montserrat (Regular, SemiBold, Bold)
- Fallback: System UI fonts

**Font Sizes:**
- H1: 32px (Page titles)
- H2: 28px (Section titles)
- H3: 24px (Subsection titles)
- H4: 20px (Card titles)
- Body Large: 17px (Important body text)
- Body: 16px (Regular text)
- Small: 14px (Helper text)
- Tiny: 12px (Captions, timestamps)

**Font Weights:**
- Regular: 400
- SemiBold: 600
- Bold: 700

**Line Heights:**
- Tight: 1.2 (headings)
- Normal: 1.5 (body)
- Relaxed: 1.75 (long paragraphs)

### Shadows & Elevation

**Card Shadow:**
- iOS: shadow with offset (0, 8), opacity 0.06, radius 20
- Android: elevation 6
- Color: `#121829`

**Button Shadow:**
- iOS: shadow with offset (0, 4), opacity 0.18, radius 12
- Android: elevation 4
- Color: `#2563EB` (for primary buttons)

**Floating Shadow:**
- iOS: shadow with offset (0, 12), opacity 0.08, radius 24
- Android: elevation 8
- Used for modals, FABs

**Soft Shadow:**
- iOS: shadow with offset (0, 2), opacity 0.05, radius 8
- Android: elevation 2
- Used for subtle borders

### Border Radius

- XS: 8px
- Small: 12px
- Medium: 16px (default)
- Large: 20px (cards, buttons)
- XL: 24px
- XXL: 32px
- Round: 999px (pills, circles)

### Spacing

- XS: 4px
- SM: 8px
- MD: 16px (default)
- LG: 24px
- XL: 32px
- XXL: 48px

### Components

**Buttons:**
- Primary: Blue gradient background, white text, rounded 25px, shadow
- Secondary: White background, blue text, border, rounded 25px
- Danger: Red gradient background, white text, rounded 25px
- Ghost: Transparent background, blue text, no border

**Pills/Chips:**
- Small rounded rectangles (borderRadius 20px)
- Background color changes on selection
- Used for tags, categories, options

**Cards:**
- White background
- Rounded corners (16-20px)
- Soft shadow
- Padding: 16px

**Sliders:**
- Track: 16px height, rounded ends
- Fill: Gradient blue, opacity increases with value
- Thumb: 28px circle, white background, blue border, emoji inside
- Value bubble: floating above thumb, blue background, white text

**Modals:**
- Full-screen or centered based on content
- White background
- Rounded corners (top corners if bottom sheet)
- Overlay: semi-transparent black (rgba(0, 0, 0, 0.5))

**Inputs:**
- Background: light surface color
- Border: 1-2px solid border color (invisible by default, visible on focus)
- Border radius: 12-16px
- Padding: 16px horizontal, 14-16px vertical
- Font size: 16px
- Placeholder: light gray text

### Iconography

**Icon Set:** Lucide React Native (or similar)
- Consistent stroke width (2px)
- Size options: 16px, 20px, 24px (most common)
- Colors: match text colors (primary, secondary, accent)

**Common Icons:**
- Home (house)
- Message (message-circle)
- Users (users)
- User (user)
- Heart (heart)
- X (x)
- Settings (settings)
- Calendar (calendar)
- Image (image)
- Send (send)
- Flag (flag)
- Shield (shield)
- Check (check)
- Plus (plus)
- More (more-vertical)
- Lightbulb (lightbulb)
- ChevronDown (chevron-down)

### Animations

**Transitions:**
- Default: 200-300ms ease-in-out
- Fast: 150ms (button press)
- Slow: 500ms (page transitions)

**Swipe Animations:**
- Card follows finger with spring physics
- Rotation based on horizontal distance
- Opacity decreases as card moves away
- Threshold: 30% of screen width for swipe

**Match Animation:**
- Confetti particles fall from top
- User photos slide in from sides
- "It's a Match!" text fades in
- Buttons slide up from bottom
- Total duration: ~2 seconds

**Micro-interactions:**
- Button press: scale down slightly (0.98)
- Card tap: subtle scale up (1.02) with shadow increase
- Toast notifications slide in from top or bottom
- Loading spinners: smooth rotation

### Accessibility

**Minimum Touch Targets:**
- 44x44px (iOS standard)

**Color Contrast:**
- Text on background: WCAG AA compliant (4.5:1 minimum)
- Important buttons: High contrast

**Focus States:**
- Visible focus indicators for keyboard navigation
- Blue outline on focused elements

**Screen Reader Support:**
- All buttons labeled
- Images have alt text
- Form inputs have accessible labels

---

## 7️⃣ Technical Implementation Notes

### State Management

- Use React Query for server state (user data, matches, messages)
- Use local state (useState) for UI state (modals, inputs)
- Use context for global app state (current user, theme)
- Use AsyncStorage for persistence (user session, settings)

### Data Storage

- Firebase Firestore (or similar NoSQL database)
- Collections:
  - users
  - lifestyles
  - housing
  - preferences
  - swipes
  - matches
  - messages
  - reports
  - groupInvitations
  - viewingProposals

### Real-time Updates

- Messages: real-time listener on messages collection filtered by matchId
- Matches: real-time listener on matches collection filtered by userId
- Typing indicators: ephemeral state, not stored

### Image Upload

- Use image picker library
- Upload to cloud storage (Firebase Storage, Cloudinary, etc.)
- Store URLs in database
- Resize/compress images before upload

### Authentication

- Firebase Auth or similar
- OAuth providers: Apple, Google
- Email/password authentication
- Session management with tokens
- Automatic sign-in on app launch if session valid

### Push Notifications

- New match notification
- New message notification
- Group invitation notification
- Viewing proposal notification

### API Integration

- OpenStreetMap Nominatim API for city search
- Geolocation API for distance calculations
- AI/OpenAI API for smart openers (optional)

### Performance Optimization

- Lazy load images
- Virtual scrolling for long lists
- Debounce search inputs
- Cache API responses
- Optimize slider interactions (use PanResponder equivalent)

### Error Handling

- Try-catch blocks around API calls
- User-friendly error messages
- Toast notifications for errors
- Retry mechanisms for failed operations
- Loading states for all async operations

### Testing Considerations

- Add testID props to key UI elements
- Mock data for development/testing
- E2E test scenarios:
  - Complete onboarding flow
  - Swipe and match
  - Send messages
  - Create groups
  - Edit profile

---

## 8️⃣ Monetization & Scalability (Placeholder Structure)

**Premium Features (Future):**
1. **Profile Boost:**
   - Increase visibility in feed for 30 minutes
   - Price: $4.99

2. **Super Likes:**
   - Bundle of 5 super likes
   - Price: $9.99
   - Notify recipient immediately, higher priority in feed

3. **Unlimited Swipes:**
   - Remove daily swipe limit
   - Price: $14.99/month subscription

4. **Advanced Filters:**
   - Filter by specific universities
   - Filter by neighborhoods
   - Filter by lifestyle factors
   - Price: included in subscription

5. **See Who Liked You:**
   - View all incoming likes before swiping
   - Price: included in subscription

**Backend Structure for Premium:**
- Store purchase status in user object
- Check premium status before allowing premium actions
- Integrate with Stripe/RevenueCat for payments

**B2B Licensing (Future):**
- Universities can license Flatly for their students
- Custom branding per university
- Exclusive communities with verification codes
- Admin panels for university staff

---

## 9️⃣ Final Deliverable Requirements

**This prompt is designed to recreate Flatly feature-for-feature on Lovable or similar no-code platforms.**

**What Must Be Preserved:**
✅ Entire onboarding flow (9 steps) with exact questions and sliders
✅ Compatibility algorithm with 70+ factors and weighted scoring
✅ Card-based discovery feed with swipe mechanics
✅ Real-time chat with smart openers
✅ Group creation and viewing time proposals
✅ Profile editing and pause functionality
✅ Safety features (report, block)
✅ Privacy controls for sensitive data
✅ Dark blue branding and minimalist design
✅ All data models and relationships

**What Can Be Simplified for No-Code:**
⚠️ Backend can use platform's built-in database
⚠️ Authentication can use platform's auth system
⚠️ Image uploads can use platform's file storage
⚠️ Animations can be simplified if too complex
⚠️ Premium features can be placeholder UI for now

**Key Success Criteria:**
1. User can complete full onboarding
2. Compatibility scores are calculated correctly
3. Matches work (mutual likes create match)
4. Chat is functional with photo support
5. Groups can be created and managed
6. Profile can be edited anytime
7. App works on both iOS and Android (via Expo/React Native)
8. Design matches Flatly branding (blue theme, clean, modern)

---

## 🎨 Visual Style Summary

**Mood:** Clean, modern, trustworthy, friendly
**Aesthetic:** Minimalist with subtle gradients and soft shadows
**Layout:** Card-based, mobile-optimized, generous spacing
**Colors:** Blue as primary, white backgrounds, dark text
**Typography:** Bold headings, readable body text, consistent weights
**Imagery:** User photos prominent, emojis for personality, icons for clarity

---

## 📝 Additional Notes

- All text should be professional yet friendly
- Use emojis sparingly for visual interest (mostly in user-generated content)
- Prioritize mobile experience over web
- Ensure all forms are easy to fill on small screens
- Use bottom sheets for mobile modals when appropriate
- Keep navigation intuitive with clear back/close buttons
- Show loading states during API calls
- Provide feedback for all user actions (toasts, confirmations)
- Maintain consistent spacing and alignment throughout
- Use progressive disclosure (show advanced options only when needed)

---

**End of Prompt**

This prompt captures the complete structure, functionality, design, and logic of Flatly. It is optimized for no-code platforms like Lovable that can generate React/React Native apps from detailed textual specifications. All existing features, workflows, data models, and design patterns have been preserved and documented in a clear, actionable format.
