import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import App from "./App";
import { apiBase } from "./api";
import {
  authenticateApi,
  authenticationState,
  clearApiCredential,
  subscribeAuthentication,
} from "./authentication";
import { Deadline } from "./components/SessionStatus";

export default function AccessGate() {
  const access = useSyncExternalStore(
    subscribeAuthentication,
    authenticationState,
  );
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
    },
    [],
  );
  // Disconnect lives in the workspace's More menu; it clears the credential and returns here.
  if (access.connected)
    return (
      <App
        onDisconnect={() => {
          clearApiCredential();
          setError("");
        }}
      />
    );
  return (
    <main className="accessGate">
      <section className="panel" aria-labelledby="access-title">
        <div className="eyebrow">SPREADLINE / API ACCESS</div>
        <h1 id="access-title">Connect the workspace</h1>
        <p>
          Enter this workspace's access token. It stays only in this page and
          is cleared when you reload, disconnect, or the server rejects it.
        </p>
        <p className="fine">
          Connecting never resends a save. A save still waiting for
          confirmation stays here for you to review after you reconnect.
          Reloading clears drafts and that tracking.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (loading) return;
            request.current?.abort();
            const controller = new AbortController();
            request.current = controller;
            const supplied = token;
            setToken("");
            setError("");
            setLoading(true);
            setStartedAt(Date.now());
            void authenticateApi(supplied, apiBase, controller.signal)
              .catch((reason) => {
                if (!controller.signal.aborted)
                  setError(
                    reason instanceof Error
                      ? reason.message
                      : "API connection failed.",
                  );
              })
              .finally(() => {
                if (request.current === controller) {
                  request.current = null;
                  setLoading(false);
                  setStartedAt(null);
                }
              });
          }}
        >
          <label htmlFor="api-token">API token</label>
          <input
            id="api-token"
            type="password"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            required
            minLength={32}
            maxLength={4096}
            value={token}
            placeholder="Paste the access token"
            aria-describedby="token-help"
            onChange={(event) => {
              setToken(event.target.value);
              if (
                event.target.value.length >= 32 &&
                event.target.value.length <= 4096 &&
                /^[A-Za-z0-9._~+/-]+=*$/.test(event.target.value)
              )
                setError("");
            }}
            disabled={loading}
          />
          <small id="token-help">
            32 to 4,096 characters · sent only to this workspace's server ·
            30-second time limit
          </small>
          {(error || access.message) && (
            <p role="alert">{error || access.message}</p>
          )}
          {loading && <p role="status">Checking API access…</p>}
          <Deadline startedAt={startedAt} />
          <button className="primary" type="submit" aria-busy={loading}>
            {loading ? "Connecting…" : "Connect workspace"}
          </button>
        </form>
      </section>
    </main>
  );
}
