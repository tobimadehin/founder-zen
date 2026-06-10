/**
 * Template: simple_screenshot
 * Params: { url: string }
 * Returns: base64-encoded PNG of the full page
 */
const { chromium } = require("playwright");

module.exports = async function simpleScreenshot({ url }) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  const screenshot = await page.screenshot({ fullPage: true });
  await browser.close();
  return screenshot.toString("base64");
};
