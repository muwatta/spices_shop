import { readFile } from "node:fs/promises";

if (process.env.LOAD_TEST_CONFIRM !== "YES") {
  console.error("Set LOAD_TEST_CONFIRM=YES to run checkout load tests.");
  process.exit(1);
}

const url = process.env.CHECKOUT_URL || "http://localhost:3000/api/checkout";
const requests = Math.min(Math.max(Number(process.env.LOAD_TEST_REQUESTS || 10), 1), 100);
const concurrency = Math.min(Math.max(Number(process.env.LOAD_TEST_CONCURRENCY || 5), 1), requests);
const cookie = process.env.CHECKOUT_COOKIE || "";
const payloadPath = process.env.CHECKOUT_PAYLOAD || "scripts/checkout-load-payload.json";
const payload = JSON.parse(await readFile(payloadPath, "utf8"));

let nextRequest = 0;
const results = [];

async function worker() {
  while (nextRequest < requests) {
    const requestNumber = nextRequest++;
    const startedAt = performance.now();
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify(payload),
      });
      results[requestNumber] = {
        status: response.status,
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch (error) {
      results[requestNumber] = {
        status: "network-error",
        latencyMs: Math.round(performance.now() - startedAt),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

const counts = results.reduce((summary, result) => {
  const key = String(result.status);
  summary[key] = (summary[key] || 0) + 1;
  return summary;
}, {});
const latencies = results.map((result) => result.latencyMs).sort((a, b) => a - b);
const percentile = (value) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * value))];

console.log(JSON.stringify({
  url,
  requests,
  concurrency,
  statuses: counts,
  p50LatencyMs: percentile(0.5),
  p95LatencyMs: percentile(0.95),
}, null, 2));
