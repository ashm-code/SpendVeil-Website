import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://spendveil.test/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete SpendVeil product demo", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>SpendVeil — Private expense tracking for iPhone<\/title>/i);
  assert.match(html, /Use it like the app\./);
  assert.match(html, /Interactive SpendVeil iPhone demo/);
  assert.match(html, /Open More/);
  assert.match(html, /No bank connection/);
  assert.match(html, /Receipt scanning with review built in\./);
  assert.match(html, /Plan recurring expenses\./);
  assert.match(html, /Interactive iPhone experience/);
  assert.match(html, /Everything included\. Nothing to unlock\./);
  assert.match(html, /FREE FULL VERSION/);
  assert.doesNotMatch(html, /US\$14\.99|PRO LIFETIME|Lifetime Pro|Restore Purchases/i);
  assert.match(html, /sample data only/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("ships the interactive, privacy, and social assets", async () => {
  const [demoSource, layoutSource, packageSource] = await Promise.all([
    readFile(new URL("../app/SpendVeilDemo.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(demoSource, /exportSample/);
  assert.match(demoSource, /askSpendVeil/);
  assert.match(demoSource, /addReceipt/);
  assert.match(demoSource, /setRecurring/);
  assert.match(layoutSource, /\/og\.png/);
  assert.match(layoutSource, /x-forwarded-host/);
  assert.doesNotMatch(packageSource, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../public/app-icon.png", import.meta.url));
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
