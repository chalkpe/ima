import { compareCode, tileToCode } from './code'
import {
  compareTiles,
  getAllSyuntsu,
  getTatsuMachi,
  isEqualTile,
  isMachiType,
  kokushiTiles,
  removeTileFromHand,
  removeTilesFromHand,
  simpleTileToTile,
} from './tile'

import type { Machi, MachiType, SimpleTile, Tile, Tsu } from '../types/tile'
import type { Code } from '../types/code'
import type { AgariResult, AgariState, TenpaiState } from '../types/agari'

export const tileSetToCode = (tileSet: Tsu | Machi): string => {
  return `<${tileSet.type}>` + tileSet.tiles.map(tileToCode).join('')
}

export const tenpaiStateToString = (state: TenpaiState): string => {
  return state
    .sort((a, b) => compareTiles(a.tiles, b.tiles))
    .map((tileSet) => tileSetToCode(tileSet))
    .join('')
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
  switch (r.status) {
    case 'agari':
      return r.agari.every((agari) => {
        const one = agari.filter((set) => set.tiles.length === 1)
        const two = agari.filter((set) => set.tiles.length === 2)
        const three = agari.filter((set) => set.tiles.length === 3)
        return one.length === 0 && ((two.length === 7 && three.length === 0) || two.length <= 1)
      })
    case 'tenpai':
      return [...r.tenpai.values()].every((states) =>
        states.every((state) => {
          const machi = state.filter((set) => isMachiType(set.type))
          const toitsu = state.filter((set) => set.type === 'toitsu')
          return [1, 2].includes(machi.length) && [0, 1, 6].includes(toitsu.length)
        })
      )
    case 'noten':
      return false
  }
}

export const calculateAgari = (
  hand: Tile[],
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
          if (isEqualTile(a, c)) return { ...result, status: 'noten' }

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

        const [restK, koutsu] = removeTileFromHand(hand, tile, 3)
        if (koutsu.length === 3) {
          const r = calculateAgari(restK, {
            ...result,
            state: [...result.state, { type: 'koutsu', tiles: [koutsu[0], koutsu[1], koutsu[2]] }],
          })
          if (isAgariResultValid(r)) mergeAgariResults(result, r)
        }

        const [restT, toitsu] = removeTileFromHand(hand, tile, 2)
        if (toitsu.length === 2) {
          const r = calculateAgari(restT, {
            ...result,
            state: [...result.state, { type: 'toitsu', tiles: [toitsu[0], toitsu[1]] }],
          })
          if (isAgariResultValid(r)) mergeAgariResults(result, r)
        }

        for (const syuntsu of getAllSyuntsu(tile)) {
          const [rest, removed] = removeTilesFromHand(
            hand,
            syuntsu.map((t) => [t, 1])
          )
          if (removed.every((r) => r.length === 1)) {
            const r = calculateAgari(rest, {
              ...result,
              state: [...result.state, { type: 'shuntsu', tiles: [removed[0][0], removed[1][0], removed[2][0]] }],
            })
            if (isAgariResultValid(r)) mergeAgariResults(result, r)
          }
        }
      }

      if (result.agari.length) return { ...result, status: 'agari' }
      if (result.tenpai.size) return { ...result, status: 'tenpai' }

      const ksTiles = kokushiTiles
        .map(simpleTileToTile)
        .map((ksTile) => [ksTile, removeTileFromHand(hand, ksTile, 2)[1]] as const)

      const zeroKsTiles = ksTiles.filter(([_, removed]) => removed.length === 0)
      const oneKsTiles = ksTiles.filter(([_, removed]) => removed.length === 1)
      const twoKsTiles = ksTiles.filter(([_, removed]) => removed.length === 2)

      if (zeroKsTiles.length === 0 && oneKsTiles.length === 12 && twoKsTiles.length === 1) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([_, [a]]) => ({ type: 'kokushi', tiles: [a] } satisfies Tsu)),
          ...twoKsTiles.map(([_, [a, b]]) => ({ type: 'toitsu', tiles: [a, b] } satisfies Tsu)),
        ]

        return {
          ...result,
          status: 'agari',
          state,
          agari: [state],
        }
      }

      if (zeroKsTiles.length === 1 && oneKsTiles.length === 11 && twoKsTiles.length === 1) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([_, [a]]) => ({ type: 'kokushi', tiles: [a] } satisfies Tsu)),
          ...twoKsTiles.map(([_, [a, b]]) => ({ type: 'toitsu', tiles: [a, b] } satisfies Tsu)),
        ]
        const last = zeroKsTiles[0][0]
        return {
          ...result,
          status: 'tenpai',
          state,
          tenpai: new Map([[tileToCode(last), [[...state, { type: 'tanki', tiles: [last] }]]]]),
        }
      }

      if (zeroKsTiles.length === 0 && oneKsTiles.length === 13 && twoKsTiles.length === 0) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([_, [a]]) => ({ type: 'kokushi', tiles: [a] } satisfies Tsu)),
        ]
        return {
          ...result,
          status: 'tenpai',
          state,
          tenpai: new Map(
            kokushiTiles.map((ksTile) => [tileToCode(ksTile), [[...state, { type: 'tanki', tiles: [ksTile] }]]])
          ),
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
