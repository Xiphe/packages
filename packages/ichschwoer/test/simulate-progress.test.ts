import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import simulateProgress, {
  towards,
  endless,
} from "../src/simulate-progress.js";

describe("simulateProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onProgress with default options", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(deferred.promise, (progress) =>
      progressCalls.push(progress),
    );

    // Default: expectedDurationMs = 1000, intervalMs = 100
    // Expected steps: Math.floor(1000 / 100) = 10
    // Step size: 1 / 10 = 0.1
    // Progress increments: 0.1, 0.2, 0.3, ...

    // Advance time by 100ms (first interval)
    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([0.1]);

    // Advance time by another 100ms
    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([0.1, 0.2]);

    // Advance time by 300ms more (3 more intervals)
    await vi.advanceTimersByTimeAsync(300);
    expect(progressCalls).toHaveLength(5);
    expect(progressCalls[0]).toBeCloseTo(0.1);
    expect(progressCalls[1]).toBeCloseTo(0.2);
    expect(progressCalls[2]).toBeCloseTo(0.3);
    expect(progressCalls[3]).toBeCloseTo(0.4);
    expect(progressCalls[4]).toBeCloseTo(0.5);

    // Resolve the promise
    deferred.resolve("result");
    await promise;

    // Should call onProgress(1) in finally block
    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("calls onProgress with custom options", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      (progress) => progressCalls.push(progress),
      { expectedDurationMs: 500, intervalMs: 50 },
    );

    // Expected steps: Math.floor(500 / 50) = 10
    // Step size: 1 / 10 = 0.1
    // Progress increments: 0.1, 0.2, ...

    await vi.advanceTimersByTimeAsync(50);
    expect(progressCalls).toEqual([0.1]);

    await vi.advanceTimersByTimeAsync(50);
    expect(progressCalls).toEqual([0.1, 0.2]);

    deferred.resolve("result");
    await promise;

    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("handles promise rejection and still calls onProgress(1)", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(deferred.promise, (progress) =>
      progressCalls.push(progress),
    );

    await vi.advanceTimersByTimeAsync(200);
    expect(progressCalls.length).toBeGreaterThan(0);

    const error = new Error("Test error");
    deferred.reject(error);

    await expect(promise).rejects.toThrow("Test error");

    // Should still call onProgress(1) in finally block
    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("returns the resolved value", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(deferred.promise, (progress) =>
      progressCalls.push(progress),
    );

    deferred.resolve("success");
    const result = await promise;

    expect(result).toBe("success");
    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("handles edge case when expectedDurationMs < intervalMs", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      (progress) => progressCalls.push(progress),
      { expectedDurationMs: 50, intervalMs: 100 },
    );

    // Expected steps: Math.max(1, Math.floor(50 / 100)) = Math.max(1, 0) = 1
    // Step size: 1 / 1 = 1

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([1]); // Should be capped at 1

    deferred.resolve("result");
    await promise;

    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("handles edge case when expectedDurationMs equals intervalMs", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      (progress) => progressCalls.push(progress),
      { expectedDurationMs: 100, intervalMs: 100 },
    );

    // Expected steps: Math.floor(100 / 100) = 1
    // Step size: 1 / 1 = 1

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([1]);

    deferred.resolve("result");
    await promise;

    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("caps progress at 1 even if multiple intervals pass", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      (progress) => progressCalls.push(progress),
      { expectedDurationMs: 200, intervalMs: 100 },
    );

    // Expected steps: Math.floor(200 / 100) = 2
    // Step size: 1 / 2 = 0.5
    // Progress increments: 0.5, 1.0 (capped at 1.0)

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([0.5]);

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([0.5, 1.0]);

    // Even if more time passes, progress should stay at 1.0 (capped by Math.min)
    await vi.advanceTimersByTimeAsync(200);
    expect(progressCalls).toEqual([0.5, 1.0, 1.0, 1.0]);

    deferred.resolve("result");
    await promise;

    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("clears interval when promise resolves", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(deferred.promise, (progress) =>
      progressCalls.push(progress),
    );

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls.length).toBe(1);

    deferred.resolve("result");
    await promise;

    const callsBefore = progressCalls.length;

    // Advance time significantly - interval should be cleared
    await vi.advanceTimersByTimeAsync(1000);
    expect(progressCalls.length).toBe(callsBefore); // No new calls
  });

  it("clears interval when promise rejects", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(deferred.promise, (progress) =>
      progressCalls.push(progress),
    );

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls.length).toBe(1);

    deferred.reject(new Error("error"));
    await expect(promise).rejects.toThrow();

    const callsBefore = progressCalls.length;

    // Advance time significantly - interval should be cleared
    await vi.advanceTimersByTimeAsync(1000);
    expect(progressCalls.length).toBe(callsBefore); // No new calls
  });

  it("handles already resolved promise", async () => {
    const progressCalls: number[] = [];

    const promise = simulateProgress(Promise.resolve("immediate"), (progress) =>
      progressCalls.push(progress),
    );

    await vi.advanceTimersByTimeAsync(0);
    const result = await promise;

    expect(result).toBe("immediate");
    // Should still call onProgress(1) even if promise was already resolved
    expect(progressCalls).toEqual([1]);
  });

  it("handles already rejected promise", async () => {
    const progressCalls: number[] = [];
    const error = new Error("immediate error");

    const promise = simulateProgress(Promise.reject(error), (progress) =>
      progressCalls.push(progress),
    );

    // Wait for the promise to reject and the finally block to execute
    try {
      await promise;
    } catch (e) {
      // Expected rejection
    }

    await vi.advanceTimersByTimeAsync(0);

    // Should still call onProgress(1) even if promise was already rejected
    expect(progressCalls).toEqual([1]);
  });

  it("handles zero expectedDurationMs", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      (progress) => progressCalls.push(progress),
      { expectedDurationMs: 0, intervalMs: 100 },
    );

    // Expected steps: Math.max(1, Math.floor(0 / 100)) = Math.max(1, 0) = 1
    // Step size: 1 / 1 = 1

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls).toEqual([1]);

    deferred.resolve("result");
    await promise;

    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });

  it("passes both capped and uncapped progress to callback", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: Array<[number, number]> = [];

    const promise = simulateProgress(deferred.promise, (progress, uncapped) =>
      progressCalls.push([progress, uncapped]),
    );

    // Default: expectedDurationMs = 1000, intervalMs = 100
    // Expected steps: Math.floor(1000 / 100) = 10
    // Step size: 1 / 10 = 0.1
    // Progress increments: 0.1, 0.2, 0.3, ...

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls[0]).toEqual([0.1, 0.1]);

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls[1]).toEqual([0.2, 0.2]);

    // Advance past expected duration to see uncapped > 1
    await vi.advanceTimersByTimeAsync(900);
    expect(progressCalls.length).toBeGreaterThanOrEqual(10);
    // After 10 steps, progress is capped at 1, but uncapped continues
    const lastCall = progressCalls[progressCalls.length - 1];
    expect(lastCall[0]).toBe(1); // capped
    expect(lastCall[1]).toBeCloseTo(1.1); // uncapped

    deferred.resolve("result");
    await promise;

    // Finally block calls onProgress(1, Infinity)
    expect(progressCalls[progressCalls.length - 1]).toEqual([1, Infinity]);
  });

  it("works with towards helper to scale progress", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      towards(0.5, (progress) => progressCalls.push(progress)),
    );

    // Default: expectedDurationMs = 1000, intervalMs = 100
    // Expected steps: Math.floor(1000 / 100) = 10
    // Step size: 1 / 10 = 0.1
    // Progress increments: 0.1, 0.2, 0.3, ...
    // With towards(0.5): 0.1 * 0.5 = 0.05, 0.2 * 0.5 = 0.1, etc.

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls[0]).toBeCloseTo(0.05);

    await vi.advanceTimersByTimeAsync(100);
    expect(progressCalls[1]).toBeCloseTo(0.1);

    deferred.resolve("result");
    await promise;

    // Finally block calls onProgress(1, Infinity), which gets multiplied: 1 * 0.5 = 0.5, Infinity * 0.5 = Infinity
    expect(progressCalls[progressCalls.length - 1]).toBe(0.5);
  });

  it("works with endless helper", async () => {
    const deferred = Promise.withResolvers<string>();
    const progressCalls: number[] = [];

    const promise = simulateProgress(
      deferred.promise,
      endless((progress) => progressCalls.push(progress)),
      { intervalMs: 1000 },
    );

    await vi.advanceTimersByTimeAsync(10000);
    expect(progressCalls).toEqual([
      0.5437990411493523, 0.748575008241395, 0.8215184513413138,
      0.8602092044175453, 0.8847437807541969, 0.9018273450480363,
      0.9144491547176298, 0.9241711101330433, 0.9318964141255333,
      0.9381861360203892,
    ]);

    deferred.resolve("result");
    await promise;

    // Finally block calls onProgress(1, Infinity), endless passes through progress (1) when uncapped is Infinity
    expect(progressCalls[progressCalls.length - 1]).toBe(1);
  });
});

describe("towards", () => {
  it("multiplies both progress and uncapped by target before calling callback", () => {
    const callback = vi.fn();
    const wrapped = towards(0.5, callback);

    wrapped(0.5, 0.5);
    expect(callback).toHaveBeenCalledWith(0.25, 0.25);

    wrapped(1.0, 1.0);
    expect(callback).toHaveBeenCalledWith(0.5, 0.5);
  });

  it("handles different target values", () => {
    const callback = vi.fn();
    const wrapped = towards(0.8, callback);

    wrapped(1.0, 1.0);
    expect(callback).toHaveBeenCalledWith(0.8, 0.8);

    wrapped(0.5, 0.5);
    expect(callback).toHaveBeenCalledWith(0.4, 0.4);
  });

  it("handles target > 1", () => {
    const callback = vi.fn();
    const wrapped = towards(2.0, callback);

    wrapped(0.5, 0.5);
    expect(callback).toHaveBeenCalledWith(1.0, 1.0);

    wrapped(1.0, 1.0);
    expect(callback).toHaveBeenCalledWith(2.0, 2.0);
  });

  it("handles zero target", () => {
    const callback = vi.fn();
    const wrapped = towards(0, callback);

    wrapped(0.5, 0.5);
    expect(callback).toHaveBeenCalledWith(0, 0);

    wrapped(1.0, 1.0);
    expect(callback).toHaveBeenCalledWith(0, 0);
  });

  it("handles Infinity in uncapped parameter", () => {
    const callback = vi.fn();
    const wrapped = towards(0.5, callback);

    wrapped(1.0, Infinity);
    expect(callback).toHaveBeenCalledWith(0.5, Infinity);
  });
});
