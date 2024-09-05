import {
  Code,
  CodeSuffix,
  SyuuhaiCodeNumber,
  SyuupaiCodeSuffix,
  ZihaiCodeNumber,
  ZihaiCodeSuffix,
} from '@ima/server/types/code'
import { SimpleTile } from '@ima/server/types/tile'

export const backTile: SimpleTile = { type: 'back', value: 0 }
export const backTileCode: Code = '0z'

const typeSuffixMap: Record<SimpleTile['type'], CodeSuffix> = {
  man: 'm',
  pin: 'p',
  sou: 's',
  wind: 'z',
  dragon: 'z',
  back: 'z',
}
const suffixTypeMap: Record<CodeSuffix, SimpleTile['type'] | Record<ZihaiCodeNumber, SimpleTile['type']>> = {
  m: 'man',
  p: 'pin',
  s: 'sou',
  z: { '0': 'back', '1': 'wind', '2': 'wind', '3': 'wind', '4': 'wind', '5': 'dragon', '6': 'dragon', '7': 'dragon' },
}

const valueBaseMap: Record<SimpleTile['type'], number> = {
  man: 0,
  pin: 0,
  sou: 0,
  wind: 0,
  dragon: 4,
  back: 0,
}

const isSyuuhaiCodeNumber = (number: string): number is SyuuhaiCodeNumber =>
  ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(number)
const isZihaiCodeNumber = (number: string): number is ZihaiCodeNumber =>
  ['0', '1', '2', '3', '4', '5', '6', '7'].includes(number)

const isSyuuhaiSuffix = (suffix: CodeSuffix): suffix is SyuupaiCodeSuffix => ['m', 'p', 's'].includes(suffix)
const isZihaiSuffix = (suffix: CodeSuffix): suffix is ZihaiCodeSuffix => suffix === 'z'

export const tileToCode = (tile: SimpleTile): Code => {
  const number = (valueBaseMap[tile.type] + tile.value).toString()
  const suffix = typeSuffixMap[tile.type]

  if (isSyuuhaiCodeNumber(number) && isSyuuhaiSuffix(suffix)) return `${number}${suffix}`
  if (isZihaiCodeNumber(number) && isZihaiSuffix(suffix)) return `${number}${suffix}`

  /* istanbul ignore next */
  return backTileCode
}

export const codeToTile = (code: Code): SimpleTile => {
  const number = code[0]
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

export const codeSuffixOrder: CodeSuffix[] = ['m', 'p', 's', 'z']

export const compareCode = (a: Code, b: Code): number => {
  return (
    codeSuffixOrder.indexOf(a[1] as CodeSuffix) - codeSuffixOrder.indexOf(b[1] as CodeSuffix) ||
    parseInt(a[0]) - parseInt(b[0])
  )
}
