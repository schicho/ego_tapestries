import {
  describe,
  expect,
  test,
} from 'vitest';
import { mapWithConcurrencyAndRetry } from './fetchWithRetry';

const isTruthy = (value: unknown) => Boolean(value);

describe('mapWithConcurrencyAndRetry', () => {
  test('keeps the input order', async () => {
    const results = await mapWithConcurrencyAndRetry(
      [1, 2, 3, 4],
      async (n) => {
        await new Promise((resolve) => { setTimeout(resolve, (5 - n) * 2); });
        return n * 10;
      },
      isTruthy,
      { concurrency: 2, retryDelayMs: 0 },
    );
    expect(results).toEqual([10, 20, 30, 40]);
  });

  test('never runs more tasks at once than the concurrency limit', async () => {
    let active = 0;
    let maxActive = 0;
    await mapWithConcurrencyAndRetry(
      Array.from({ length: 20 }, (_, i) => i + 1),
      async (n) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => { setTimeout(resolve, 1); });
        active -= 1;
        return n;
      },
      isTruthy,
      { concurrency: 3, retryDelayMs: 0 },
    );
    expect(maxActive).toBeLessThanOrEqual(3);
  });

  test('retries results that are not valid until they succeed', async () => {
    const calls: Record<string, number> = {};
    const results = await mapWithConcurrencyAndRetry(
      ['a', 'b'],
      async (id) => {
        calls[id] = (calls[id] ?? 0) + 1;
        return id === 'a' && calls[id] < 3 ? null : id;
      },
      isTruthy,
      { retries: 2, retryDelayMs: 0 },
    );
    expect(results).toEqual(['a', 'b']);
    expect(calls).toEqual({ a: 3, b: 1 });
  });

  test('stops retrying after the limit and returns the last result', async () => {
    let calls = 0;
    const results = await mapWithConcurrencyAndRetry(
      ['a'],
      async () => {
        calls += 1;
        return null;
      },
      isTruthy,
      { retries: 2, retryDelayMs: 0 },
    );
    expect(results).toEqual([null]);
    expect(calls).toBe(3);
  });

  test('handles an empty list', async () => {
    expect(await mapWithConcurrencyAndRetry([], async (n) => n, isTruthy)).toEqual([]);
  });
});
