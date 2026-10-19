// Only non-personal catalogue reads are eligible. Memory is scoped to a token
// generation; no tokens or responses are persisted to browser storage.
let owner: string | undefined;
let epoch = 0;
const entries = new Map<string, { expires: number; value: Promise<unknown> }>();
export function invalidateCatalogues() { epoch++; entries.clear(); }
export function scopeCatalogues(session: string | undefined) {
  if (owner !== session) { owner = session; invalidateCatalogues(); }
}
export async function cachedCatalogue<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = entries.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  const generation = epoch;
  const value = (async () => {
    const result = await load();
    if (generation !== epoch) throw new Error('Danh mục đã thay đổi. Vui lòng tải lại.');
    return result;
  })();
  const entry = { expires: Date.now() + 30_000, value };
  if (entries.size >= 50) entries.delete(entries.keys().next().value!);
  entries.set(key, entry);
  try { return await value; }
  catch (error) { if (generation === epoch && entries.get(key) === entry) entries.delete(key); throw error; }
}
