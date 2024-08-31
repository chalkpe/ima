export const partition = <T>(arr: T[], predicate: (t: T) => boolean) => [
  arr.filter(predicate),
  arr.filter((t) => !predicate(t)),
]

