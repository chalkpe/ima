import { TRPCError } from '@trpc/server'
import {
  onAfterAnkan,
  onAfterGakan,
  onAfterGiri,
  onAfterTsumo,
  onBeforeGiri,
  onBeforeTsumo,
  onHandChange,
} from '@ima/server/controllers/game/event'

import { partition } from '@ima/server/helpers/common'
import { calculateYaku, isNagashiMangan, isYakuOverShibari } from '@ima/server/helpers/yaku'
import { getClosedHand, getOpponent, getRiverEnd, isKuikae } from '@ima/server/helpers/game'
import { isEqualTile, isKoutsu, isSyuntsu, removeTileFromHand } from '@ima/server/helpers/tile'
import { createAgariScoreboard, createRyukyokuScoreboard } from '@ima/server/helpers/scoreboard'

import type { Tile, TileType } from '@ima/server/types/tile'
import type { GameState, PlayerType, WallType } from '@ima/server/types/game'

export const tsumo = async (state: GameState, me: PlayerType, from: WallType): Promise<'update' | 'end'> => {
  if (state.wall.doraCount === 5) {
    if (![me, getOpponent(me)].some((p) => state[p].hand.called.filter((set) => set.tiles.length === 4).length === 4)) {
      state.scoreboard = await createRyukyokuScoreboard(state, 'suukaikan')
      return 'end'
    }
  }

  if (state[me].hand.tsumo) {
    state[me].hand.closed.push(state[me].hand.tsumo)
    state[me].hand.tsumo = undefined
  }

  if (from === 'lingshang') {
    if (state.wall.doraCount === 5) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot tsumo now' })
    state.wall.doraCount += 1

    state[me].jun += 1
    state[me].hand.tsumo = state.wall.kingTiles.splice(0, 1)[0]
    state.wall.supplementTiles.push(state.wall.tiles.splice(-1, 1)[0])
  } else {
    if (state.wall.tiles.length === 0) {
      const nagashiMangan = [me, getOpponent(me)].filter((p) => isNagashiMangan(state, p))

      if (nagashiMangan.length % 2 === 0) {
        state.scoreboard = await createRyukyokuScoreboard(state, 'ryuukyoku')
      } else {
        state.scoreboard = createAgariScoreboard(state, nagashiMangan[0], state[nagashiMangan[0]].hand, 'tsumo', [
          { name: '유국만관', han: 5 },
        ])
      }
      return 'end'
    }

    state[me].jun += 1
    state[me].hand.tsumo = state.wall.tiles.splice(0, 1)[0]
  }

  await onAfterTsumo(state, me)
  return 'update'
}

export const ankan = async (state: GameState, me: PlayerType, type: TileType, value: number) => {
  const closedHand = getClosedHand(state[me].hand)
  const [ankanTiles, otherTiles] = partition(closedHand, (tile) => isEqualTile(tile, { type, value }))
  if (ankanTiles.length !== 4) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not sufficient' })

  state[me].decisions = []
  state[me].hand.closed = otherTiles
  state[me].hand.tsumo = undefined
  state[me].hand.called.push({ type: 'ankan', tiles: ankanTiles, jun: state[me].jun })

  await onAfterAnkan(state, me)
}

export const gakan = async (state: GameState, me: PlayerType, type: TileType, value: number) => {
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
  minkou.jun = state[me].jun
  state[me].hand.called = [...state[me].hand.called.filter((set) => set !== minkou), minkou]

  await onAfterGakan(state, me)
}

export const daiminkan = async (state: GameState, me: PlayerType) => {
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
  state[me].hand.called.push({
    type: 'daiminkan',
    tiles: [furoTile, ...removed],
    calledTile: furoTile,
    jun: state[opponent].jun,
  })

  await tsumo(state, me, 'lingshang')
}

export const pon = async (state: GameState, me: PlayerType, tatsu: [number, number]) => {
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
  state[me].hand.called.push({ type: 'pon', tiles, calledTile, jun: state[opponent].jun })
  state[me].hand.banned = remain.filter((tile) => isKuikae(state, me, tile)).map((tile) => tile.index)

  await onHandChange(state, me)
}

export const chi = async (state: GameState, me: PlayerType, tatsu: [number, number]) => {
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
  state[me].hand.called.push({ type: 'chi', tiles, calledTile, jun: state[opponent].jun })
  state[me].hand.banned = remain.filter((tile) => isKuikae(state, me, tile)).map((tile) => tile.index)

  await onHandChange(state, me)
}

export const skipAndTsumo = async (state: GameState, me: PlayerType): Promise<'update' | 'end'> => {
  if (!state[me].decisions.some((dec) => dec.type === 'skip_and_tsumo'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'No decisions' })

  return await tsumo(state, me, 'haiyama')
}

export const skipChankan = async (state: GameState, me: PlayerType) => {
  if (!state[me].decisions.some((dec) => dec.type === 'skip_chankan'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'No decisions' })

  state[me].decisions = []

  const opponent = getOpponent(me)
  state.turn = opponent
  await tsumo(state, opponent, 'lingshang')
}

export const callTsumo = async (state: GameState, me: PlayerType) => {
  const tsumo = state[me].decisions.find((dec) => dec.type === 'tsumo')
  if (!tsumo || !tsumo.tile) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No tsumo decision' })

  const yaku = await calculateYaku(state, me, state[me].hand, 'tsumo', tsumo.tile)
  if (!isYakuOverShibari(state, yaku)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No yaku or under shibari' })

  state[me].decisions = []
  state.scoreboard = createAgariScoreboard(state, me, state[me].hand, 'tsumo', yaku)
}

export const callRon = async (state: GameState, me: PlayerType) => {
  const ron = state[me].decisions.find((dec) => dec.type === 'ron')
  if (!ron || !ron.tile) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No ron decision' })

  const calledTile = ron.tile
  if (calledTile.type === 'back') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not visible' })

  const yaku = await calculateYaku(state, me, state[me].hand, 'ron', calledTile)
  if (!isYakuOverShibari(state, yaku)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No yaku or under shibari' })

  state[me].decisions = []
  state.scoreboard = createAgariScoreboard(state, me, { ...state[me].hand, tsumo: calledTile }, 'ron', yaku)
}

export const giri = async (state: GameState, me: PlayerType, index: number): Promise<'update' | 'end'> => {
  if (state[me].decisions.some((dec) => dec.type === 'skip_and_tsumo' || dec.type === 'skip_chankan'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions should be made' })

  if (state[me].riichi && state[me].hand.tsumo?.index !== index)
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Riichi only can discard tsumo' })

  const closedHand = getClosedHand(state[me].hand)
  const [tiles, remain] = partition(closedHand, (t) => t.index === index)
  if (!tiles.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })
  if (isKuikae(state, me, tiles[0])) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot kuikae' })

  await onBeforeGiri(state, me)

  const isRiichi = state[me].riichi !== null && !state[me].river.some((r) => r.isRiichi)
  state[me].river.push({ tile: tiles[0], isTsumogiri: state[me].hand.tsumo?.index === index, isRiichi })

  state[me].hand.closed = remain
  state[me].hand.tsumo = undefined
  state[me].hand.banned = []

  await onAfterGiri(state, me)
  return await onBeforeTsumo(state, getOpponent(me))
}

export const riichi = async (state: GameState, me: PlayerType, index: number): Promise<'riichi' | 'end'> => {
  if (state[me].riichi) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Riichi already declared' })

  const closedHand = getClosedHand(state[me].hand)
  const [tiles, remain] = partition(closedHand, (t) => t.index === index)
  if (!tiles.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })

  await onBeforeGiri(state, me)

  state.round.riichiSticks += 1
  state[me].score -= 1000
  state[me].riichi = state[me].jun
  state[me].river.push({ tile: tiles[0], isTsumogiri: state[me].hand.tsumo?.index === index, isRiichi: true })

  state[me].hand.closed = remain
  state[me].hand.tsumo = undefined

  await onAfterGiri(state, me)
  const result = await onBeforeTsumo(state, getOpponent(me))
  return result === 'update' ? 'riichi' : 'end'
}
