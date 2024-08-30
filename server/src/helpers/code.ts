import type { SimpleTile } from '../db'

export type SyuupaiCodeSuffix = 'm' | 'p' | 's'
export type SyuuhaiCodeNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type ZihaiCodeSuffix = 'z'
export type ZihaiCodeNumber = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type CodeSuffix = SyuupaiCodeSuffix | ZihaiCodeSuffix
export type CodeNumber = SyuuhaiCodeNumber | ZihaiCodeNumber

export type Code = `${SyuuhaiCodeNumber}${SyuupaiCodeSuffix}` | `${ZihaiCodeNumber}${ZihaiCodeSuffix}`

export const backTile = { type: 'back', value: 0 } satisfies SimpleTile
export const backTileCode = '0z' satisfies Code

export const typeSuffixMap: Record<SimpleTile['type'], CodeSuffix> = {
  man: 'm',
  pin: 'p',
  sou: 's',
  wind: 'z',
  dragon: 'z',
  back: 'z',
}
export const suffixTypeMap: Record<CodeSuffix, SimpleTile['type'] | Record<ZihaiCodeNumber, SimpleTile['type']>> = {
  m: 'man',
  p: 'pin',
  s: 'sou',
  z: { '0': 'back', '1': 'wind', '2': 'wind', '3': 'wind', '4': 'wind', '5': 'dragon', '6': 'dragon', '7': 'dragon' },
}

export const valueBaseMap: Record<SimpleTile['type'], number> = {
  man: 0,
  pin: 0,
  sou: 0,
  wind: 0,
  dragon: 4,
  back: 0,
}

export const isSyuuhaiCodeNumber = (number: string): number is SyuuhaiCodeNumber =>
  ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(number)
export const isZihaiCodeNumber = (number: string): number is ZihaiCodeNumber =>
  ['0', '1', '2', '3', '4', '5', '6', '7'].includes(number)

export const isSyuuhaiSuffix = (suffix: CodeSuffix): suffix is SyuupaiCodeSuffix => ['m', 'p', 's'].includes(suffix)
export const isZihaiSuffix = (suffix: CodeSuffix): suffix is ZihaiCodeSuffix => suffix === 'z'

export const tileToCode = (tile: SimpleTile): Code => {
  const number = (valueBaseMap[tile.type] + tile.value).toString()
  const suffix = typeSuffixMap[tile.type]

  if (isSyuuhaiCodeNumber(number) && isSyuuhaiSuffix(suffix)) return `${number}${suffix}`
  if (isZihaiCodeNumber(number) && isZihaiSuffix(suffix)) return `${number}${suffix}`

  /* istanbul ignore next */
  return backTileCode
}

export const codeToTile = (code: Code): SimpleTile => {
  const number = code[0] as CodeNumber
  const suffix = code[1] as CodeSuffix

  const maybeType = suffixTypeMap[suffix]
  if (isZihaiSuffix(suffix) && isZihaiCodeNumber(number) && typeof maybeType !== 'string') {
    const type = maybeType[number]
    return { type, value: parseInt(number) - valueBaseMap[type] }
  }
  if (isSyuuhaiSuffix(suffix) && isSyuuhaiCodeNumber(number) && typeof maybeType === 'string') {
    const type = maybeType
    return { type, value: parseInt(number) - valueBaseMap[type] }
  }

  /* istanbul ignore next */
  return backTile
}

export const codeSyntaxToHand = (syntax: string): SimpleTile[] => {
  return [...syntax.matchAll(/(\d)(?=\d*([mpsz]))/g)].map((m) => codeToTile(`${m[1]}${m[2]}` as Code))
}
