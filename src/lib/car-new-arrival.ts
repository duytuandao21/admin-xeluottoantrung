export const NEW_ARRIVAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function newArrivalExpiresAt(createdAt?: string | null): number | null {
  const created = createdAt ? Date.parse(createdAt) : NaN;
  return Number.isFinite(created) ? created + NEW_ARRIVAL_DURATION_MS : null;
}

export function canEditNewArrival(createdAt?: string | null, now = Date.now()): boolean {
  const expires = newArrivalExpiresAt(createdAt);
  return expires !== null && now >= expires - NEW_ARRIVAL_DURATION_MS && now < expires;
}

export function newArrivalUpdate(createdAt: string, original: boolean, selected: boolean, now = Date.now()): { newArrival?: boolean } {
  return canEditNewArrival(createdAt, now) && selected !== original ? { newArrival: selected } : {};
}
