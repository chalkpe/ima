import { TRPCError } from '@trpc/server'
import { GameState, PlayerType, TileType, WallType } from '../../db'
import { onAfterAnkan, onAfterGiri, onAfterTsumo, onBeforeGiri, onBeforeTsumo } from './event'
import { getClosedHand, getOpponent, isEqualTile, partition, removeTileFromHand } from '../../helpers/common'

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

  state[me].hand.closed = otherTiles
  state[me].hand.tsumo = undefined
  state[me].hand.called.push({ type: 'ankan', tiles: ankanTiles })

  onAfterAnkan(state, me)
}

export const pon = (state: GameState, me: PlayerType) => {
  const opponent = getOpponent(me)

  const opponentRiver = state[opponent].river
  if (opponentRiver.length === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'River empty' })

  const furoTile = opponentRiver[opponentRiver.length - 1].tile
  if (furoTile.type === 'back') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not visible' })

  const [remain, removed] = removeTileFromHand(state[me].hand.closed, furoTile, 2)
  if (removed.length !== 2) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

  state[opponent].river.splice(-1, 1)
  state[me].hand.closed = remain
  state[me].hand.called.push({ type: 'pon', tiles: [furoTile, ...removed], calledTile: furoTile })

  state[me].decisions = []
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
