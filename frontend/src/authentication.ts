/** Credentials stay in this page's memory and are bound to one API origin. */
type Session = { token: string; origin: string; controller: AbortController };
type AccessState = { connected: boolean; message: string };
const tokenPattern = /^[A-Za-z0-9._~+/-]+=*$/;
const listeners = new Set<() => void>();
let session: Session | null = null;
let state: AccessState = { connected: false, message: "" };
const REQUEST_TIMEOUT_MS = 30_000;

function apiUrl(base: string, request = false): URL {
  const url = new URL(base);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || (!request && url.search) || url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)))
    throw new Error("Use an HTTPS API URL, or HTTP on loopback, without credentials or query parameters.");
  return url;
}
function validToken(token: string): void {
  if (token.length < 32 || token.length > 4096 || !tokenPattern.test(token))
    throw new Error("Enter a valid API token containing 32 to 4,096 bearer characters.");
}
function publish(message = ""): void {
  state = { connected: session !== null, message };
  for (const listener of listeners) listener();
}
export function subscribeAuthentication(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const authenticationState = (): AccessState => state;
export function clearApiCredential(message = ""): void {
  session?.controller.abort();
  session = null;
  publish(message);
}
export function setApiCredential(token: string, base: string): void {
  validToken(token);
  const origin = apiUrl(base).origin;
  session?.controller.abort();
  session = { token, origin, controller: new AbortController() };
  publish();
}
export async function authenticatedFetch(
  url: string, init: RequestInit, transport: typeof fetch = fetch,
): Promise<Response> {
  const current = session;
  if (!current) throw new Error("Connect the workspace with an API token before sending requests.");
  const target = apiUrl(url, true);
  if (target.origin !== current.origin)
    throw new Error("The API origin changed. Reconnect before sending a credential.");
  const headers = new Headers(init.headers);
  if (headers.has("Authorization")) throw new Error("Caller-supplied authorization is not accepted.");
  headers.set("Authorization", `Bearer ${current.token}`);
  const signals = [current.controller.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)];
  if (init.signal) signals.push(init.signal);
  const response = await transport(url, {
    ...init, headers, signal: AbortSignal.any(signals),
    redirect: "error", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
  });
  if (current !== session || current.controller.signal.aborted) {
    await response.body?.cancel().catch(() => {});
    throw new Error("The API connection changed; review any pending write before retrying.");
  }
  if (response.status === 401)
    clearApiCredential("The API rejected the credential. Reconnect to review or retry pending work.");
  return response;
}
export async function authenticateApi(token: string, base: string, signal: AbortSignal): Promise<void> {
  validToken(token);
  const target = apiUrl(base);
  target.pathname = target.pathname.replace(/\/$/, "") + "/openapi.json";
  let response: Response;
  try {
    response = await fetch(target.href, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]),
      redirect: "error", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer",
    });
  } catch {
    throw new Error("Could not connect to the API. Check its address and availability, then try again.");
  }
  await response.body?.cancel().catch(() => {});
  if (signal.aborted) throw new Error("Connection attempt cancelled.");
  if (response.status === 401) throw new Error("Credential rejected. Check the API token and try again.");
  if (response.status === 503)
    throw new Error("API access is unavailable. The operator must configure SPREADLINE_API_TOKEN and SPREADLINE_OPERATOR_ID.");
  if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json"))
    throw new Error(`API authentication check failed (${response.status}).`);
  setApiCredential(token, base);
}
