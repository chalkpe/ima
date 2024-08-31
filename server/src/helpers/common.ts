export const partition = <T>(arr: T[], predicate: (t: T) => boolean) => [
  arr.filter(predicate),
  arr.filter((t) => !predicate(t)),
]

export const combination = <T>(array: T[]) => array.flatMap((v, i) => array.slice(i + 1).map((w) => [v, w]))

export const combinations = <T>(sets: T[][]): T[][] => {
  if (sets.length === 1) return sets[0].map((el) => [el])
  return sets[0].flatMap((v) => combinations(sets.slice(1)).map((c) => [v, ...c]))
}
