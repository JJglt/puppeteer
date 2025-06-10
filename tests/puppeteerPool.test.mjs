// puppeteerPool.test.mjs
// Tests for PuppeteerPool
import { jest } from '@jest/globals';

// Mock puppeteer
jest.unstable_mockModule('puppeteer', () => ({
  default: {
    launch: jest.fn(async () => ({
      isConnected: () => true,
      process: () => ({ exitCode: null }),
      close: jest.fn(async () => {}),
    })),
  },
}));

const { default: pool } = await import('../src/custom/puppeteerPool.mjs');

describe('PuppeteerPool', () => {
  afterEach(async () => {
    await pool.close({ force: true });
  });

  it('initializes the pool', async () => {
    await pool.init();
    expect(pool.workers.length).toBe(4);
    expect(pool.idleWorkers.length).toBe(4);
    expect(pool.initialized).toBe(true);
  });

  it('runs a task and returns result', async () => {
    const result = await pool.run(async (browser) => {
      expect(browser.isConnected()).toBe(true);
      return 'ok';
    });
    expect(result).toBe('ok');
  });

  it('getStatus returns correct info', async () => {
    await pool.init();
    const status = pool.getStatus();
    expect(status.total).toBe(4);
    expect(status.idle).toBe(4);
    expect(status.busy).toBe(0);
    expect(status.queue).toBe(0);
  });

  it('closes all browsers', async () => {
    await pool.init();
    await pool.close({ force: true });
    expect(pool.workers.length).toBe(0);
    expect(pool.idleWorkers.length).toBe(0);
    expect(pool.initialized).toBe(false);
  });
});
