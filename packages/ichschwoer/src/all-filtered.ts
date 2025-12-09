const IGNORE = Symbol("IGNORE");

export default async function allFiltered<T extends Promise<unknown>[]>(
  promises: T,
  filter: (result: PromiseSettledResult<Awaited<T[number]>>) => boolean,
) {
  const results = await Promise.all(
    promises.map(async (p) => {
      try {
        const value = await p;
        if (
          !filter({ status: "fulfilled", value: value as Awaited<T[number]> })
        ) {
          return IGNORE;
        }
        return value;
      } catch (reason) {
        if (!filter({ status: "rejected", reason })) {
          return IGNORE;
        }
        throw reason;
      }
    }),
  );

  return results.filter((r): r is T => r !== IGNORE) as Awaited<T[number]>[];
}
