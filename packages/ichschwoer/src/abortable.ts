export class AbortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AbortError";
  }
}

export function isAbortError(error: unknown): error is AbortError {
  return error instanceof Error && error.name === "AbortError";
}

export default async function abortable<T>(
  promise: Promise<T>,
  abort: AbortSignal,
) {
  const cleanup = new AbortController();
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        abort.addEventListener(
          "abort",
          () => {
            reject(new AbortError("The operation was aborted."));
          },
          { signal: cleanup.signal },
        );
      }),
    ]);
  } finally {
    cleanup.abort();
  }
}
