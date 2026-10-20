/** Presentation time only; financial work starts immediately and keeps its existing timeout. */
export const DECISION_TRANSITION_MS = 5000;

/** Hold a successful result only for the remainder of the transition. Aborts release the timer. */
export async function finishDecisionTransition(startedAt: number, signal: AbortSignal): Promise<void> {
  const remaining = DECISION_TRANSITION_MS - (performance.now() - startedAt);
  if (remaining <= 0 || signal.aborted) return;
  await new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, remaining);
    signal.addEventListener("abort", finish, { once: true });
  });
}
