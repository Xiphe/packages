# ichschwoer

advanced promise utilities

## Install

```sh
npm i ichschwoer
```

## Usage

### `createQueue`

Executes jobs in order while never exceeding the maxParallel limit.

```ts
import { createQueue } from "ichschwoer";

const queue = createQueue(/* max parallel */ 2);
const lotsOfIds = [1, 2, 3, 4, 5];

// only 2 requests will be made at a time
await Promise.all(
  lotsOfIds.map((id) =>
    queue.push(() => fetch(`https://example.org/api/${id}`)),
  ),
);
```

### `createRateLimit`

Limits execution to max jobs within a time window.

```ts
import { createRateLimit } from "ichschwoer";

const rateLimit = createRateLimit(5, 1000); // max 5 jobs per second
const lotsOfIds = [1, 2, 3, 4, 5, 6, 7, 8];

// ensures no more than 5 requests are made per second
await Promise.all(
  lotsOfIds.map((id) =>
    rateLimit.push(() => fetch(`https://example.org/api/${id}`)),
  ),
);
```

### `createBatchResolve`

Artificially delays promises to resolve together after at least set ms.

```ts
import { createBatchResolve } from "ichschwoer";

const batch = createBatchResolve(500); // batch every 500ms
const lotsOfIds = [1, 2, 3, 4, 5];

// all requests are batched and resolve together after 500ms
await Promise.all(
  lotsOfIds.map((id) =>
    batch.push(() => fetch(`https://example.org/api/${id}`)),
  ),
);
```

### `createScatter`

Ensures all callbacks execute with at least set ms delay between them.

```ts
import { createScatter } from "ichschwoer";

const scatter = createScatter(100); // 100ms between executions
const lotsOfIds = [1, 2, 3, 4, 5];

// requests are executed with at least 100ms spacing between them
await Promise.all(
  lotsOfIds.map((id) =>
    scatter.push(() => fetch(`https://example.org/api/${id}`)),
  ),
);
```

### `createThrottle`

Drops jobs called earlier than windowMs from the last job execution.

```ts
import { createThrottle, THROTTLE_DROPPED } from "ichschwoer";

const throttle = createThrottle(1000); // 1 second window
const lotsOfIds = [1, 2, 3, 4, 5];

// rapid requests: only the last one executes, others may be dropped
const results = await Promise.all(
  lotsOfIds.map((id) =>
    throttle.push(() => fetch(`https://example.org/api/${id}`)),
  ),
);

// check which requests were dropped
results.forEach((result, index) => {
  if (result === THROTTLE_DROPPED) {
    console.log(`Request ${index} was dropped`);
  }
});
```

### `simulateProgress`

Simulates progress updates for a promise operation.

```ts
import { simulateProgress, mapProgressToEndless } from "ichschwoer";

const updateProgressBar = (progress: number) => {
  document.getElementById("progress").style.width = `${progress * 100}%`;
};

// show smooth progress even if the API call duration is unknown
const data = await simulateProgress(
  fetch("https://example.org/api/1"),
  // by default we reach 100% after the expected duration.
  // This slows down the progress to never reach 100%
  // until the operation is completed
  mapProgressToEndless(updateProgressBar),
  { expectedDurationMs: 3000, intervalMs: 50 },
);
```

### `withAbort`

Adds abort signal support to a promise.

```ts
import { withAbort } from "ichschwoer";

const controller = new AbortController();
const somePromise = new Promise((resolve) => setTimeout(resolve, 1000));
on("navigate-away", () => controller.abort());

try {
  const data = await withAbort(somePromise, controller.signal);
} catch (error) {
  if (error instanceof Error && error.name === "AbortError") {
    console.log("Request was cancelled");
  }
}
```

### `allFiltered`

Filters out settled promises that don't match the given filter.
While still failing fast on rejections that are not filtered out.

Note that compared to `Promise.all` the result size and therefore order can change.

```ts
import { allFiltered } from "ichschwoer";

const results = await allFiltered(
  [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
  /* Allow any rejection and any fulfilled value that is not 2 */
  (result) => result.status === "rejected" || result.value !== 2,
);
```

### JobHandlers

`createQueue`, `createRateLimit`, `createBatchResolve`, `createScatter`, `createThrottle` all satisfy the `JobHandler` interface.

```ts
import { JobHandler, createQueue } from "ichschwoer";

const jobHandler = createQueue() satisfies JobHandler;

/* Push jobs (or sometimes values) to the handler */
jobHandler.push(() => fetch("https://example.org/api/1"));

/* Reset/Clear the current list of jobs */
jobHandler.clear();

/* Get notified when all work is done */
const cleanup = jobHandler.onEmpty(() => console.log("empty"));

/* prevent further jobs from being added to the handler */
const allFinished = jobHandler.drain();

/* Throws because the handler is closed */
jobHandler.push(() => {});

/* resolves when all work is done (similar to onEmpty) */
await allFinished;
```

## WTF is that name?

"ich schwör" is german slang for "I do promise"
