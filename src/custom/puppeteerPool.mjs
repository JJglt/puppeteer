// puppeteerPool.mjs
// A FIFO pool of 4 Puppeteer workers for dynamic page scraping
import puppeteer from 'puppeteer';

class PuppeteerPool {
  constructor({ size = 4 } = {}) {
    this.size = size;
    this.queue = [];
    this.workers = [];
    this.idleWorkers = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    for (let i = 0; i < this.size; i++) {
      const browser = await puppeteer.launch({ headless: 'new' });
      this.workers.push(browser);
      this.idleWorkers.push(browser);
    }
    this.initialized = true;
  }

  async run(taskFn) {
    await this.init();
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.queue.length === 0 || this.idleWorkers.length === 0) return;
    const { taskFn, resolve, reject } = this.queue.shift();
    const browser = this.idleWorkers.shift();
    (async () => {
      try {
        const result = await taskFn(browser);
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        this.idleWorkers.push(browser);
        this.processQueue();
      }
    })();
  }

  async close() {
    for (const browser of this.workers) {
      await browser.close();
    }
    this.workers = [];
    this.idleWorkers = [];
    this.initialized = false;
  }
}

const pool = new PuppeteerPool({ size: 4 });
export default pool;
