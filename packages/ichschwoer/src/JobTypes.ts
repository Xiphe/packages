export type Job<T> = () => PromiseLike<T> | T;
export type Value<T> = Promise<T> | T;
export type JobHandler<
  Subject extends "job" | "value" = "job",
  InternalReturn = never,
> = {
  push<T>(
    job: Subject extends "job" ? Job<T> : Value<T>,
  ): Promise<T | InternalReturn>;
  drain(): Promise<void>;
  onEmpty(callback: () => void): () => void;
  clear(): void;
} & Record<string, unknown>;
