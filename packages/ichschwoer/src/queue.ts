import type { Job } from "./job.js";

/**
 * Create a queue object that executes Jobs pushed to it in order
 * while never exceeding the maxParallel amount (default: 1)
 */
export default function createQueue(maxParallel: number = 1) {
  let running = 0;
  let closed = false;
  const jobs: Job<any>[] = [];
  const onEmpty: (() => void)[] = [];

  const trigger = () => {
    if (running < maxParallel && jobs.length) {
      running++;
      const job = jobs.shift()!;
      job().finally(() => {
        running--;
        trigger();
      });
    } else if (!jobs.length && running === 0) {
      onEmpty.forEach((cb) => cb());
    }
  };

  return {
    get length() {
      return jobs.length + running;
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
    onEmpty(cb: () => void) {
      onEmpty.push(cb);

      return () => {
        onEmpty.splice(onEmpty.indexOf(cb), 1);
      };
    },
    push<T>(job: Job<T>): Promise<T> {
      if (closed) {
        throw new Error("Queue is closed");
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
