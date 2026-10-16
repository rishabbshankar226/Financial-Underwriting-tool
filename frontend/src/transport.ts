import { authenticatedFetch } from "./authentication";

export type WorkspaceTransport = (
  path: string,
  init: RequestInit,
) => Promise<Response>;
export let apiBase = (
  import.meta.env?.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
let embedded: WorkspaceTransport | null = null;

export function configureEmbeddedTransport(
  generation: string,
  send: WorkspaceTransport,
): void {
  if (!/^[0-9a-f-]{36}$/.test(generation))
    throw new Error("Invalid testing store identity");
  apiBase = `streamlit:${window.location.origin}:${generation}`;
  embedded = send;
}

export function isEmbeddedWorkspace(): boolean {
  return embedded !== null;
}

export function dispatchRequest(
  path: string,
  init: RequestInit,
  network: typeof fetch,
): Promise<Response> {
  return embedded
    ? embedded(path, init)
    : authenticatedFetch(`${apiBase}${path}`, init, network);
}

export function workspaceStorage(): Storage | null {
  try {
    const storage = window.sessionStorage;
    if (!embedded) return storage;
    // Keep the journal across reload and store changes so a mismatched generation
    // blocks writes until reviewed. Standalone journals are a separate namespace.
    const prefix = "spreadline.embedded.";
    const keys = () =>
      Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
        (k): k is string => k !== null && k.startsWith(prefix),
      );
    return {
      get length() {
        return keys().length;
      },
      key(index) {
        return keys()[index]?.slice(prefix.length) ?? null;
      },
      getItem(key) {
        return storage.getItem(prefix + key);
      },
      setItem(key, value) {
        storage.setItem(prefix + key, value);
      },
      removeItem(key) {
        storage.removeItem(prefix + key);
      },
      clear() {
        for (const key of keys()) storage.removeItem(key);
      },
    };
  } catch {
    return null;
  }
}
