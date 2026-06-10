/**
 * Template: paginate_and_collect
 * Params: { url: string, next_button_selector: string, max_pages: number }
 * Returns: { pages: string[], page_count: number } — text content per page
 */
const { chromium } = require("playwright");

module.exports = async function paginateAndCollect({ url, next_button_selector, max_pages }) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  const pages = [];
  const limit = Math.min(max_pages || 5, 20);

  for (let i = 0; i < limit; i++) {
    const text = await page.evaluate(() => document.body.innerText);
    pages.push(text);

    const nextBtn = await page.$(next_button_selector);
    if (!nextBtn) break;

    const disabled = await nextBtn.getAttribute("disabled");
    const ariaDisabled = await nextBtn.getAttribute("aria-disabled");
    if (disabled !== null || ariaDisabled === "true") break;

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => {}),
      nextBtn.click(),
    ]);
  }

  await browser.close();
  return { pages, page_count: pages.length };
};
