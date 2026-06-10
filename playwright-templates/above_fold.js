/**
 * Template: above_fold
 * Params: { url: string }
 * Returns: base64-encoded PNG of the first viewport only (no scroll)
 */
const { chromium } = require("playwright");

module.exports = async function aboveFold({ url }) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const screenshot = await page.screenshot({ fullPage: false });
  await browser.close();
  return screenshot.toString("base64");
};
