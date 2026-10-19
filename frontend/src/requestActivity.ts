type Activity = { count: number; startedAt: number | null };
const active = new Map<symbol, number>();
const listeners = new Set<() => void>();
let snapshot: Activity = { count: 0, startedAt: null };
function publish() {
  snapshot = {
    count: active.size,
    startedAt: active.size ? Math.min(...active.values()) : null,
  };
  listeners.forEach((listener) => listener());
}
export const requestActivity = () => snapshot;
export const subscribeRequests = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export async function trackRequest<T>(send: () => Promise<T>): Promise<T> {
  const id = Symbol();
  active.set(id, Date.now());
  publish();
  try {
    return await send();
  } finally {
    active.delete(id);
    publish();
  }
}
