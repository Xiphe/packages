export type Job<T> = () => PromiseLike<T> | T;
export type Value<T> = Promise<T> | T;
export type JobHandler = {
  push<T>(job: Job<T>): Promise<T>;
  drain(): Promise<void>;
  onEmpty(callback: () => void): () => void;
  clear(): void;
} & Record<string, unknown>;
