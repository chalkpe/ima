export const byOrder = <T>(a: T, b: T, order: T[]) => order.indexOf(a) - order.indexOf(b)

export const isFalsy = <T>(value: T | null | undefined): value is null | undefined =>
  value === null || value === undefined

export const falsyFirst = <T>(a: T | null | undefined, b: T | null | undefined, compare: (a: T, b: T) => number) => {
  if (isFalsy(a) && isFalsy(b)) return 0
  if (isFalsy(a)) return -1
  if (isFalsy(b)) return 1
  return compare(a, b)
}

export const falsyLast = <T>(a: T | null, b: T | null, compare: (a: T, b: T) => number) => {
  if (isFalsy(a) && isFalsy(b)) return 0
  if (isFalsy(a)) return 1
  if (isFalsy(b)) return -1
  return compare(a, b)
}

export const compareArray = <T>(a: T[], b: T[], compare: (a: T, b: T) => number) => {
  if (a.length !== b.length) {
    return a.length - b.length
  }
  for (let i = 0; i < a.length; i++) {
    const result = compare(a[i], b[i])
    if (result !== 0) return result
  }
  return 0
}
