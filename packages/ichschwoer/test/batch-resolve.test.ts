import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createBatchResolve from "../src/batch-resolve.js";
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
});
