import { describe, it, expect } from "vitest";
import Deferred from "../src/deferred.js";

describe("Deferred", () => {
  it("deferred interface", async () => {
    const d = new Deferred();
    expect(d.promise).toBeInstanceOf(Promise);
    expect(d.resolve).toBeInstanceOf(Function);
    expect(d.reject).toBeInstanceOf(Function);
  });

  it("does resolve", async (t) => {
    const d = new Deferred();

    d.resolve("ok");

    expect(await d.promise).toBe("ok");
  });

  it("does reject", async (t) => {
    const d = new Deferred();

    d.reject("nope");

    try {
      await d.promise;
    } catch (e) {
      expect(e).toBe("nope");
    }
  });
});
