interface Report {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
}

interface InMemoryDB {
  reports: Report[];
  blocks: Record<string, Set<string>>;
}

const db: InMemoryDB = {
  reports: [],
  blocks: {}
};

export async function recordReport(reporterId: string, reportedUserId: string, reason: string): Promise<void> {
  const report: Report = {
    reporterId,
    reportedUserId,
    reason,
    createdAt: new Date().toISOString()
  };
  
  db.reports.push(report);
  console.log('Report recorded:', report);
}

export async function blockUser(blockerId: string, targetUserId: string): Promise<void> {
  if (!db.blocks[blockerId]) {
    db.blocks[blockerId] = new Set();
  }
  
  db.blocks[blockerId].add(targetUserId);
  console.log(`User ${blockerId} blocked user ${targetUserId}`);
}

export function isUserBlocked(blockerId: string, targetUserId: string): boolean {
  return db.blocks[blockerId]?.has(targetUserId) || false;
}

export function getReports(): Report[] {
  return [...db.reports];
}