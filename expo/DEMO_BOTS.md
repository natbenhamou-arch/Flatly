# Demo Bot System

This document describes the automated bot system that makes the app more interactive for investor demos.

## What Are Demo Bots?

Demo bots are fake user profiles that automatically interact with real users to create a more engaging demonstration experience. They:

- **Like your profile** to create matches
- **Send messages** when matched
- **Respond to messages** periodically
- Simulate real user behavior

## Features

### 1. Automatic Bot Profiles

The system creates 10 diverse bot profiles with:
- Real-looking photos from Unsplash
- Diverse backgrounds (different universities, cities, majors)
- Complete profiles (bio, lifestyle, preferences)
- Different personalities and interests

### 2. Bot Behavior

**Liking:**
- Bots automatically like user profiles
- 2 bot likes are created when a user first enters the discover screen
- Random bots continue to like users periodically

**Matching:**
- When a user likes a bot that already liked them, an instant match is created
- Match animation plays just like with real users

**Messaging:**
- Bots send a friendly first message 2-5 seconds after matching
- Bots can send follow-up messages if the conversation continues
- Messages are varied and contextual

### 3. Bot Management

The bot service runs automatically in the background and:
- Initializes on app start
- Runs periodic activities every 30 seconds
- Never interferes with real user interactions

## Usage

### For Demos

The bots activate automatically when you:
1. Complete onboarding
2. Enter the discover screen
3. Start swiping on profiles

You don't need to do anything - bots will automatically:
- Show up in your feed
- Like your profile
- Match with you when you like them back
- Send you messages

### Manual Bot Control (Optional)

If you want to manually trigger bot actions, you can use these functions in your code:

```typescript
import { 
  createBotLikesForUser, 
  createInstantMatchForUser,
  startBots,
  stopBots 
} from '@/services/bot';

// Create multiple bot likes for a user
await createBotLikesForUser(userId, 5); // 5 bots will like this user

// Create an instant match
await createInstantMatchForUser(userId); // Instant match + message

// Start bot activity (runs automatically)
await startBots();

// Stop bot activity
stopBots();
```

## Bot Profiles

The system includes 10 diverse demo users:

1. **Emma Johnson** - Psychology major, Berkeley, hiking & cooking
2. **Alex Chen** - CS major, Stanford, gaming & coding  
3. **Sophia Martinez** - Art student, UCLA, creative & beach lover
4. **Marcus Williams** - Business major, NYU, social & adventurous
5. **Lily Zhang** - Engineering, MIT, quiet & studious
6. **Maya Patel** - Pre-med, Columbia, yoga & healthy living
7. **Diego Santos** - Film student, UCLA, creative filmmaker
8. **Sarah Kim** - Fashion design, NYU, stylish & social
9. **James Brown** - Robotics, MIT, tech innovator
10. **Jessica Taylor** - Environmental science, Berkeley, eco-conscious

Each bot has complete profiles with photos, bios, lifestyle preferences, and housing details.

## Technical Details

### Bot Service Architecture

- **Location:** `/services/bot.ts`
- **Initialization:** Automatic on app start
- **Activity Loop:** Runs every 30 seconds
- **Message Pool:** 10 initial messages + 10 follow-up messages

### Integration Points

1. **Discover Screen** (`app/(tabs)/discover.tsx`)
   - Starts bot service on mount
   - Creates initial bot likes

2. **Data Service** (`services/data.ts`)
   - Bots use the same data layer as real users
   - All interactions are stored in AsyncStorage

3. **App Store** (`store/app-store.ts`)  
   - Bots trigger the same actions as real users
   - Match animations work identically

## Benefits for Investor Demos

✅ **Instant activity** - No need to create multiple test accounts  
✅ **Realistic interactions** - Bots behave like real users  
✅ **Continuous engagement** - Always something happening in the app  
✅ **Complete flow demonstration** - Show matching, messaging, full experience  
✅ **No setup required** - Works out of the box  

## Customization

You can customize bot behavior by editing:

- **Bot messages:** Update `BOT_MESSAGES` and `BOT_FOLLOW_UP_MESSAGES` arrays in `services/bot.ts`
- **Bot profiles:** Modify `mocks/users.ts` to change bot characteristics
- **Activity frequency:** Adjust the interval in `startBotActivity()` method
- **Number of initial likes:** Change the count in discover screen's `useEffect`

## Notes

- Bots are marked with `isDemo: true` in their user profile
- All bot data is stored locally (AsyncStorage)
- Bots work without internet connection
- Bot activity stops when you call `stopBots()`
