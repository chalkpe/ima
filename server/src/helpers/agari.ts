import { compareCode, tileToCode } from '@ima/server/helpers/code'
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
} from '@ima/server/helpers/tile'

import type { Machi, Tile, Tsu } from '@ima/server/types/tile'
import type { Code } from '@ima/server/types/code'
import type { AgariResult, AgariState, TenpaiState } from '@ima/server/types/agari'

export const tileSetToCode = (tileSet: Tsu | Machi): string => {
  return `<${tileSet.type}>` + tileSet.tiles.map(tileToCode).join('')
}

export const tenpaiStateToString = (state: TenpaiState): string => {
  return state
    .toSorted((a, b) => compareTiles(a.tiles, b.tiles))
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
    for (const [code, states] of Object.entries(r.tenpai)) {
      const existing = result.tenpai[code as Code] ?? []
      result.tenpai[code as Code] = [...existing, ...states]
        .map((state) => [tenpaiStateToString(state), state] as const)
        .filter((pair, index, array) => array.findIndex(([code]) => code === pair[0]) === index)
        .map(([, state]) => state)
    }

    result.tenpai = Object.fromEntries(
      Object.entries(result.tenpai).toSorted(([a], [b]) => compareCode(a as Code, b as Code))
    ) as AgariResult['tenpai']
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
      return Object.values(r.tenpai).every((states) =>
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
  result: AgariResult = { status: 'noten', state: [], agari: [], tenpai: {} as AgariResult['tenpai'] }
): AgariResult => {
  switch (hand.length) {
    case 0: {
      return { ...result, status: 'agari' }
    }
    case 1: {
      const [a] = hand
      if (
        result.state.some((tsu) => (tsu.type === 'koutsu' || tsu.type === 'toitsu') && isEqualTile(tsu.tiles[0], a))
      ) {
        return { ...result, status: 'noten' }
      }
      return {
        ...result,
        status: 'tenpai',
        state: [...result.state, { type: 'koritsu', tiles: [a] }],
        tenpai: Object.fromEntries([
          [tileToCode(a), [[...result.state, { type: 'tanki', tiles: [a] }]]],
        ]) as AgariResult['tenpai'],
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
            tenpai: Object.fromEntries([
              [tileToCode(a), [[...otherState, { type: 'shabo', tiles: [a, b] }, { type: 'shabo', tiles: [c, c] }]]],
              [tileToCode(c), [[...otherState, { type: 'shabo', tiles: [a, b] }, { type: 'shabo', tiles: [c, c] }]]],
            ]) as AgariResult['tenpai'],
          }
        }

        const state: AgariState = [...result.state, { type: 'toitsu', tiles: [a, b] }]
        if (
          state
            .filter((tsu) => tsu.type === 'toitsu')
            .some((toitsu, i, a) => a.findIndex((tsu) => isEqualTile(tsu.tiles[0], toitsu.tiles[0])) !== i)
        )
          return { ...result, status: 'noten' }

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
          tenpai: Object.fromEntries(
            machi.tiles.map((tile) => [tileToCode(tile), [[...result.state, { type: machi.type, tiles: [a, b] }]]])
          ) as AgariResult['tenpai'],
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
      if (Object.keys(result.tenpai).length) return { ...result, status: 'tenpai' }

      const ksTiles = kokushiTiles
        .map(simpleTileToTile)
        .map((ksTile) => [ksTile, removeTileFromHand(hand, ksTile, 2)[1]] as const)

      const zeroKsTiles = ksTiles.filter(([_, removed]) => removed.length === 0)
      const oneKsTiles = ksTiles.filter(([_, removed]) => removed.length === 1)
      const twoKsTiles = ksTiles.filter(([_, removed]) => removed.length === 2)

      if (zeroKsTiles.length === 0 && oneKsTiles.length === 12 && twoKsTiles.length === 1) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([_, [a]]) => ({ type: 'kokushi', tiles: [a] }) satisfies Tsu),
          ...twoKsTiles.map(([_, [a, b]]) => ({ type: 'toitsu', tiles: [a, b] }) satisfies Tsu),
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
          ...oneKsTiles.map(([_, [a]]) => ({ type: 'kokushi', tiles: [a] }) satisfies Tsu),
          ...twoKsTiles.map(([_, [a, b]]) => ({ type: 'toitsu', tiles: [a, b] }) satisfies Tsu),
        ]
        const last = zeroKsTiles[0][0]
        return {
          ...result,
          status: 'tenpai',
          state,
          tenpai: Object.fromEntries([
            [tileToCode(last), [[...state, { type: 'tanki', tiles: [last] }]]],
          ]) as AgariResult['tenpai'],
        }
      }

      if (zeroKsTiles.length === 0 && oneKsTiles.length === 13 && twoKsTiles.length === 0) {
        const state = [
          ...result.state,
          ...oneKsTiles.map(([_, [a]]) => ({ type: 'kokushi', tiles: [a] }) satisfies Tsu),
        ]
        return {
          ...result,
          status: 'tenpai',
          state,
          tenpai: Object.fromEntries(
            kokushiTiles.map((ksTile) => [tileToCode(ksTile), [[...state, { type: 'tanki', tiles: [ksTile] }]]])
          ) as AgariResult['tenpai'],
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
        Object.entries(result.tenpai)
          .toSorted(([a], [b]) => compareCode(a as Code, b as Code))
          .map(([code, states]) => code + ' => ' + states.map(tenpaiStateToString).join(' or '))
          .join(', ')
      )
    case 'noten':
      return 'noten'
  }
}

//1,2,4,5,7,8,10,11,13
