import { describe, it, expect } from "vitest";
import allFiltered from "../src/all-filtered.js";

const SKIP_ME = Symbol("SKIP_ME");

describe("allFiltered", () => {
  it("returns all fulfilled values when nothing is filtered", async () => {
    const results = await allFiltered(
      [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
      () => true,
    );

    expect(results).toEqual([1, 2, 3]);
  });

  it("filters out rejected promises matching the filter", async () => {
    const results = await allFiltered(
      [
        Promise.resolve("a"),
        Promise.reject(SKIP_ME),
        Promise.resolve("b"),
        Promise.reject(SKIP_ME),
        Promise.resolve("c"),
      ],
      (r) => r.status === "fulfilled" || r.reason !== SKIP_ME,
    );

    expect(results).toEqual(["a", "b", "c"]);
  });

  it("fails fast on rejections that don't match the filter and are not filtered out", async () => {
    const realError = new Error("Real error");

    await expect(
      allFiltered(
        [
          Promise.resolve(1),
          Promise.reject(SKIP_ME),
          Promise.reject(realError),
          Promise.resolve(2),
        ],
        (r) => r.status === "fulfilled" || r.reason !== SKIP_ME,
      ),
    ).rejects.toBe(realError);
  });

  it("filters out fulfilled values matching the filter", async () => {
    const results = await allFiltered(
      [
        Promise.resolve(1),
        Promise.resolve(null),
        Promise.resolve(2),
        Promise.resolve(undefined),
        Promise.resolve(3),
      ],
      (r) => r.status === "rejected" || r.value != null,
    );

    expect(results).toEqual([1, 2, 3]);
  });

  it("can filter out both fulfilled and rejected based on filter", async () => {
    const results = await allFiltered(
      [
        Promise.resolve("keep"),
        Promise.resolve("skip"),
        Promise.reject("skip-error"),
        Promise.resolve("also-keep"),
      ],
      (r) =>
        (r.status === "rejected" && r.reason !== "skip-error") ||
        (r.status === "fulfilled" && r.value !== "skip"),
    );

    expect(results).toEqual(["keep", "also-keep"]);
  });

  it("fails fast when non-filtered rejection exists alongside filtered ones", async () => {
    await expect(
      allFiltered(
        [
          Promise.resolve("keep"),
          Promise.resolve("skip"),
          Promise.reject("skip-error"),
          Promise.resolve("also-keep"),
          Promise.reject("real-error"),
        ],
        (r) =>
          (r.status === "fulfilled" && r.value !== "skip") ||
          (r.status === "rejected" && r.reason !== "skip-error"),
      ),
    ).rejects.toBe("real-error");
  });

  it("works with empty array", async () => {
    const results = await allFiltered([], () => false);
    expect(results).toEqual([]);
  });

  it("works when all promises are filtered out", async () => {
    const results = await allFiltered(
      [Promise.reject("a"), Promise.reject("b"), Promise.reject("c")],
      () => false,
    );

    expect(results).toEqual([]);
  });

  it("preserves order of non-filtered results", async () => {
    const results = await allFiltered(
      [
        Promise.resolve(1),
        Promise.reject(SKIP_ME),
        Promise.resolve(2),
        Promise.reject(SKIP_ME),
        Promise.resolve(3),
      ],
      (r) => r.status === "fulfilled" || r.reason !== SKIP_ME,
    );

    expect(results).toEqual([1, 2, 3]);
  });

  it("handles mixed promise types and filters out rejected ones", async () => {
    const results = await allFiltered(
      [
        Promise.resolve("string"),
        Promise.resolve(42),
        Promise.reject(SKIP_ME),
        Promise.resolve({ key: "value" }),
      ],
      (r) => r.status === "fulfilled" || r.reason !== SKIP_ME,
    );

    expect(results).toEqual(["string", 42, { key: "value" }]);
  });
});
