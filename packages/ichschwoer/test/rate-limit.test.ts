import { describe, vi, it, expect, beforeEach, afterEach } from "vitest";
import createRateLimit from "../src/rate-limit.js";

describe("RateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes only set jobs within time window", async () => {
    const rateLimit = createRateLimit(1, 100);

    const check: string[] = [];

    rateLimit.push(() => {
      check.push("One");
    });
    rateLimit
      .push(async () => {
        throw new Error("Nope");
      })
      .catch((e) => {
        expect(e.message).toBe("Nope");
        check.push("Two");
      });
    rateLimit.push(() => {
      check.push("Three");
    });
    rateLimit.onEmpty(() => check.push("Empty"));
    const cancelOnEmpty = rateLimit.onEmpty(() => check.push("Never"));
    cancelOnEmpty();

    expect(check).toEqual(["One"]);
    expect(rateLimit.length).toBe(3);

    await vi.advanceTimersByTimeAsync(100);

    expect(check).toEqual(["One", "Two"]);
    expect(rateLimit.length).toBe(2);

    await vi.advanceTimersByTimeAsync(100);

    expect(check).toEqual(["One", "Two", "Three"]);
    expect(rateLimit.length).toBe(1);

    await vi.advanceTimersByTimeAsync(100);
    expect(check).toEqual(["One", "Two", "Three", "Empty"]);
    expect(rateLimit.length).toBe(0);
  });

  it("clears all jobs", async () => {
    const rateLimit = createRateLimit(1, 100);

    const check: string[] = [];

    rateLimit.push(() => {
      check.push("One");
    });
    rateLimit.push(async () => {
      check.push("Two");
    });
    rateLimit.push(() => {
      check.push("Three");
    });

    rateLimit.clear();
    vi.advanceTimersByTime(150);

    expect(check).toEqual(["One"]);
    expect(rateLimit.length).toBe(0);
  });

  it("can be drained", async () => {
    const rateLimit = createRateLimit(1, 100);
    const resolved = Promise.resolve();

    rateLimit.push(() => resolved);
    rateLimit.push(() => resolved);
    const drained = rateLimit.drain();

    expect(() => rateLimit.push(() => {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: RateLimit is closed]`,
    );

    vi.advanceTimersByTime(200);
    await drained;

    // Resolves draining an empty rate limit
    await createRateLimit(1, 100).drain();
  });
});
