import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createBatchResolve } from "../src/index.js";
import Deferred from "../src/deferred.js";

describe("batchResolve", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves all jobs together", async () => {
    const batch = createBatchResolve(100);
    const d1 = new Deferred();

    const checkResolve: string[] = [];

    const r1 = batch.push(d1.promise).then(() => {
      checkResolve.push("One");
    });
    const r2 = batch.push(Promise.reject(new Error("Nope"))).catch((e) => {
      expect(e.message).toBe("Nope");
      checkResolve.push("Two");
    });
    const r3 = batch.push("3").then(() => {
      checkResolve.push("Three");
    });

    expect(checkResolve).toEqual([]);
    expect(batch.length).toBe(3);

    vi.advanceTimersByTime(100);

    expect(checkResolve).toEqual([]);
    expect(batch.length).toBe(0);

    const r4 = batch.push(null).then(() => {
      checkResolve.push("Four");
    });

    d1.resolve("1");
    await Promise.all([r1, r2, r3]);

    expect(checkResolve).toEqual(["Three", "One", "Two"]);
    expect(batch.length).toBe(1);

    vi.advanceTimersByTime(100);
    await r4;

    expect(checkResolve).toEqual(["Three", "One", "Two", "Four"]);
    expect(batch.length).toBe(0);
  });

  it("can be cleared", async () => {
    const batch = createBatchResolve(100);

    const checkResolve: string[] = [];

    ["One", "Two", "Three"].map((v) =>
      batch.push(v).then(() => checkResolve.push(v)),
    );

    vi.advanceTimersByTime(90);
    expect(batch.length).toBe(3);
    expect(checkResolve).toEqual([]);

    batch.clear();
    expect(batch.length).toBe(0);

    // This is effectively a new batch, even though the original windowMs
    // is not yet reached
    batch.push("4").then(() => {
      checkResolve.push("Four");
    });

    await vi.advanceTimersByTimeAsync(50);

    // First batch normally resolved
    expect(checkResolve).toEqual(["One", "Two", "Three"]);
    expect(batch.length).toBe(1);

    // Advance timers to resolve the new batch
    await vi.advanceTimersByTimeAsync(100);

    // Items pushed after clear should resolve
    expect(checkResolve).toEqual(["One", "Two", "Three", "Four"]);
    expect(batch.length).toBe(0);
  });

  it("calls onEmpty when batch is empty", async () => {
    const batch = createBatchResolve(100);
    const checkResolve: string[] = [];

    batch.onEmpty(() => checkResolve.push("Empty"));
    const cancelOnEmpty = batch.onEmpty(() => checkResolve.push("Never"));
    cancelOnEmpty();

    const d = new Deferred<void>();
    batch.push(d.promise).then(() => checkResolve.push("One"));

    expect(checkResolve).toEqual([]);
    expect(batch.length).toBe(1);

    // Move over window but value is not resolved yet, so chunk wont resolve
    vi.advanceTimersByTime(150);

    // Create second chunk
    batch.push("2").then(() => checkResolve.push("Two"));

    // resolve first chunk
    d.resolve();
    await vi.advanceTimersByTimeAsync(0);

    // We're not empty because second chunk is in progress
    expect(checkResolve).toEqual(["One"]);

    // Wait for Promise.allSettled to complete and trigger onEmpty
    await vi.advanceTimersByTimeAsync(100);

    expect(checkResolve).toEqual(["One", "Two", "Empty"]);
    expect(batch.length).toBe(0);
  });

  it("can be drained", async () => {
    const batch = createBatchResolve(100);
    const checkResolve: string[] = [];

    ["One", "Two"].map((v) => batch.push(v).then(() => checkResolve.push(v)));

    batch.drain().then(() => checkResolve.push("Drained"));

    await expect(
      batch.push("Three"),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: BatchResolve is closed]`,
    );

    await vi.advanceTimersByTimeAsync(100);

    expect(checkResolve).toEqual(["One", "Two", "Drained"]);

    // Resolves draining an empty batch
    await createBatchResolve(100).drain();
  });
});
