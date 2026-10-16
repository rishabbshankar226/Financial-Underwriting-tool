import { test, expect } from "@playwright/test";
import { EmbeddedTransport, type HostRequest } from "../src/embeddedTransport";

test("embedded requests retain their raw text and settle once across host rerenders", async () => {
  let commands: HostRequest[] = [];
  const generation = crypto.randomUUID();
  const client = new EmbeddedTransport(generation, (value) => {
    commands = value;
  });
  const raw = '{"money":10000000000000000.01,"money":2}';
  const pending = client.request("/commercial/assessment", {
    method: "POST",
    body: raw,
  });
  expect(commands).toHaveLength(1);
  expect(commands[0].body).toBe(raw);
  const reply = {
    id: commands[0].id,
    status: 422,
    headers: { "content-type": "application/json" },
    body: '{"detail":"duplicate"}',
  };
  client.accept([reply]);
  client.accept([reply]);
  expect((await pending).status).toBe(422);
  expect(commands).toEqual([]);
  client.dispose();
});

test("aborted selections ignore late replies and do not dispatch another request", async () => {
  let commands: HostRequest[] = [];
  const client = new EmbeddedTransport(crypto.randomUUID(), (value) => {
    commands = value;
  });
  const controller = new AbortController();
  const pending = client.request("/cases", {
    method: "GET",
    signal: controller.signal,
  });
  const command = commands[0];
  controller.abort();
  await expect(pending).rejects.toThrow();
  client.accept([{ id: command.id, status: 200, headers: {}, body: "{}" }]);
  expect(commands).toEqual([]);
  client.dispose();
});

test("uncertain host errors reject without a synthetic success or retry", async () => {
  let commands: HostRequest[] = [];
  const client = new EmbeddedTransport(crypto.randomUUID(), (value) => {
    commands = value;
  });
  const pending = client.request("/cases", { method: "POST", body: "{}" });
  client.accept([{ id: commands[0].id, error: "The response was lost" }]);
  await expect(pending).rejects.toThrow("lost");
  expect(commands).toEqual([]);
  client.dispose();
});
