/**
 * Template: scroll_to_section
 * Params: { url: string, section_keywords: string[] }
 * Returns: base64-encoded PNG taken when any keyword is visible in the viewport
 */
const { chromium } = require("playwright");

module.exports = async function scrollToSection({ url, section_keywords }) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  const keywords = section_keywords.map((k) => k.toLowerCase());
  let found = false;

  // scroll in 400px steps until a keyword appears or we hit the bottom
  for (let y = 0; y < 20000; y += 400) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(150);

    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    if (keywords.some((kw) => text.includes(kw))) {
      found = true;
      break;
    }

    const atBottom = await page.evaluate(
      () => window.innerHeight + window.scrollY >= document.body.scrollHeight
    );
    if (atBottom) break;
  }

  const screenshot = await page.screenshot({ fullPage: false });
  await browser.close();
  return { screenshot: screenshot.toString("base64"), keyword_found: found };
};
