import { z } from 'zod';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';

export default async function (server, toolName = 'web-scrape') {
  server.tool(
    toolName,
    "Extract text from a web page",
    { url: z.string() },
    async (_args, _extra) => {
      log.info('web-scrape', _args);
      const url = _args.url;
      const pool = (await import('../custom/puppeteerPool.mjs')).default;
      const response = await pool.run(async (browser) => {
        const page = await browser.newPage();
        // Spoof user agent to appear as a real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        // Enable JavaScript and cookies (default in Puppeteer, but set explicitly)
        await page.setJavaScriptEnabled(true);
        // Set a default cookie to simulate a browser session (optional, can be customized)
        await page.setCookie({
          name: 'puppeteer_session',
          value: 'enabled',
          domain: new URL(url).hostname,
          path: '/',
          httpOnly: false,
          secure: false,
        });
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
          // Optionally wait for body to be visible (improves reliability)
          await page.waitForSelector('body', { timeout: 5000 });
          const text = await page.evaluate(() => {
            function getVisibleText(node) {
              if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent.trim();
              }
              if (node.nodeType !== Node.ELEMENT_NODE) return '';
              const style = window.getComputedStyle(node);
              if (style && (style.display === 'none' || style.visibility === 'hidden')) return '';
              let txt = '';
              for (const child of node.childNodes) {
                txt += getVisibleText(child) + ' ';
              }
              return txt.trim();
            }
            return getVisibleText(document.body);
          });
          return { url, text };
        } finally {
          await page.close();
        }
      });
      return buildResponse(response);
    }
  );
}
