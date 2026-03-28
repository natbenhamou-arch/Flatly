export async function exportMyData(userId: string): Promise<void> {
  console.log("GDPR export requested", userId);
}

export async function deleteMyData(userId: string): Promise<void> {
  console.log("GDPR delete requested", userId);
}