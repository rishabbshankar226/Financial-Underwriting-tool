/** Background reads (analysis) yield to saved writes: a write cancels them synchronously before it is sent,
 * so it never queues behind them or competes for the embedded host's request slots. */
const background = new Set<AbortController>();

/** Registers a background request; call the returned function once it settles. */
export function trackBackground(controller: AbortController): () => void {
  background.add(controller);
  return () => {
    background.delete(controller);
  };
}

export function abortBackgroundRequests(): void {
  const pending = [...background];
  background.clear();
  for (const controller of pending) controller.abort();
}
