import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ApiError } from '../../api/api-error';
import { ERROR_409_RN39, ERROR_429, ERROR_429_WITHOUT_RETRY, apiError } from '../../../testing/api-errors';
import { retryCountdown } from './retry-countdown';

describe('retryCountdown (RUI-03)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function create(initial: ApiError | null) {
    const error = signal<ApiError | null>(initial);
    const seconds = TestBed.runInInjectionContext(() => retryCountdown(error));
    TestBed.tick();
    return { error, seconds };
  }

  async function advance(ms: number) {
    await vi.advanceTimersByTimeAsync(ms);
    TestBed.tick();
  }

  it('baja de a un segundo desde retryAfter hasta 0', async () => {
    const { seconds } = create(apiError({ status: 429, retryAfter: 3 }));
    expect(seconds()).toBe(3);

    await advance(1000);
    expect(seconds()).toBe(2);
    await advance(2000);
    expect(seconds()).toBe(0);
    await advance(5000);
    expect(seconds()).toBe(0);
  });

  it('un 429 nuevo reinicia la cuenta', async () => {
    const { error, seconds } = create(ERROR_429);
    await advance(10_000);
    expect(seconds()).toBe(20);

    error.set({ ...ERROR_429 });
    TestBed.tick();
    expect(seconds()).toBe(30);
  });

  it('sin 429, sin retryAfter o sin error, 0', () => {
    expect(create(null).seconds()).toBe(0);
    expect(create(ERROR_409_RN39).seconds()).toBe(0);
    expect(create(ERROR_429_WITHOUT_RETRY).seconds()).toBe(0);
  });

  it('otro error detiene la cuenta', async () => {
    const { error, seconds } = create(ERROR_429);
    error.set(ERROR_409_RN39);
    TestBed.tick();
    expect(seconds()).toBe(0);
  });
});
