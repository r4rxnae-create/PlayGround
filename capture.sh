#!/usr/bin/env bash
# Capture desktop + mobile screenshots of CAPTURE_URL into CAPTURE_DIR.
# Leaves the app running. Exit 75 = temporary nav/browser infra failure,
# exit 1 = script or rendering defect.
set -euo pipefail
cd "$(dirname "$0")"
/usr/bin/time -p test -n "${CAPTURE_URL:-}" || { echo "CAPTURE_URL is not set." >&2; exit 1; }
/usr/bin/time -p test -n "${CAPTURE_DIR:-}" || { echo "CAPTURE_DIR is not set." >&2; exit 1; }
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p node -e '
(async () => {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { createRequire } = await import("node:module");
  const url = process.env.CAPTURE_URL, output = process.env.CAPTURE_DIR;
  if (!url || !output) { console.error("Set CAPTURE_URL and CAPTURE_DIR."); process.exitCode = 1; return; }
  const runtime = join(process.env.HOME, ".local/share/omgithub-playwright");
  const require = createRequire(join(runtime, "package.json"));
  const { chromium } = require("playwright");
  const config = JSON.parse(readFileSync(join(runtime, process.platform === "darwin" ? "metal.json" : "linux.json"), "utf8"));
  if (process.platform === "linux") {
    try { process.env.DISPLAY ||= ":" + readFileSync(join(runtime, "display"), "utf8").trim(); } catch {}
  }
  const transient = (error) => { throw Object.assign(error instanceof Error ? error : new Error(String(error)), { exitCode: 75 }); };
  let browser;
  try {
    browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 }).catch(transient);
    for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } }).catch(transient);
      page.setDefaultTimeout(30000);
      page.on("pageerror", (error) => console.error(error.message));
      const response = await page.goto(url, { waitUntil: "load", timeout: 45000 }).catch(transient);
      const status = response?.status();
      if (!response || !response.ok()) {
        const code = !response || [408, 429, 500, 502, 503, 504].includes(status) ? 75 : 1;
        throw Object.assign(new Error("HTTP " + status + " loading preview"), { exitCode: code });
      }
      await page.locator("body").waitFor({ state: "visible" }).catch(transient);
      await page.waitForFunction(() => document.fonts.status === "loaded").catch(() => {});
      await page.waitForTimeout(1000);
      const text = await page.evaluate(() => document.body ? document.body.innerText.trim().length : 0);
      if (!text) throw Object.assign(new Error("Rendered page has no visible text."), { exitCode: 1 });
      await page.screenshot({ path: join(output, "final-" + name + ".png"), timeout: 30000 }).catch((error) => {
        if (error.name === "TimeoutError" || !browser.isConnected()) transient(error);
        throw error;
      });
      console.log("Captured final-" + name + ".png (" + width + "x" + height + ").");
      await page.close();
    }
  } catch (error) {
    console.error(error);
    process.exitCode = error.exitCode || 1;
  } finally {
    await browser?.close().catch((error) => { console.error(error); process.exitCode ||= 75; });
  }
})();
'
