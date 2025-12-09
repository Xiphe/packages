import allFiltered from "./all-filtered.js";
import type { Job, JobHandler } from "./JobTypes.js";

export const THROTTLE_DROPPED = Symbol("THROTTLE_DROPPED");

/**
 * Drop jobs that are called earlier than windowMs from the last job
 * while ensuring the latest job is called after windowMs
 */
export default function createThrottle(windowMs: number = 0) {
  let last = -Infinity;
  let closed = false;
  const onEmpty: (() => void)[] = [];
  const jobs: [PromiseWithResolvers<any>, Job<any>][] = [];

  const trigger = () => {
    if (jobs.length > 2) {
      jobs[1][0].reject(THROTTLE_DROPPED);
      jobs.splice(1, 1);
      return;
    }

    if (jobs.length !== 1) {
      return;
    }

    last = Date.now();
    const [d, job] = jobs[0]!;
    const next = () => {
      jobs.shift();
      trigger();
    };

    Promise.resolve(job())
      .then(d.resolve, d.reject)
      .finally(() => {
        const delay = last + windowMs - Date.now();
        if (jobs.length === 1) {
          onEmpty.forEach((cb) => cb());
        }
        if (delay > 0) {
          setTimeout(next, delay);
        } else {
          next();
        }
      });
  };

  return {
    get trailing() {
      return jobs.length >= 2;
    },
    get waiting() {
      return jobs.length === 1;
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
    async push<T>(job: Job<T>) {
      if (closed) {
        throw new Error("Throttle is closed");
      }

      const d = Promise.withResolvers<T>();
      jobs.push([d, job]);
      trigger();

      return d.promise;
    },
    clear() {
      jobs.forEach(([d]) => d.reject(THROTTLE_DROPPED));
      last = -Infinity;
      jobs.length = 0;
    },
  } satisfies JobHandler;
}

export function isDropped<T>(
  result: PromiseSettledResult<T>,
): result is PromiseRejectedResult {
  return result.status === "rejected" && result.reason === THROTTLE_DROPPED;
}

export function allButDropped<T extends Promise<unknown>[]>(promises: T) {
  return allFiltered(promises, (result) => !isDropped(result));
}
