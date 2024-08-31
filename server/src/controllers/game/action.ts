import { TRPCError } from '@trpc/server'
import {
  onAfterAnkan,
  onAfterGakan,
  onAfterGiri,
  onAfterTsumo,
  onBeforeGiri,
  onBeforeTsumo,
  onHandChange,
} from './event'

import { partition } from '../../helpers/common'
import { getClosedHand, getOpponent, getRiverEnd } from '../../helpers/game'
import {
  compareTile,
  getUpperTile,
  isEqualTile,
  isKoutsu,
  isSyuntsu,
  removeTileFromHand,
  removeTilesFromHand,
} from '../../helpers/tile'

import type { SimpleTile, Tile, TileType } from '../../types/tile'
import type { GameState, PlayerType, WallType } from '../../types/game'

export const tsumo = (state: GameState, me: PlayerType, from: WallType) => {
  if (state[me].hand.tsumo) {
    state[me].hand.closed.push(state[me].hand.tsumo)
    state[me].hand.tsumo = undefined
  }

  if (from === 'lingshang') {
    if (state.wall.doraCount === 4) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot tsumo now' })
    state.wall.doraCount += 1

    state[me].hand.tsumo = state.wall.kingTiles.splice(0, 1)[0]
    state.wall.supplementTiles.push(state.wall.tiles.splice(-1, 1)[0])
  } else {
    state[me].hand.tsumo = state.wall.tiles.splice(0, 1)[0]
  }

  onAfterTsumo(state, me)
}

export const ankan = (state: GameState, me: PlayerType, type: TileType, value: number) => {
  const closedHand = getClosedHand(state[me].hand)
  const [ankanTiles, otherTiles] = partition(closedHand, (tile) => isEqualTile(tile, { type, value }))
  if (ankanTiles.length !== 4) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

  state[me].decisions = []
  state[me].hand.closed = otherTiles
  state[me].hand.tsumo = undefined
  state[me].hand.called.push({ type: 'ankan', tiles: ankanTiles })

  onAfterAnkan(state, me)
}

export const gakan = (state: GameState, me: PlayerType, type: TileType, value: number) => {
  const closedHand = getClosedHand(state[me].hand)

  const [gakanTiles, otherTiles] = partition(closedHand, (tile) => isEqualTile(tile, { type, value }))
  if (gakanTiles.length !== 1) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

  const gakanTile = gakanTiles[0]
  const minkou = state[me].hand.called.find(
    (set) => set.type === 'pon' && set.calledTile && isEqualTile(set.calledTile, gakanTile)
  )
  if (!minkou) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pon not found' })

  state[me].decisions = []
  state[me].hand.closed = otherTiles
  state[me].hand.tsumo = undefined

  minkou.type = 'gakan'
  minkou.tiles.push(gakanTile)
  minkou.calledTile = gakanTile

  onAfterGakan(state, me)
}

export const daiminkan = (state: GameState, me: PlayerType) => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])
  if (!riverEnd) throw new TRPCError({ code: 'BAD_REQUEST', message: 'River empty' })

  const furoTile = riverEnd.tile
  if (furoTile.type === 'back') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not visible' })

  const [remain, removed] = removeTileFromHand(state[me].hand.closed, furoTile, 3)
  if (removed.length !== 3) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

  state[opponent].river.splice(-1, 1)
  state[me].decisions = []
  state[me].hand.closed = remain
  state[me].hand.called.push({ type: 'daiminkan', tiles: [furoTile, ...removed], calledTile: furoTile })

  tsumo(state, me, 'lingshang')
}

export const pon = (state: GameState, me: PlayerType, tatsu: [number, number]) => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])
  if (!riverEnd) throw new TRPCError({ code: 'BAD_REQUEST', message: 'River empty' })

  const calledTile = riverEnd.tile
  if (calledTile.type === 'back') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not visible' })

  const a = state[me].hand.closed.find((tile) => tile.index === tatsu[0])
  const b = state[me].hand.closed.find((tile) => tile.index === tatsu[1])
  if (!a || !b) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })

  const tiles = [calledTile, a, b] as [Tile, Tile, Tile]
  if (!isKoutsu(tiles)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not valid' })

  const remain = state[me].hand.closed.filter((tile) => !tatsu.includes(tile.index))

  state[me].decisions = []
  state[opponent].river.splice(-1, 1)
  state[me].hand.closed = remain
  state[me].hand.called.push({ type: 'pon', tiles, calledTile })

  onHandChange(state, me)
}

export const chi = (state: GameState, me: PlayerType, tatsu: [number, number]) => {
  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])
  if (!riverEnd) throw new TRPCError({ code: 'BAD_REQUEST', message: 'River empty' })

  const calledTile = riverEnd.tile
  if (calledTile.type === 'back') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not visible' })

  const a = state[me].hand.closed.find((tile) => tile.index === tatsu[0])
  const b = state[me].hand.closed.find((tile) => tile.index === tatsu[1])
  if (!a || !b) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })

  const tiles = [calledTile, a, b] as [Tile, Tile, Tile]
  if (!isSyuntsu(tiles)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not valid' })

  const remain = state[me].hand.closed.filter((tile) => !tatsu.includes(tile.index))

  state[me].decisions = []
  state[opponent].river.splice(-1, 1)
  state[me].hand.closed = remain
  state[me].hand.called.push({ type: 'chi', tiles, calledTile })

  onHandChange(state, me)
}

export const skipAndTsumo = (state: GameState, me: PlayerType) => {
  if (!state[me].decisions.some((dec) => dec.type === 'skip_and_tsumo'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions cannot be skipped' })

  tsumo(state, me, 'haiyama')
}

export const skipChankan = (state: GameState, me: PlayerType) => {
  if (!state[me].decisions.some((dec) => dec.type === 'skip_chankan'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions cannot be skipped' })

  state[me].decisions = []

  const opponent = getOpponent(me)
  state.turn = opponent
  tsumo(state, opponent, 'lingshang')
}

export const giri = (state: GameState, me: PlayerType, index: number) => {
  if (state[me].decisions.some((dec) => dec.type === 'skip_and_tsumo' || dec.type === 'skip_chankan'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions should be made' })

  const opponent = getOpponent(me)
  onBeforeGiri(state, me)

  const { tsumo } = state[me].hand
  if (index === -1) {
    if (!tsumo) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tsumo not found' })
    state[me].river.push({ tile: tsumo, isTsumogiri: true, isRiichi: false })
  } else {
    const tile = state[me].hand.closed.splice(index, 1)[0]
    if (!tile) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })
    state[me].river.push({ tile, isTsumogiri: false, isRiichi: false })
    if (tsumo) state[me].hand.closed.push(tsumo)
  }

  onAfterGiri(state, me)
  onBeforeTsumo(state, opponent)
}
