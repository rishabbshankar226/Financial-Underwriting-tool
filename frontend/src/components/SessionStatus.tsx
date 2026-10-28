import { useEffect, useState, useSyncExternalStore } from "react";
import { requestActivity, subscribeRequests } from "../requestActivity";
import { isEmbeddedWorkspace } from "../transport";
import {
  storageUnavailable,
  subscribeStorageAvailability,
} from "../storageAvailability";

export function Deadline({ startedAt }: { startedAt: number | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (startedAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [startedAt]);
  if (startedAt === null) return null;
  const elapsed = Math.max(0, now - startedAt);
  return (
    <span className="requestDeadline" aria-busy="true">
      {elapsed >= 100 && (
        <span>
          Request active · {Math.max(0, 30 - Math.floor(elapsed / 1000))}s until
          deadline
        </span>
      )}
      {elapsed >= 1000 && (
        <span className="requestSkeleton" aria-hidden="true" />
      )}
    </span>
  );
}

export function SessionStatus({ actor }: { actor?: string }) {
  const activity = useSyncExternalStore(subscribeRequests, requestActivity);
  const stateless = useSyncExternalStore(
    subscribeStorageAvailability,
    storageUnavailable,
  );
  return (
    <>
      <div className="sessionStatus" aria-label="Connection status">
        <span className="connectionBadge">
          {isEmbeddedWorkspace()
            ? "Testing host connected"
            : "API access verified"}
        </span>
        <span>
          Operator identity not provided
          {actor ? ` · selected record attributed to ${actor}` : ""}
        </span>
        <span>Reload clears drafts and retry tracking</span>
        <Deadline startedAt={activity.startedAt} />
      </div>
      {stateless && (
        <div className="modelScope" role="status">
          <strong>Stateless Mode Active</strong>
          <p>
            Case persistence is disabled. Commercial assessments and decisions,
            Consumer Decision, and SBA Screen remain usable through the
            standalone API. The Streamlit testing bridge supports commercial
            workflows only.
          </p>
        </div>
      )}
    </>
  );
}
