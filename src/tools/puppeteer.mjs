import { z } from 'zod';
import log from '../log.mjs';
import { buildResponse } from '../toolHelpers.mjs';

export default async function (server, toolName = 'puppeteer') {
  server.tool(
    toolName,
    "Extract text or JSON from a web page with advanced options",
    {
      url: z.string(),
      method: z.string().optional().default('GET'),
      headers: z.record(z.string()).optional(),
      userAgent: z.string().optional(),
      body: z.string().optional(),
      timeout: z.number().optional(),
      selector: z.string().optional(),
      waitForSelector: z.string().optional(),
      cookies: z.array(z.record(z.any())).optional(),
      followRedirects: z.boolean().optional(),
      includeHeaders: z.boolean().optional(),
      includeStatus: z.boolean().optional(),
      disableJavaScript: z.boolean().optional(),
      proxy: z.string().optional(),
      viewport: z.object({ width: z.number(), height: z.number() }).optional(),
      ignoreSSLErrors: z.boolean().optional(),
    },
    async (_args, _extra) => {
      log.info('web-scrape', _args);
      const {
        url, method, headers, userAgent, body, timeout, selector, waitForSelector,
        cookies, followRedirects, includeHeaders, includeStatus, disableJavaScript,
        proxy, viewport, ignoreSSLErrors
      } = _args;
      const pool = (await import('../custom/puppeteerPool.mjs')).default;
      const response = await pool.run(async (browser) => {
        let page;
        let context = browser.defaultBrowserContext();
        // Proxy support
        if (proxy) {
          // Not supported per-page in vanilla Puppeteer, would require browser launch arg
          // This is a placeholder for future pool-level proxy support
        }
        if (ignoreSSLErrors) {
          // Puppeteer only supports this at browser launch, not per-page
          // But we can set it globally for the process
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        page = await browser.newPage();
        if (viewport) {
          await page.setViewport(viewport);
        }
        if (userAgent) {
          await page.setUserAgent(userAgent);
        } else {
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        }
        if (disableJavaScript) {
          await page.setJavaScriptEnabled(false);
        } else {
          await page.setJavaScriptEnabled(true);
        }
        if (cookies && cookies.length > 0) {
          await page.setCookie(...cookies);
        } else {
          await page.setCookie({
            name: 'puppeteer_session',
            value: 'enabled',
            domain: new URL(url).hostname,
            path: '/',
            httpOnly: false,
            secure: false,
          });
        }
        try {
          // Only enable request interception if needed
          const needsInterception = (method && method !== 'GET') || headers || body;
          if (needsInterception) {
            await page.setRequestInterception(true);
            page.on('request', req => {
              if (req.isNavigationRequest() && req.url() === url) {
                req.continue({
                  method: method || 'GET',
                  headers: headers ? { ...req.headers(), ...headers } : req.headers(),
                  postData: (method && method !== 'GET' && body) ? body : undefined,
                });
              } else {
                req.continue();
              }
            });
          }
          const navOptions = { waitUntil: 'networkidle0' };
          if (timeout) navOptions['timeout'] = timeout;
          await page.goto(url, navOptions);
          if (waitForSelector) {
            await page.waitForSelector(waitForSelector, { timeout: timeout || 5000 });
          } else {
            await page.waitForSelector('body', { timeout: timeout || 5000 });
          }
          const mainResponse = await page.waitForResponse(resp => resp.url() === url && resp.request().isNavigationRequest(), { timeout: 5000 }).catch(() => null);
          let contentType = '';
          let jsonData = null;
          let status = null;
          let respHeaders = null;
          if (mainResponse) {
            contentType = mainResponse.headers()['content-type'] || '';
            status = mainResponse.status();
            respHeaders = mainResponse.headers();
            if (contentType.includes('application/json')) {
              try {
                jsonData = await mainResponse.json();
              } catch { }
            }
          }
          let result = { url };
          if (includeStatus && status !== null) result.status = status;
          if (includeHeaders && respHeaders) result.headers = respHeaders;
          if (jsonData) {
            result.content = await mainResponse.text();
          } else {
            // Extract text
            if (selector) {
              result.text = await page.$eval(selector, el => el.innerText);
            } else {
              result.text = await page.evaluate(() => {
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
            }
          }
          if (followRedirects === false && mainResponse) {
            result.finalUrl = mainResponse.url();
          }
          return result;
        } finally {
          await page.close();
          if (ignoreSSLErrors) {
            delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
          }
        }
      });
      return buildResponse(response);
    }
  );
}
