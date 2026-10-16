/** Request correlation only. Existing API clients retain all domain validation. */
export type HostRequest = {
  id: string;
  generation: string;
  method: string;
  path: string;
  body: string;
  headers: Record<string, string>;
};
type Pending = {
  command: HostRequest;
  resolve: (response: Response) => void;
  reject: (reason: Error) => void;
  clean: () => void;
};
type Publish = (requests: HostRequest[]) => void;
const MAX_RESPONSE = 16_777_216;

export class EmbeddedTransport {
  private pending = new Map<string, Pending>();
  private closed = false;
  constructor(
    readonly generation: string,
    public publish: Publish,
  ) {}

  private flush() {
    if (!this.closed)
      this.publish(Array.from(this.pending.values(), (p) => p.command));
  }

  request = (path: string, init: RequestInit): Promise<Response> => {
    if (this.closed)
      return Promise.reject(new Error("The embedded workspace disconnected."));
    if (this.pending.size >= 4)
      return Promise.reject(
        new Error(
          "The workspace is busy. Review pending work before retrying.",
        ),
      );
    if (init.body !== undefined && typeof init.body !== "string")
      return Promise.reject(
        new Error("The embedded workspace accepts raw JSON text only."),
      );
    const body = init.body ?? "";
    if (new TextEncoder().encode(body).length > 1_000_000)
      return Promise.reject(new Error("Request exceeds 1,000,000 bytes."));
    const headers: Record<string, string> = {};
    new Headers(init.headers).forEach((value, key) => {
      headers[key] = value;
    });
    if (headers.authorization)
      return Promise.reject(
        new Error("Credentials cannot be sent through component data."),
      );
    const command: HostRequest = {
      id: crypto.randomUUID(),
      generation: this.generation,
      method: init.method ?? "GET",
      path,
      body,
      headers,
    };
    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout>;
      const fail = () => {
        this.pending.delete(command.id);
        clean();
        this.flush();
        reject(
          new Error(
            "The embedded response was cancelled or timed out. Review any pending write before retrying.",
          ),
        );
      };
      const clean = () => {
        clearTimeout(timer);
        init.signal?.removeEventListener("abort", fail);
      };
      if (init.signal?.aborted) {
        reject(new Error("Request cancelled."));
        return;
      }
      timer = setTimeout(fail, 30_000);
      init.signal?.addEventListener("abort", fail, { once: true });
      this.pending.set(command.id, { command, resolve, reject, clean });
      this.flush();
    });
  };

  accept(replies: unknown): void {
    if (!Array.isArray(replies) || replies.length > 4) return;
    let changed = false;
    for (const value of replies) {
      if (!value || typeof value !== "object" || typeof value.id !== "string")
        continue;
      const pending = this.pending.get(value.id);
      if (!pending) continue;
      this.pending.delete(value.id);
      pending.clean();
      changed = true;
      try {
        if (typeof value.error === "string") throw new Error(value.error);
        if (
          !Number.isInteger(value.status) ||
          value.status < 200 ||
          value.status > 599 ||
          typeof value.body !== "string" ||
          new TextEncoder().encode(value.body).length > MAX_RESPONSE ||
          !value.headers ||
          typeof value.headers !== "object" ||
          Object.values(value.headers).some((item) => typeof item !== "string")
        )
          throw new Error(
            "Unreadable embedded response. Review any pending write before retrying.",
          );
        pending.resolve(
          new Response(value.body, {
            status: value.status,
            headers: value.headers,
          }),
        );
      } catch (error) {
        pending.reject(
          error instanceof Error
            ? error
            : new Error("Embedded response unavailable."),
        );
      }
    }
    if (changed) this.flush();
  }

  dispose(): void {
    this.closed = true;
    for (const pending of this.pending.values()) {
      pending.clean();
      pending.reject(
        new Error(
          "The embedded workspace disconnected. Review pending writes after reconnecting.",
        ),
      );
    }
    this.pending.clear();
  }
}
