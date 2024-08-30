import type { SimpleTile } from '../db'
import { Code, CodeSuffix, codeToTile, tileToCode } from './code'
import { isEqualTile, kokushiTiles, removeTileFromHand } from './common'

type SyuupaiType = 'man' | 'pin' | 'sou'
type SyuupaiValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

type ZihaiType = 'wind' | 'dragon'

export const syuupaiTypes: SimpleTile['type'][] = ['man', 'pin', 'sou'] satisfies SyuupaiType[]
export const syuupaiValues: SimpleTile['value'][] = [1, 2, 3, 4, 5, 6, 7, 8, 9] satisfies SyuupaiValue[]

export const zihaiTypes: SimpleTile['type'][] = ['wind', 'dragon'] satisfies ZihaiType[]


export const codeSuffixOrder: CodeSuffix[] = ['m', 'p', 's', 'z']

export const compareCode = (a: Code, b: Code): number => {
  return (
    codeSuffixOrder.indexOf(a[1] as CodeSuffix) - codeSuffixOrder.indexOf(b[1] as CodeSuffix) ||
    parseInt(a[0]) - parseInt(b[0])
  )
}



export const tileTypeOrder: SimpleTile['type'][] = ['man', 'pin', 'sou', 'wind', 'dragon', 'back']

export const compareTile = (a: SimpleTile, b: SimpleTile): number => {
  return tileTypeOrder.indexOf(a.type) - tileTypeOrder.indexOf(b.type) || a.value - b.value
}

export const compareTiles = (a: SimpleTile[], b: SimpleTile[]): number => {
  return a.length - b.length || a.reduce((res, tile, index) => res || compareTile(tile, b[index]), 0)
}

export const getLowerTile = (tile: SimpleTile): SimpleTile | undefined => {
  if (!syuupaiTypes.includes(tile.type)) return
  if (!syuupaiValues.includes(tile.value)) return
  if (tile.value === syuupaiValues[0]) return

  return { type: tile.type, value: tile.value - 1 }
}

export const getUpperTile = (tile: SimpleTile): SimpleTile | undefined => {
  if (!syuupaiTypes.includes(tile.type)) return
  if (!syuupaiValues.includes(tile.value)) return
  if (tile.value === syuupaiValues[syuupaiValues.length - 1]) return

  return { type: tile.type, value: tile.value + 1 }
}

type Koritsu = [SimpleTile]
type KoritsuType = 'koritsu' | 'kokushi'
type KoritsuMachiType = 'tanki'
type KoritsuMachi = { type: KoritsuMachiType; tiles: [SimpleTile] }

type Tatsu = [SimpleTile, SimpleTile]
type TatsuType = 'tatsu' | 'toitsu'
type TatsuMachiType = 'kanchan' | 'penchan' | 'ryanmen' | 'shabo'
type TatsuMachi = { type: TatsuMachiType; tiles: [SimpleTile] | [SimpleTile, SimpleTile] }

type MachiType = KoritsuMachiType | TatsuMachiType
type Machi = KoritsuMachi | TatsuMachi

export const getTatsuMachi = (tatsu: Tatsu): TatsuMachi | undefined => {
  const [a, b] = tatsu
  if (a.type !== b.type || a.value === b.value) return

  const [first, second] = a.value < b.value ? [a, b] : [b, a]
  const diff = second.value - first.value

  if (diff === 2) {
    const upper = getUpperTile(first)
    const lower = getLowerTile(second)

    if (!upper || !lower || !isEqualTile(upper, lower)) return
    return { type: 'kanchan', tiles: [upper] }
  }

  if (diff === 1) {
    const lower = getLowerTile(first)
    const upper = getUpperTile(second)

    if (lower && upper) return { type: 'ryanmen', tiles: [lower, upper] }
    if (lower) return { type: 'penchan', tiles: [lower] }
    if (upper) return { type: 'penchan', tiles: [upper] }
  }
}

type Mentsu = [SimpleTile, SimpleTile, SimpleTile]
type MentsuType = 'shuntsu' | 'koutsu'

export const getAllSyuntsu = (tile: SimpleTile): Mentsu[] => {
  const allSyuntsu: Mentsu[] = []

  const lower = getLowerTile(tile)
  const upper = getUpperTile(tile)

  if (lower) {
    const lowerLower = getLowerTile(lower)
    if (lowerLower) {
      allSyuntsu.push([lowerLower, lower, tile])
    }
  }

  if (upper && lower) {
    allSyuntsu.push([lower, tile, upper])
  }

  if (upper) {
    const upperUpper = getUpperTile(upper)
    if (upperUpper) {
      allSyuntsu.push([tile, upper, upperUpper])
    }
  }

  return allSyuntsu
}

type TileSet =
  | { type: KoritsuType; tiles: Koritsu }
  | { type: TatsuType; tiles: Tatsu }
  | { type: MentsuType; tiles: Mentsu }

export const tileSetToCode = (tileSet: TileSet | Machi): string => {
  return `<${tileSet.type}>` + tileSet.tiles.map(tileToCode).join('')
}

export const tenpaiStateToString = (state: TenpaiState): string => {
  return state
    .sort((a, b) => compareTiles(a.tiles, b.tiles))
    .map((tileSet) => tileSetToCode(tileSet))
    .join('')
}

type AgariState = TileSet[]
type TenpaiState = (TileSet | Machi)[]

interface AgariResult {
  status: 'agari' | 'tenpai' | 'noten'
  state: AgariState
  agari: AgariState[]
  tenpai: Map<Code, TenpaiState[]>
}

export const mergeAgariResults = (result: AgariResult, r: AgariResult) => {
  result.status = r.status

  if (result.agari !== r.agari) {
    result.agari = [...result.agari, ...r.agari]
      .map((state) => [tenpaiStateToString(state), state] as const)
      .filter((pair, index, array) => array.findIndex(([code]) => code === pair[0]) === index)
      .map(([, state]) => state)
  }

  if (result.tenpai !== r.tenpai) {
    for (const [code, states] of r.tenpai) {
      const existing = result.tenpai.get(code) ?? []
      result.tenpai.set(
        code,
        [...existing, ...states]
          .map((state) => [tenpaiStateToString(state), state] as const)
          .filter((pair, index, array) => array.findIndex(([code]) => code === pair[0]) === index)
          .map(([, state]) => state)
      )
    }

    result.tenpai = new Map([...result.tenpai.entries()].sort(([a], [b]) => compareCode(a, b)))
  }
}

export const isAgariResultValid = (r: AgariResult): boolean => {
  const one = r.state.filter((tileSet) => tileSet.tiles.length === 1)
  const two = r.state.filter((tileSet) => tileSet.tiles.length === 2)
  const three = r.state.filter((tileSet) => tileSet.tiles.length === 3)

  switch (r.status) {
    case 'agari':
      return one.length === 0 && (three.length === 0 || two.length <= 1)
    case 'tenpai':
      if (two.length === 6) return one.length === 1 && three.length === 0
      if (three.length === 4) return one.length === 1 && two.length === 0
      if (three.length === 3) return one.length === 0 && two.length === 2
      return two.length <= 2
    case 'noten':
      return false
  }
}

export const calculateAgari = (
  hand: SimpleTile[],
  result: AgariResult = { status: 'noten', state: [], agari: [], tenpai: new Map() }
): AgariResult => {
  switch (hand.length) {
    case 0: {
      return { ...result, status: 'agari' }
    }
    case 1: {
      const [a] = hand
      if (result.state.some((state) => state.type === 'koutsu' && isEqualTile(state.tiles[0], a))) {
        return { ...result, status: 'noten' }
      }
      return {
        ...result,
        status: 'tenpai',
        state: [...result.state, { type: 'koritsu', tiles: [a] }],
        tenpai: new Map([[tileToCode(a), [[...result.state, { type: 'tanki', tiles: [a] }]]]]),
      }
    }
    case 2: {
      const [a, b] = hand
      if (isEqualTile(a, b)) {
        const toitsuState = result.state.filter((state) => state.type === 'toitsu')
        const otherState = result.state.filter((state) => state.type !== 'toitsu')

        if (toitsuState.length === 1) {
          const c = toitsuState[0].tiles[0]
          return {
            ...result,
            status: 'tenpai',
            tenpai: new Map([
              [tileToCode(a), [[...otherState, { type: 'shabo', tiles: [a, b] }, { type: 'shabo', tiles: [c, c] }]]],
              [tileToCode(c), [[...otherState, { type: 'shabo', tiles: [a, b] }, { type: 'shabo', tiles: [c, c] }]]],
            ]),
          }
        }

        const state: AgariState = [...result.state, { type: 'toitsu', tiles: [a, b] }]
        return {
          ...result,
          status: 'agari',
          state,
          agari: [state],
        }
      }

      const machi = getTatsuMachi([a, b])
      if (machi) {
        return {
          ...result,
          status: 'tenpai',
          state: [...result.state, { type: 'tatsu', tiles: [a, b] }],
          tenpai: new Map(
            machi.tiles.map((tile) => [tileToCode(tile), [[...result.state, { type: machi.type, tiles: [a, b] }]]])
          ),
        }
      } else {
        return { ...result, status: 'noten' }
      }
    }
    default: {
      const checked = new Set<Code>()

      for (const tile of hand) {
        if (checked.has(tileToCode(tile))) continue
        checked.add(tileToCode(tile))

        const [rest, removed] = removeTileFromHand(hand, tile, 3)
        if (removed.length === 3) {
          const r = calculateAgari(rest, {
            ...result,
            state: [...result.state, { type: 'koutsu', tiles: [removed[0], removed[1], removed[2]] }],
          })
          if (isAgariResultValid(r)) mergeAgariResults(result, r)
        }
        if (removed.length === 2) {
          const r = calculateAgari(rest, {
            ...result,
            state: [...result.state, { type: 'toitsu', tiles: [removed[0], removed[1]] }],
          })
          if (isAgariResultValid(r)) mergeAgariResults(result, r)
        }

        for (const syuntsu of getAllSyuntsu(tile)) {
          const [rest, removed] = removeTileFromHand(hand, syuntsu[0], 1)
          const [rest2, removed2] = removeTileFromHand(rest, syuntsu[1], 1)
          const [rest3, removed3] = removeTileFromHand(rest2, syuntsu[2], 1)
          if (removed.length === 1 && removed2.length === 1 && removed3.length === 1) {
            const r = calculateAgari(rest3, {
              ...result,
              state: [...result.state, { type: 'shuntsu', tiles: [removed[0], removed2[0], removed3[0]] }],
            })
            if (isAgariResultValid(r)) mergeAgariResults(result, r)
          }
        }
      }

      if (result.agari.length) return { ...result, status: 'agari' }
      if (result.tenpai.size) return { ...result, status: 'tenpai' }

      const ksTiles = kokushiTiles.map((ksTile) => [ksTile, removeTileFromHand(hand, ksTile, 2)[1]] as const)

      const zeroKsTiles = ksTiles.filter(([_, removed]) => removed.length === 0)
      const oneKsTiles = ksTiles.filter(([_, removed]) => removed.length === 1)
      const twoKsTiles = ksTiles.filter(([_, removed]) => removed.length === 2)

      if (zeroKsTiles.length === 0 && oneKsTiles.length === 12 && twoKsTiles.length === 1) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([ksTile]) => ({ type: 'kokushi', tiles: [ksTile] } satisfies TileSet)),
          ...twoKsTiles.map(([ksTile]) => ({ type: 'toitsu', tiles: [ksTile, ksTile] } satisfies TileSet)),
        ]

        return {
          ...result,
          status: 'agari',
          state,
          agari: [state],
        }
      }

      if (zeroKsTiles.length === 1 && oneKsTiles.length === 11 && twoKsTiles.length === 1) {
        const last = zeroKsTiles[0][0]
        const state = [
          ...result.state,
          ...oneKsTiles.map(([ksTile]) => ({ type: 'kokushi', tiles: [ksTile] } satisfies TileSet)),
          ...twoKsTiles.map(([ksTile]) => ({ type: 'toitsu', tiles: [ksTile, ksTile] } satisfies TileSet)),
        ]

        return {
          ...result,
          status: 'tenpai',
          state,
          tenpai: new Map([[tileToCode(last), [state]]]),
        }
      }

      if (zeroKsTiles.length === 0 && oneKsTiles.length === 13 && twoKsTiles.length === 0) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([ksTile]) => ({ type: 'kokushi', tiles: [ksTile] } satisfies TileSet)),
        ]

        return {
          ...result,
          status: 'tenpai',
          state,
          tenpai: new Map(kokushiTiles.map((ksTile) => [tileToCode(ksTile), [state]])),
        }
      }

      return { ...result, status: 'noten' }
    }
  }
}

export const agariResultToString = (result: AgariResult): string => {
  switch (result.status) {
    case 'agari':
      return 'agari: ' + result.agari.map(tenpaiStateToString).join(',')
    case 'tenpai':
      return (
        'tenpai: ' +
        [...result.tenpai.entries()]
          .sort(([a], [b]) => compareCode(a, b))
          .map(([code, states]) => code + ' => ' + states.map(tenpaiStateToString).join(' or '))
          .join(', ')
      )
    case 'noten':
      return 'noten'
  }
}

//1,2,4,5,7,8,10,11,13
