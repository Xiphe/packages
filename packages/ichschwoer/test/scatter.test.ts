import { describe, vi, it, expect, beforeEach, afterEach } from "vitest";
import createScatter from "../src/scatter.js";

describe("Scatter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("executes jobs after set delay", async () => {
    const scatter = createScatter(100);

    const check: string[] = [];

    scatter.push(() => {
      check.push("One");
    });
    scatter.push(() => {
      check.push("Two");
    });
    scatter.onEmpty(() => check.push("Empty"));
    const cancelOnEmpty = scatter.onEmpty(() => check.push("Never"));
    cancelOnEmpty();

    expect(check).toEqual(["One"]);
    expect(scatter.length).toBe(1);

    vi.advanceTimersByTime(100);
    expect(check).toEqual(["One", "Two", "Empty"]);
    expect(scatter.length).toBe(0);

    vi.advanceTimersByTime(100);
    scatter.push(() => {
      check.push("Three");
    });

    expect(check).toEqual(["One", "Two", "Empty", "Three", "Empty"]);
    expect(scatter.length).toBe(0);
  });

  it("can be cleared", () => {
    const scatter = createScatter(100);

    const check: string[] = [];

    scatter.push(() => {
      check.push("One");
    });
    scatter.push(() => {
      check.push("Two");
    });
    scatter.push(() => {});
    scatter.clear();

    expect(check).toEqual(["One"]);
    expect(scatter.length).toBe(0);
  });

  it("can be drained", async () => {
    const scatter = createScatter(100);

    scatter.push(() => {});
    scatter.push(() => {});
    const drained = scatter.drain();

    expect(() => scatter.push(() => {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: Scatter is closed]`,
    );

    await vi.advanceTimersByTimeAsync(200);
    await drained;

    // Resolves draining an empty scatter
    await createScatter(100).drain();
  });
});
