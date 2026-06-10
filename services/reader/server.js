const http = require('http');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');

const PORT = 3000;
const td = new TurndownService();

http.createServer(async (req, res) => {
  const encoded = req.url.slice(1);
  if (!encoded) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('url required — GET /{url}');
    return;
  }

  const url = decodeURIComponent(encoded);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; founder-zen/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article) {
      res.writeHead(422, { 'Content-Type': 'text/plain' });
      res.end('could not extract content');
      return;
    }
    const markdown = td.turndown(article.content);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(markdown);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e));
  }
}).listen(PORT, () => console.log(`reader listening on :${PORT}`));
