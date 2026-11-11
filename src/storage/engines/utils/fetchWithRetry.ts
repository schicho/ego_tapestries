const sleep = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

/**
 * Runs `task` for every item with at most `concurrency` tasks in flight.
 * A task that resolves to a value rejected by `isValid` is retried up to `retries` times
 * with a growing delay, which covers requests dropped by rate limiting.
 * The last result is returned even if it never became valid, so results keep the input order.
 */
export async function mapWithConcurrencyAndRetry<T, R>(
  items: T[],
  task: (item: T) => Promise<R>,
  isValid: (result: R) => boolean,
  {
    concurrency = 10,
    retries = 2,
    retryDelayMs = 500,
  }: { concurrency?: number; retries?: number; retryDelayMs?: number } = {},
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runOne(item: T): Promise<R> {
    let result = await task(item);
    for (let attempt = 1; attempt <= retries && !isValid(result); attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(retryDelayMs * attempt);
      // eslint-disable-next-line no-await-in-loop
      result = await task(item);
    }
    return result;
  }

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      // eslint-disable-next-line no-await-in-loop
      results[index] = await runOne(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}
