export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
