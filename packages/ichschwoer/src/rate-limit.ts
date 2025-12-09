import type { Job, JobHandler } from "./JobTypes.js";

/**
 * Create a rateLimited queue that only executes max Jobs within windowMs
 */
export default function createRateLimit(max: number, windowMs: number) {
  let window = 0;
  let closed = false;
  const jobs: Job<any>[] = [];
  const onEmpty: (() => void)[] = [];

  const trigger = () => {
    if (window === 0) {
      setTimeout(() => {
        window = 0;
        const next = Math.min(max, jobs.length);
        if (next === 0) {
          onEmpty.forEach((cb) => cb());
          return;
        }
        for (let i = 0; i < next; i++) {
          trigger();
        }
      }, windowMs);
    }

    if (jobs.length && window < max) {
      window++;
      jobs.shift()!();
    }
  };

  return {
    get length() {
      return jobs.length + window;
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
    onEmpty(cb) {
      onEmpty.push(cb);

      return () => {
        onEmpty.splice(onEmpty.indexOf(cb), 1);
      };
    },
    push(job) {
      if (closed) {
        throw new Error("RateLimit is closed");
      }

      return new Promise((resolve, reject) => {
        jobs.push(() => Promise.resolve(job()).then(resolve, reject));
        trigger();
      });
    },
    clear() {
      jobs.length = 0;
    },
  } satisfies JobHandler;
}
