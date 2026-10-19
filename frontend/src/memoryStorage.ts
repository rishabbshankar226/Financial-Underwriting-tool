/** Page-lifetime tracking. A full reload intentionally destroys every entry. */
export function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(String(key), String(value));
    },
    removeItem: (key) => {
      values.delete(key);
    },
    clear: () => values.clear(),
  };
}

export const pageJournal = createMemoryStorage();
export const pagePreferences = createMemoryStorage();

/** Keep only the exact uncertain operation across a credential change in this page. */
export function clearSelectionHints(): void {
  for (let index = pageJournal.length - 1; index >= 0; index--) {
    const key = pageJournal.key(index);
    if (key && !key.endsWith("spreadline.pending-write.v1"))
      pageJournal.removeItem(key);
  }
}
