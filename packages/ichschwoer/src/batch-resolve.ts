export type Value<T> = Promise<T> | T;

/**
 * Create a handler that artificially delays promises to resolve together
 * after at least set ms
 */
export default function createBatchResolve(ms: number) {
  let current: Promise<any>[] = [];

  return {
    get length(): number {
      return Math.max(current.length - 1, 0);
    },
    async push<T>(value: Value<T>): Promise<T> {
      if (!current.length) {
        current.push(
          new Promise<void>((res) => {
            setTimeout(() => {
              current = [];
              res();
            }, ms);
          }),
        );
      }
      const chunk = current;
      chunk.push(Promise.resolve(value));

      await chunk[0];
      await Promise.allSettled(chunk);
      return value;
    },
  };
}
