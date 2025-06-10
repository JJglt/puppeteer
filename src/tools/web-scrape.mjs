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
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });
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
        await page.close();
        return { url, text };
      });
      return buildResponse(response);
    }
  );
}
