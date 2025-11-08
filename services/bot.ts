import { mockUsers } from '@/mocks/users';
import { 
  getUsers, 
  createUser, 
  getSwipes, 
  addSwipe, 
  likeUser,
  sendMessage,
  getCurrentUserId,
  getMatchesByUser,
  getMessagesByMatch
} from '@/services/data';
import { User } from '@/types';

const BOT_MESSAGES = [
  "Hey! Just saw your profile and we seem to have a lot in common!",
  "Hi! I really like your bio. Would love to chat about finding a place together!",
  "Hey there! Your place looks great. Would you be interested in connecting?",
  "Hi! I'm also looking for a roommate. Want to meet up for coffee?",
  "Your profile caught my attention! Let's chat about our preferences.",
  "Hey! Seems like we have similar lifestyles. Would be great to connect!",
  "Hi! I love your vibe. Let's see if we're a good match!",
  "Hey there! Your room listing looks perfect. Let me know if you'd like to chat!",
  "Hi! Really interested in learning more about you. Coffee sometime?",
  "Your profile stood out to me! Would love to discuss housing options.",
];

const BOT_FOLLOW_UP_MESSAGES = [
  "That sounds perfect! When would you be available to meet?",
  "I totally agree! What's your ideal move-in date?",
  "Great! I'd love to see the place. Are you free this weekend?",
  "Awesome! Let's exchange numbers and chat more about details.",
  "Sounds like a plan! What time works best for you?",
  "Perfect! I'll message you later to set something up.",
  "That works for me! Looking forward to meeting you!",
  "Great to hear! Let me know what days work for you.",
  "Excellent! I'm excited about this. Let's stay in touch!",
  "Cool! I'll reach out soon to arrange a viewing.",
];

class BotService {
  private isRunning = false;
  private botUserIds: string[] = [];

  async initializeBots(): Promise<void> {
    console.log('Initializing bot service...');
    
    const existingUsers = await getUsers();
    const botUsers = mockUsers.filter(u => 
      !existingUsers.some(eu => eu.id === u.id)
    );
    
    for (const botUser of botUsers) {
      try {
        const transformedUser = this.transformMockUser(botUser);
        await createUser(transformedUser);
        this.botUserIds.push(botUser.id);
      } catch {
        console.log('Bot user already exists:', botUser.id);
      }
    }
    
    console.log(`Initialized ${this.botUserIds.length} bot users`);
  }

  async startBotActivity(): Promise<void> {
    if (this.isRunning) {
      console.log('Bot service already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Starting bot activity...');
    
    await this.initializeBots();
    
    setTimeout(() => this.performBotActivity(), 3000);
    
    setInterval(() => {
      if (this.isRunning) {
        this.performBotActivity();
      }
    }, 30000);
  }

  stopBotActivity(): void {
    this.isRunning = false;
    console.log('Bot activity stopped');
  }

  private async performBotActivity(): Promise<void> {
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        console.log('No current user, skipping bot activity');
        return;
      }

      const random = Math.random();
      
      if (random < 0.3) {
        await this.botLikeUser(currentUserId);
      } else if (random < 0.6) {
        await this.botSendMessage(currentUserId);
      }
    } catch (error) {
      console.error('Bot activity error:', error);
    }
  }

  private async botLikeUser(targetUserId: string): Promise<void> {
    const swipes = await getSwipes();
    const availableBots = this.botUserIds.filter(botId => {
      return !swipes.some(s => s.swiperId === botId && s.targetId === targetUserId);
    });

    if (availableBots.length === 0) {
      console.log('No available bots to like user');
      return;
    }

    const botId = availableBots[Math.floor(Math.random() * availableBots.length)];
    
    try {
      const match = await likeUser(botId, targetUserId);
      
      if (match) {
        console.log(`Bot ${botId} matched with user ${targetUserId}!`);
        
        setTimeout(async () => {
          await this.sendBotMessage(match.id, botId);
        }, 2000 + Math.random() * 3000);
      } else {
        console.log(`Bot ${botId} liked user ${targetUserId}`);
      }
    } catch (error) {
      console.error('Bot like error:', error);
    }
  }

  private async botSendMessage(currentUserId: string): Promise<void> {
    const matches = await getMatchesByUser(currentUserId);
    
    if (matches.length === 0) {
      console.log('No matches to send messages to');
      return;
    }

    const matchesWithBots = matches.filter(m => 
      m.users.some(uid => this.botUserIds.includes(uid))
    );

    if (matchesWithBots.length === 0) {
      console.log('No bot matches found');
      return;
    }

    const match = matchesWithBots[Math.floor(Math.random() * matchesWithBots.length)];
    const botId = match.users.find(uid => this.botUserIds.includes(uid));
    
    if (!botId) return;

    const messages = await getMessagesByMatch(match.id);
    const recentBotMessage = messages
      .filter(m => m.senderId === botId)
      .slice(-1)[0];

    if (recentBotMessage) {
      const timeSinceLastMessage = Date.now() - new Date(recentBotMessage.createdAt).getTime();
      if (timeSinceLastMessage < 60000) {
        console.log('Bot sent message recently, skipping');
        return;
      }
    }

    await this.sendBotMessage(match.id, botId, messages.length > 0);
  }

  private async sendBotMessage(
    matchId: string, 
    botId: string, 
    isFollowUp: boolean = false
  ): Promise<void> {
    const messagePool = isFollowUp ? BOT_FOLLOW_UP_MESSAGES : BOT_MESSAGES;
    const messageBody = messagePool[Math.floor(Math.random() * messagePool.length)];

    try {
      await sendMessage({
        matchId,
        senderId: botId,
        body: messageBody,
      });
      
      console.log(`Bot ${botId} sent message: ${messageBody}`);
    } catch (error) {
      console.error('Send bot message error:', error);
    }
  }

  async createBotLikes(userId: string, count: number = 3): Promise<void> {
    console.log(`Creating ${count} bot likes for user ${userId}...`);
    
    await this.initializeBots();
    
    const swipes = await getSwipes();
    const availableBots = this.botUserIds.filter(botId => {
      return !swipes.some(s => s.swiperId === botId && s.targetId === userId);
    });

    const botsToLike = availableBots
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, availableBots.length));

    for (const botId of botsToLike) {
      try {
        await addSwipe({
          swiperId: botId,
          targetId: userId,
          action: 'like',
          createdAt: new Date().toISOString(),
        });
        
        console.log(`Bot ${botId} liked user ${userId}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error creating bot like from ${botId}:`, error);
      }
    }
  }

  async createInstantMatch(userId: string): Promise<void> {
    console.log(`Creating instant match for user ${userId}...`);
    
    await this.initializeBots();
    
    const swipes = await getSwipes();
    const availableBots = this.botUserIds.filter(botId => {
      return !swipes.some(s => 
        (s.swiperId === botId && s.targetId === userId) ||
        (s.swiperId === userId && s.targetId === botId)
      );
    });

    if (availableBots.length === 0) {
      console.log('No available bots for instant match');
      return;
    }

    const botId = availableBots[Math.floor(Math.random() * availableBots.length)];
    
    try {
      await addSwipe({
        swiperId: botId,
        targetId: userId,
        action: 'like',
        createdAt: new Date().toISOString(),
      });
      
      const match = await likeUser(userId, botId);
      
      if (match) {
        console.log(`Instant match created between ${userId} and ${botId}!`);
        
        setTimeout(async () => {
          await this.sendBotMessage(match.id, botId);
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating instant match:', error);
    }
  }
  
  getBotUserIds(): string[] {
    return [...this.botUserIds];
  }
  
  isBotUser(userId: string): boolean {
    return this.botUserIds.includes(userId);
  }

  private transformMockUser(mockUser: any): Omit<User, 'id' | 'createdAt'> {
    const age = new Date().getFullYear() - new Date(mockUser.birthdate).getFullYear();
    
    return {
      email: mockUser.email,
      phone: mockUser.phone,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      birthdate: mockUser.birthdate,
      age,
      gender: mockUser.gender,
      university: mockUser.universitySchool || 'Unknown University',
      city: mockUser.city,
      country: 'USA',
      geo: mockUser.preferredNeighborhoods && mockUser.city === 'Berkeley' 
        ? { lat: 37.8719, lng: -122.2585 }
        : mockUser.city === 'Palo Alto'
        ? { lat: 37.4419, lng: -122.1430 }
        : mockUser.city === 'Los Angeles'
        ? { lat: 34.0522, lng: -118.2437 }
        : mockUser.city === 'New York'
        ? { lat: 40.7128, lng: -74.0060 }
        : mockUser.city === 'Cambridge'
        ? { lat: 42.3736, lng: -71.1097 }
        : { lat: 0, lng: 0 },
      hasRoom: mockUser.hasPlace || false,
      shortBio: mockUser.shortBio,
      photos: mockUser.photos || [],
      videoIntroUrl: mockUser.videoIntroUrl,
      voiceIntroUrl: mockUser.voiceIntroUrl,
      igUrl: mockUser.igUrl,
      linkedinUrl: mockUser.linkedinUrl,
      tiktokUrl: mockUser.tiktokUrl,
      badges: ['Verified Student', 'Demo User'],
      isDemo: true,
      paused: false,
      walkthroughSeen: true,
    };
  }
}

export const botService = new BotService();

export async function seedDemoBots(): Promise<void> {
  await botService.initializeBots();
}

export async function startBots(): Promise<void> {
  await botService.startBotActivity();
}

export function stopBots(): void {
  botService.stopBotActivity();
}

export async function createBotLikesForUser(userId: string, count?: number): Promise<void> {
  await botService.createBotLikes(userId, count);
}

export async function createInstantMatchForUser(userId: string): Promise<void> {
  await botService.createInstantMatch(userId);
}

export function isBotUser(userId: string): boolean {
  return botService.isBotUser(userId);
}
