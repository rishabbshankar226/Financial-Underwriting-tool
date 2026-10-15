import { test as originalTest, expect, type APIRequestContext } from "@playwright/test";
import { apiBase } from "../src/api";
import { clearApiCredential, setApiCredential } from "../src/authentication";
import { TEST_API_ORIGIN, TEST_API_TOKEN } from "./testCredentials";

type RequestOptions = NonNullable<Parameters<APIRequestContext["fetch"]>[1]>;

function scopedOptions(url: string, options: RequestOptions = {}): RequestOptions {
  if (new URL(url).origin !== TEST_API_ORIGIN) return options;
  return {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${TEST_API_TOKEN}` },
    maxRedirects: 0,
  };
}

function scopedRequest(request: APIRequestContext): APIRequestContext {
  return {
    delete: (url, options) => request.delete(url, scopedOptions(url, options)),
    dispose: (options) => request.dispose(options),
    fetch: (url, options) => request.fetch(url, scopedOptions(typeof url === "string" ? url : url.url(), options)),
    get: (url, options) => request.get(url, scopedOptions(url, options)),
    head: (url, options) => request.head(url, scopedOptions(url, options)),
    patch: (url, options) => request.patch(url, scopedOptions(url, options)),
    post: (url, options) => request.post(url, scopedOptions(url, options)),
    put: (url, options) => request.put(url, scopedOptions(url, options)),
    storageState: (options) => request.storageState(options),
    tracing: request.tracing,
  };
}

export const test = originalTest.extend<{ nodeCredential: void }>({
  request: async ({ request }, use) => {
    await use(scopedRequest(request));
  },
  nodeCredential: [async ({}, use) => {
    setApiCredential(TEST_API_TOKEN, apiBase);
    try {
      await use();
    } finally {
      clearApiCredential();
    }
  }, { auto: true }],
});

export { expect };
