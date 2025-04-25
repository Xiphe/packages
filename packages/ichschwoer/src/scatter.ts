import type { Job } from "./job.js";

/**
 * Make sure all callbacks are executed with at least set ms delay
 */
export default function createScatter(delayMs: number) {
  let lastExecution = -Infinity;
  let waiting = false;
  let closed = false;
  const jobs: (() => Promise<any>)[] = [];
  const onEmpty: (() => void)[] = [];

  const trigger = () => {
    if (jobs.length && !waiting) {
      const now = Date.now();

      if (lastExecution + delayMs <= now) {
        lastExecution = now;
        const job = jobs.shift()!;
        job().finally(() => {
          trigger();
        });
        if (!jobs.length) {
          onEmpty.forEach((cb) => cb());
        }
      } else {
        waiting = true;
        setTimeout(() => {
          waiting = false;
          trigger();
        }, lastExecution + delayMs - now);
      }
    }
  };

  return {
    get length() {
      return jobs.length;
    },
    onEmpty(cb: () => void) {
      onEmpty.push(cb);

      return () => {
        onEmpty.splice(onEmpty.indexOf(cb), 1);
      };
    },
    drain() {
      closed = true;
      if (jobs.length === 0) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const cleanup = this.onEmpty(() => {
          resolve();
          cleanup();
        });
      });
    },
    push<T>(job: Job<T>): Promise<T> {
      if (closed) {
        throw new Error("Scatter is closed");
      }

      return new Promise<T>((resolve, reject) => {
        jobs.push(() => Promise.resolve(job()).then(resolve, reject));
        trigger();
      });
    },
    clear() {
      jobs.length = 0;
    },
  };
}
