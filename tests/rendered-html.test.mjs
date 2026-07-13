import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished Tuesday prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>The Plan That Survives Tuesday<\/title>/i);
  assert.match(html, /medically reasonable/i);
  assert.match(html, /It will probably fail/i);
  assert.match(html, /Synthetic case/i);
  assert.match(html, /clinician-approved plan translation/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("synthetic API uses deterministic demo mode without a key", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test-api", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/tuesday-test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenarioId: "tuesday-demo-v1",
        constraints: { wednesday: true, budget: false, oneCook: true, pain: false, lowEnergy: false, family: false },
      }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.source, "demo");
  assert.equal(body.meta.syntheticOnly, true);
  assert.equal(body.meta.clinicianReviewRequired, true);
  assert.match(body.plan.changed.join(" "), /Wednesday/i);
  assert.match(body.plan.changed.join(" "), /cooking sessions/i);
});
