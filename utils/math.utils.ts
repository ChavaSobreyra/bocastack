export function sum(...a: number[]): number {
  return Array.prototype.reduce.call(a, (a, b) => a + b)
}

export function avg(...a: number[]): number {
  return sum(...a) / a.length
}
