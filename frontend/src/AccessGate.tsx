import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import App from "./App";
import { apiBase } from "./api";
import { authenticateApi, authenticationState, clearApiCredential, subscribeAuthentication } from "./authentication";

export default function AccessGate() {
  const access = useSyncExternalStore(subscribeAuthentication, authenticationState);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); }, []);
  // Disconnect lives in the workspace's More menu; it clears the credential and returns here.
  if (access.connected) return <App onDisconnect={() => { clearApiCredential(); setError(""); }} />;
  return <main className="accessGate">
    <section className="panel" aria-labelledby="access-title">
      <div className="eyebrow">SPREADLINE / API ACCESS</div>
      <h1 id="access-title">Connect the workspace</h1>
      <p>Enter the operator API token for this page. Reloading or disconnecting requires re-entry.</p>
      <p className="fine">Pending write tracking is retained for explicit review. Connecting never resubmits a write.</p>
      <form onSubmit={event => {
        event.preventDefault();
        if (loading) return;
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        const supplied = token;
        setToken(""); setError(""); setLoading(true);
        void authenticateApi(supplied, apiBase, controller.signal).catch(reason => {
          if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "API connection failed.");
        }).finally(() => {
          if (request.current === controller) { request.current = null; setLoading(false); }
        });
      }}>
        <label htmlFor="api-token">API token</label>
        <input id="api-token" type="password" autoComplete="off" spellCheck={false}
          autoFocus required minLength={32} maxLength={4096} value={token}
          onChange={event => setToken(event.target.value)} disabled={loading} />
        {(error || access.message) && <p role="alert">{error || access.message}</p>}
        {loading && <p role="status">Checking API access…</p>}
        <button className="primary" type="submit" disabled={loading}>{loading ? "Connecting…" : "Connect workspace"}</button>
      </form>
    </section>
  </main>;
}
