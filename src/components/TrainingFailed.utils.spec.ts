import {
  afterEach, beforeEach, describe, expect, test, vi,
} from 'vitest';
import { scheduleTrainingFailedRedirect } from './TrainingFailed.utils';

describe('scheduleTrainingFailedRedirect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('redirects after the delay, once the rejection has been saved', async () => {
    const redirect = vi.fn();
    scheduleTrainingFailedRedirect(Promise.resolve(), 'https://example.com/return', 5000, redirect);

    await vi.advanceTimersByTimeAsync(4999);
    expect(redirect).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(redirect).toHaveBeenCalledWith('https://example.com/return');
  });

  test('uses a delay of 10 seconds by default', async () => {
    const redirect = vi.fn();
    scheduleTrainingFailedRedirect(Promise.resolve(), 'https://example.com/return', undefined, redirect);

    await vi.advanceTimersByTimeAsync(9999);
    expect(redirect).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  test('does not redirect before the rejection has been saved', async () => {
    const redirect = vi.fn();
    let finishRejection: () => void = () => undefined;
    const rejection = new Promise<void>((resolve) => { finishRejection = resolve; });
    scheduleTrainingFailedRedirect(rejection, 'https://example.com/return', 1000, redirect);

    await vi.advanceTimersByTimeAsync(60000);
    expect(redirect).not.toHaveBeenCalled();

    finishRejection();
    await vi.advanceTimersByTimeAsync(1000);
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  test('still redirects if saving the rejection failed', async () => {
    const redirect = vi.fn();
    scheduleTrainingFailedRedirect(Promise.reject(new Error('offline')), 'https://example.com/return', 1000, redirect);

    await vi.advanceTimersByTimeAsync(1000);
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  test('can be cancelled before and after the rejection was saved', async () => {
    const redirect = vi.fn();
    const cancelEarly = scheduleTrainingFailedRedirect(Promise.resolve(), 'https://example.com/return', 1000, redirect);
    cancelEarly();
    await vi.advanceTimersByTimeAsync(5000);

    const cancelLate = scheduleTrainingFailedRedirect(Promise.resolve(), 'https://example.com/return', 1000, redirect);
    await vi.advanceTimersByTimeAsync(500);
    cancelLate();
    await vi.advanceTimersByTimeAsync(5000);

    expect(redirect).not.toHaveBeenCalled();
  });
});
