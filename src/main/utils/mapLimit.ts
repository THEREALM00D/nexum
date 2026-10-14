// Applique `fn` à chaque élément avec au plus `limit` appels simultanés, en
// gardant l'ordre des résultats (pour ne pas lancer des dizaines de requêtes
// HTTP d'un coup vers un registre de mods).
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}
