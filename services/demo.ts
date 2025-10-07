import { 
  getUsers, 
  getUserById, 
  seedDemoUsers, 
  sendMessage,
  getMatchesByUser,
  likeUser,
  createGroupMatch,
  updateUser,
  getMessagesByMatch
} from '@/services/data';
import { Message, Match, User } from '@/types';
import { router } from 'expo-router';

export async function setupDemoWorld(currentUserId: string): Promise<{
  ensuredMatch: Match | null;
  targetUser: User | null;
}> {
  console.log('Demo bootstrap: start for', currentUserId);
  try {
    const currentUser = await getUserById(currentUserId);
    if (!currentUser) throw new Error('Current user not found');

    const allUsers = await getUsers();
    let cityUsers = allUsers.filter(u => u.city === currentUser.city && u.id !== currentUserId && u.isDemo === true);
    console.log(`Demo bootstrap: found ${cityUsers.length} demo users in ${currentUser.city}`);

    if (cityUsers.length < 15) {
      console.log('Demo bootstrap: seeding more demo users...');
      if (currentUser.city === 'Paris') {
        await seedDemoUsers({ parisCount: 20, londonCount: 0 });
      } else if (currentUser.city === 'London') {
        await seedDemoUsers({ parisCount: 0, londonCount: 20 });
      } else {
        await seedDemoUsers({ parisCount: 20, londonCount: 0 });
        const allAfterSeed = await getUsers();
        const seeded = allAfterSeed.filter(u => u.isDemo && u.city !== currentUser.city && u.id !== currentUserId);
        let updated = 0;
        for (const u of seeded.slice(0, 20)) {
          await updateUser(u.id, { city: currentUser.city, geo: currentUser.geo });
          updated++;
        }
        console.log(`Demo bootstrap: updated ${updated} users to city ${currentUser.city}`);
      }
      cityUsers = (await getUsers()).filter(u => u.city === currentUser.city && u.id !== currentUserId && u.isDemo === true);
    }

    const compatibleUsers = cityUsers.filter(u => u.photos && u.photos.length > 0);
    if (compatibleUsers.length === 0) {
      console.log('Demo bootstrap: no compatible demo users found after seed');
      return { ensuredMatch: null, targetUser: null };
    }
    let targetUser = compatibleUsers.find(u => u.university === currentUser.university) || compatibleUsers[0];

    const existingMatches = await getMatchesByUser(currentUserId);
    let match = existingMatches.find(m => m.users.includes(targetUser.id)) || null;

    if (!match) {
      console.log('Demo bootstrap: creating mutual likes...');
      match = await likeUser(currentUserId, targetUser.id);
      if (!match) match = await likeUser(targetUser.id, currentUserId);
    }

    if (match) {
      await createDemoConversation(match.id, currentUserId, targetUser.id, targetUser.firstName);
      await ensureGroupWithExtraUser(currentUserId, targetUser.id, currentUser.city);
    }

    console.log('Demo bootstrap: done', { matchId: match?.id });
    return { ensuredMatch: match || null, targetUser: targetUser || null };
  } catch (e) {
    console.error('Demo bootstrap failed', e);
    return { ensuredMatch: null, targetUser: null };
  }
}

export async function runInvestorDemo(currentUserId: string): Promise<void> {
  const result = await setupDemoWorld(currentUserId);
  if (result.ensuredMatch) {
    router.push(`/chat/${result.ensuredMatch.id}`);
  }
}

async function ensureGroupWithExtraUser(currentUserId: string, targetUserId: string, city: string): Promise<void> {
  try {
    const users = await getUsers();
    const extra = users.find(u => u.isDemo && u.city === city && u.id !== currentUserId && u.id !== targetUserId);
    if (!extra) return;

    const myMatches = await getMatchesByUser(currentUserId);
    const alreadyHasGroup = myMatches.some(m => m.users.length > 2 && m.users.includes(targetUserId));
    if (alreadyHasGroup) return;

    const groupName = `${city} Roomies`;
    await createGroupMatch({ users: [currentUserId, targetUserId, extra.id], groupName, createdBy: currentUserId });
    console.log('Demo bootstrap: group created with', { extra: extra.id });
  } catch (e) {
    console.log('Demo bootstrap: ensureGroupWithExtraUser error', e);
  }
}

async function createDemoConversation(
  matchId: string, 
  currentUserId: string, 
  targetUserId: string,
  targetName: string
): Promise<void> {
  console.log('Creating demo conversation for match:', matchId);
  const existingMessages = await getMessagesByMatch(matchId);
  if (existingMessages.length > 0) {
    console.log('Conversation already exists, skipping creation');
    return;
  }
  const messages: Omit<Message, 'id' | 'createdAt'>[] = [
    { matchId, senderId: targetUserId, body: `Hey! I saw we both go to the same university. Are you looking for housing for next semester?` },
    { matchId, senderId: currentUserId, body: `Hi ${targetName}! Yes, I am! Are you looking for a roommate or do you have a place?` },
    { matchId, senderId: targetUserId, body: `I'm actually looking for a roommate! I have a 2BR apartment about 10 minutes from campus. What's your budget range?` },
    { matchId, senderId: currentUserId, body: `That sounds perfect! I'm looking at around $800-1200/month. What's the rent like?` },
    { matchId, senderId: targetUserId, body: `It would be $950/month including utilities! The place has a great kitchen and study area. Want to set up a time to see it?` },
    { matchId, senderId: currentUserId, body: `Absolutely! When works best for you? I'm pretty flexible this week.` }
  ];
  for (let i = 0; i < messages.length; i++) {
    const created = await sendMessage(messages[i]);
    console.log(`Created message ${i + 1}/${messages.length}:`, created.id);
  }
  console.log(`Created ${messages.length} demo messages`);
}

export async function hasExistingMatches(userId: string): Promise<boolean> {
  const matches = await getMatchesByUser(userId);
  return matches.length > 0;
}

export async function getDemoSummary(userId: string): Promise<{
  userCity: string;
  demoUsersInCity: number;
  totalMatches: number;
  hasConversations: boolean;
}> {
  const [currentUser, allUsers, matches] = await Promise.all([
    getUserById(userId),
    getUsers(),
    getMatchesByUser(userId)
  ]);
  if (!currentUser) throw new Error('User not found');
  const demoUsersInCity = allUsers.filter(u => u.city === currentUser.city && u.isDemo === true && u.id !== userId).length;
  let hasConversations = false;
  if (matches.length > 0) {
    const { getMessagesByMatch } = await import('@/services/data');
    for (const match of matches) {
      const messages = await getMessagesByMatch(match.id);
      if (messages.length > 0) { hasConversations = true; break; }
    }
  }
  return { userCity: currentUser.city, demoUsersInCity, totalMatches: matches.length, hasConversations };
}
