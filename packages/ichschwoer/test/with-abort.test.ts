import { describe, it, expect, vi } from "vitest";
import withAbort, { AbortError, isAbortError } from "../src/with-abort.js";

describe("withAbort", () => {
  it("resolves when promise resolves before abort", async () => {
    const controller = new AbortController();
    const promise = Promise.resolve("success");

    const result = await withAbort(promise, controller.signal);
    expect(result).toBe("success");
  });

  it("rejects with AbortError when abort signal is triggered", async () => {
    const controller = new AbortController();
    const deferred = new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    const resultPromise = withAbort(deferred, controller.signal);
    controller.abort();

    await expect(resultPromise).rejects.toThrow(AbortError);
    await expect(resultPromise).rejects.toThrow("The operation was aborted.");
  });

  it("rejects with original error when promise rejects (non-abort)", async () => {
    const controller = new AbortController();
    const originalError = new Error("Original error");
    const promise = Promise.reject(originalError);

    await expect(withAbort(promise, controller.signal)).rejects.toThrow(
      originalError,
    );
  });

  it("removes event listener after promise completes (no lingering handlers)", async () => {
    const controller = new AbortController();
    const addSpy = vi.spyOn(controller.signal, "addEventListener");

    await withAbort(Promise.resolve("success"), controller.signal);

    // The cleanup signal passed to addEventListener should be aborted
    const options = addSpy.mock.calls[0]?.[2] as { signal: AbortSignal };
    expect(options.signal.aborted).toBe(true);
  });
});

describe("AbortError", () => {
  it("creates error with correct name and message", () => {
    const error = new AbortError("Custom message");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AbortError);
    expect(error.name).toBe("AbortError");
    expect(error.message).toBe("Custom message");
  });
});

describe("isAbortError", () => {
  it("returns true for AbortError instances", () => {
    const error = new AbortError("test");
    expect(isAbortError(error)).toBe(true);
  });

  it("returns false for other Error instances", () => {
    const error = new Error("test");
    expect(isAbortError(error)).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
    expect(isAbortError("string")).toBe(false);
    expect(isAbortError(123)).toBe(false);
    expect(isAbortError({})).toBe(false);
  });

  it("returns true for Error with name 'AbortError' (DOMException compatibility)", () => {
    const error = Object.assign(new Error("test"), { name: "AbortError" });
    expect(isAbortError(error)).toBe(true);
  });
});
