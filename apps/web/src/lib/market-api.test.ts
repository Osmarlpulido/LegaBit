import assert from "node:assert/strict";
import { it } from "node:test";

import { ApiClientError } from "./api-client.js";
import { shouldRetryMarketQuery } from "./market-api.js";

it("retries bounded transient failures", () => {
  const network = new ApiClientError({ code: "SERVICE_UNAVAILABLE", message: "offline" }, 0);
  const upstream = new ApiClientError({ code: "SERVICE_UNAVAILABLE", message: "upstream" }, 503);

  assert.equal(shouldRetryMarketQuery(0, network), true);
  assert.equal(shouldRetryMarketQuery(1, upstream), true);
  assert.equal(shouldRetryMarketQuery(2, upstream), false);
});

it("does not retry throttling, deterministic client errors, or unknown failures", () => {
  const throttled = new ApiClientError({ code: "RATE_LIMITED", message: "slow down" }, 429);
  const invalid = new ApiClientError({ code: "VALIDATION_ERROR", message: "invalid" }, 422);

  assert.equal(shouldRetryMarketQuery(0, throttled), false);
  assert.equal(shouldRetryMarketQuery(0, invalid), false);
  assert.equal(shouldRetryMarketQuery(0, new Error("unknown")), false);
});
