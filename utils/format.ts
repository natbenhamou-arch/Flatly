export function displayName(firstName: string, lastNameOrUndefined?: string): string {
  if (!lastNameOrUndefined) {
    return firstName;
  }
  return `${firstName} ${lastNameOrUndefined.charAt(0)}.`;
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