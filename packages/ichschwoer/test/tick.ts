export function tick() {
  return new Promise((res) => setImmediate(res));
}
