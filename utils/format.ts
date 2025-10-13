export function displayName(firstName: string, lastNameOrUndefined?: string): string {
  const safeFirst = (firstName || '').trim();
  const safeLast = (lastNameOrUndefined || '').trim();
  if (!safeLast) {
    return safeFirst;
  }
  return `${safeFirst} ${safeLast.charAt(0)}.`;
}

export function safeNeighborhoodText(neighborhood?: string): string {
  if (!neighborhood) {
    return "Neighborhood hidden";
  }
  return neighborhood;
}

export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371);
}

export function formatDistanceWithMiles(km: number): string {
  const miles = kmToMiles(km);
  return `${km} km (~${miles} miles)`;
}