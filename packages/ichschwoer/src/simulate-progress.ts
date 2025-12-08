export type SimulateProgressOptions = {
  /**
   * How long do we expect the operation to take normally?
   * Will be used to calculate the step size.
   * @default 1000
   */
  expectedDurationMs?: number;
  /**
   * How often should we update the progress?
   * @default 100
   */
  intervalMs?: number;
};

export type ProgressHandler = (progress: number, uncapped: number) => void;

export default async function simulateProgress<T>(
  promise: Promise<T>,
  onProgress: ProgressHandler,
  { expectedDurationMs = 1000, intervalMs = 100 }: SimulateProgressOptions = {},
): Promise<T> {
  let progress = 0;

  const expectedSteps = Math.max(
    1,
    Math.floor(expectedDurationMs / intervalMs),
  );
  const stepSize = 1 / expectedSteps;

  const i = setInterval(() => {
    progress += stepSize;
    onProgress(Math.min(1, progress), progress);
  }, intervalMs);

  try {
    return await promise;
  } finally {
    clearInterval(i);
    onProgress(1, Infinity);
  }
}

/**
 * Scale the progress towards a target progress.
 */
export function towards(
  targetProgress: number,
  callback: ProgressHandler,
): ProgressHandler {
  return (progress, uncapped) =>
    callback(progress * targetProgress, uncapped * targetProgress);
}

/**
 * Create a progress handler that grows endlessly
 * using a dampened hyperbolic curve to slow down.
 */
export function endless(callback: ProgressHandler): ProgressHandler {
  return (progress, uncapped) =>
    callback(
      uncapped === Infinity ? progress : dampenedHyperbolic(uncapped),
      uncapped,
    );
}

/**
 * Dampened hyperbolic function.
 *
 * @see https://www.desmos.com/calculator/irwmspbofr
 * @returns
 */
export function dampenedHyperbolic(x: number) {
  const a = 1.11;
  const b = 0.225;
  const c = 0.55;
  return (
    b * (x + 1 - Math.sqrt((x - 1) ** 2 + c)) +
    (0.5 + (0.25 - b) * 2) * (x / (x + a))
  );
}
