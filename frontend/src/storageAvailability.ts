const listeners = new Set<() => void>();
let unavailable = false;
export function noteStorageAvailability(configured: boolean) {
  if (unavailable === !configured) return;
  unavailable = !configured;
  listeners.forEach((listener) => listener());
}
export const storageUnavailable = () => unavailable;
export const subscribeStorageAvailability = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
