import type { JobHandler, Value } from "./JobTypes.js";

/**
 * Create a handler that artificially delays promises to resolve together
 * after at least set ms
 */
export default function createBatchResolve(windowMs: number = 0) {
  let current: Promise<any>[] = [];
  const onEmpty: (() => void)[] = [];
  let closed = false;

  return {
    get length(): number {
      return Math.max(current.length - 1, 0);
    },
    async push(value) {
      if (closed) {
        throw new Error("BatchResolve is closed");
      }

      const chunk = current;
      if (!current.length) {
        chunk.push(
          new Promise<void>((res) => {
            setTimeout(async () => {
              if (chunk === current) {
                /* start new chunk in unless it was reset manually */
                this.clear();
              }
              res();

              await Promise.allSettled(chunk)
                .then(() => Promise.resolve())
                .then(() => {
                  if (current.length === 0) {
                    onEmpty.forEach((cb) => cb());
                  }
                });
            }, windowMs);
          }),
        );
      }
      chunk.push(Promise.resolve(value));

      await chunk[0];
      await Promise.allSettled(chunk);
      return value;
    },
    clear() {
      current = [];
    },
    drain() {
      closed = true;
      if (current.length === 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const cleanup = this.onEmpty(() => {
          resolve();
          cleanup();
        });
      });
    },
    onEmpty(cb) {
      onEmpty.push(cb);

      return () => {
        onEmpty.splice(onEmpty.indexOf(cb), 1);
      };
    },
  } satisfies JobHandler<"value">;
}
