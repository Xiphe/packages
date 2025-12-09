import { describe, vi, it, expect, beforeEach, afterEach } from "vitest";
import createThrottle, {
  allButDropped,
  isDropped,
  THROTTLE_DROPPED,
} from "../src/throttle.js";
import Deferred from "../src/deferred.js";

describe("Throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("drops jobs that are called too frequent", async () => {
    const throttle = createThrottle(100);

    const check: string[] = [];

    throttle.onEmpty(() => {
      check.push("Empty");
    });
    const cancelOnEmpty = throttle.onEmpty(() => {
      check.push("Never");
    });
    cancelOnEmpty();

    // First job on queue, executed immediately
    throttle.push(() => {
      check.push("One");
    });
    // Second job on queue, delayed by at least 100ms
    const two = throttle.push(() => {
      check.push("Two");
    });

    // Third job on queue, replaces second job
    const threeD = new Deferred<void>();
    throttle.push(() => {
      check.push("Three");
      return threeD.promise;
    });

    // First job is executed
    expect(check).toEqual(["One"]);
    // Second job is dropped
    await expect(two).rejects.toEqual(THROTTLE_DROPPED);
    // We still have a trailing job
    expect(throttle.trailing).toBe(true);

    // after 100ms, third job is executed
    vi.advanceTimersByTime(100);
    // Note: We don't resolve the promise of the third job
    //       -> it's still in the queue
    expect(check).toEqual(["One", "Three"]);

    // Fourth job on queue, accepted because currently only one job is in the queue
    const four = throttle.push(() => {
      check.push("Four");
    });
    // Fifth job on queue, replaces fourth job which is dropped
    const five = throttle.push(() => {
      check.push("Five");
    });

    // even after exceeding timing window of third job, we continue waiting for it
    vi.advanceTimersByTime(100);
    expect(check).toEqual(["One", "Three"]);
    // fourth job has been dropped
    await expect(four).rejects.toEqual(THROTTLE_DROPPED);

    // finally we resolve the third job
    threeD.resolve();
    // fifth job is executed immediately
    await five;
    // queue is now empty
    expect(check).toEqual(["One", "Three", "Five", "Empty"]);
    expect(throttle.trailing).toBe(false);
    // but we're still waiting for the window to close
    expect(throttle.waiting).toBe(true);

    vi.advanceTimersByTime(100);
    // after 100ms, we're no longer waiting
    expect(throttle.waiting).toBe(false);

    // Sixth job on queue, executed immediately
    const six = throttle.push(() => {
      check.push("Six");
    });
    await six;
    expect(check).toEqual(["One", "Three", "Five", "Empty", "Six", "Empty"]);

    // queue is empty
    expect(throttle.trailing).toBe(false);
    // but we're still waiting for the window to close
    expect(throttle.waiting).toBe(true);

    // Seventh job on queue to be executed after 100ms
    const seven = throttle.push(() => {
      check.push("Seven");
    });
    // Eighth job on queue, replaces seventh job which is dropped
    const eight = throttle.push(() => {
      check.push("Eight");
    });

    // seventh job has been dropped
    await expect(seven).rejects.toEqual(THROTTLE_DROPPED);
    expect(check).toEqual(["One", "Three", "Five", "Empty", "Six", "Empty"]);

    // still waiting on eighth job
    expect(throttle.trailing).toBe(true);

    // hard-resetting the throttle
    throttle.reset();

    // all jobs have been dropped
    await expect(eight).rejects.toEqual(THROTTLE_DROPPED);

    // queue is empty
    expect(throttle.trailing).toBe(false);
    expect(throttle.waiting).toBe(false);
  });

  it("can filter out dropped jobs", async () => {
    const throttle = createThrottle();

    expect(
      await allButDropped(
        ["One", "Two", "Three"].map((v) => throttle.push(() => v)),
      ),
    ).toEqual(["One", "Three"]);
  });

  it("also works well with allSettled, when that's your jam", async () => {
    const throttle = createThrottle();
    const results = await Promise.allSettled([
      ...["One", "Two", "Three"].map((v) => throttle.push(() => v)),
      throttle.push(() => Promise.reject("Nope")),
    ]);

    expect(results.filter((r) => !isDropped(r))).toEqual([
      { status: "fulfilled", value: "One" },
      { status: "rejected", reason: "Nope" },
    ]);
  });

  it("can be drained", async () => {
    const throttle = createThrottle(100);
    const resolved = Promise.resolve();

    throttle.push(() => resolved);
    const p = expect(throttle.push(() => resolved)).rejects.toEqual(
      THROTTLE_DROPPED,
    );
    throttle.push(() => resolved);
    const drained = throttle.drain();

    await expect(() =>
      throttle.push(() => {}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Throttle is closed]`);
    await p;

    vi.advanceTimersByTime(200);
    await drained;

    // Resolves draining an empty throttle
    await createThrottle(100).drain();
  });
});
