import { describe, it, expect } from "vitest";
import createQueue from "../src/queue.js";

describe("Queue", () => {
  it("executes only set number of jobs parallel", async () => {
    const singleLine = createQueue(1);
    const d1 = Promise.withResolvers();
    const d2 = Promise.withResolvers();

    const check: string[] = [];

    const r1 = singleLine.push(() => {
      check.push("One");
      return d1.promise;
    });
    const r2 = singleLine.push(() => {
      check.push("Two");
      return d2.promise;
    });
    const r3 = singleLine.push(() => {
      check.push("Three");
      return "3";
    });

    expect(check).toEqual(["One"]);
    expect(singleLine.length).toBe(3);

    d1.resolve("ok");
    expect(await r1).toBe("ok");

    await tick();
    expect(singleLine.length).toBe(2);
    expect(check).toEqual(["One", "Two"]);

    d2.reject(new Error("Nope"));
    try {
      await r2;
    } catch (e: any) {
      expect(e.message).toBe("Nope");
    }

    await tick();
    expect(singleLine.length).toBe(0);
    expect(check).toEqual(["One", "Two", "Three"]);
    expect(await r3).toBe("3");
  });

  it("can be cleared", async () => {
    const singleLine = createQueue(1);
    const d1 = Promise.withResolvers();

    const check: string[] = [];

    singleLine.push(() => {
      check.push("One");
      return d1.promise;
    });
    singleLine.push(() => {
      check.push("Two");
    });
    singleLine.push(() => {
      check.push("Three");
    });

    singleLine.clear();
    d1.resolve("1");
    await tick();
    expect(check).toEqual(["One"]);
    expect(singleLine.length).toBe(0);
  });

  it("runs jobs in parallel", async () => {
    const singleLine = createQueue(2);
    const d1 = Promise.withResolvers();
    const d2 = Promise.withResolvers();
    const d3 = Promise.withResolvers();

    const check: string[] = [];

    singleLine.onEmpty(() => check.push("Empty"));
    const cancelOnEmpty = singleLine.onEmpty(() => check.push("Never"));
    cancelOnEmpty();

    singleLine.push(() => {
      check.push("One");
      return d1.promise;
    });
    singleLine.push(() => {
      check.push("Two");
      return d2.promise;
    });
    singleLine.push(() => {
      check.push("Three");
      return d3.promise;
    });
    singleLine.push(() => {
      check.push("Four");
      return "4";
    });

    expect(check).toEqual(["One", "Two"]);
    expect(singleLine.length).toBe(4);

    d2.resolve("2");
    await tick();

    expect(check).toEqual(["One", "Two", "Three"]);
    expect(singleLine.length).toBe(3);

    d3.resolve("3");
    await tick();

    expect(check).toEqual(["One", "Two", "Three", "Four"]);
    expect(singleLine.length).toBe(1);

    d1.resolve("1");
    await tick();

    expect(check).toEqual(["One", "Two", "Three", "Four", "Empty"]);
    expect(singleLine.length).toBe(0);
  });

  it("can be drained", async () => {
    const singleLine = createQueue(1);
    const d1 = Promise.withResolvers<void>();

    singleLine.push(() => d1.promise);
    singleLine.push(() => d1.promise);
    const drained = singleLine.drain();

    expect(() => singleLine.push(() => {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: Queue is closed]`,
    );

    d1.resolve();
    await drained;

    // Resolves draining an empty queue
    await createQueue().drain();
  });
});

export function tick() {
  return new Promise((res) => setImmediate(res));
}
