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
import { getClosedHand, getDoraTiles, getOpponent, getRiverEnd, getUraDoraTiles } from '../../helpers/game'
import { isEqualTile, isKoutsu, isSyuntsu, removeTileFromHand } from '../../helpers/tile'

import type { Tile, TileType } from '../../types/tile'
import type { GameState, PlayerType, WallType } from '../../types/game'
import { calculateYaku } from '../../helpers/yaku'
import { calculateTenpai } from '../../helpers/tenpai'

export const tsumo = (state: GameState, me: PlayerType, from: WallType) => {
  if (state[me].hand.tsumo) {
    state[me].hand.closed.push(state[me].hand.tsumo)
    state[me].hand.tsumo = undefined
  }

  if (from === 'lingshang') {
    if (state.wall.doraCount === 4) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot tsumo now' })
    state.wall.doraCount += 1

    state[me].jun += 1
    state[me].hand.tsumo = state.wall.kingTiles.splice(0, 1)[0]
    state.wall.supplementTiles.push(state.wall.tiles.splice(-1, 1)[0])
  } else {
    if (state.wall.tiles.length === 0) {
      state.scoreboard = {
        type: 'ryuukyoku',
        hostConfirmed: false,
        guestConfirmed: false,
        tenpai: (['host', 'guest'] as const).filter(
          (p) => calculateTenpai(state, p, state[p].hand, null) !== undefined
        ),
      }
      return
    }

    state[me].jun += 1
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
  state[me].hand.called.push({ type: 'ankan', tiles: ankanTiles, jun: state[me].jun })

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
  state[me].hand.called.push({
    type: 'daiminkan',
    tiles: [furoTile, ...removed],
    calledTile: furoTile,
    jun: state[me].jun,
  })

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
  state[me].hand.called.push({ type: 'pon', tiles, calledTile, jun: state[me].jun })

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
  state[me].hand.called.push({ type: 'chi', tiles, calledTile, jun: state[me].jun })

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

const eastScoreTable = [0, 1500, 2900, 5800, 11600, 12000, 18000, 18000, 24000, 24000, 24000, 36000, 36000, 48000]
const westScoreTable = [0, 1000, 2000, 3900, 7700, 8000, 12000, 12000, 16000, 16000, 16000, 24000, 24000, 32000]

export const callTsumo = (state: GameState, me: PlayerType) => {
  if (!state[me].decisions.some((dec) => dec.type === 'tsumo'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'No tsumo decision' })

  if (!state[me].hand.tsumo) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No tsumo tile' })

  const yaku = calculateYaku(state, me, state[me].hand, 'tsumo', state[me].hand.tsumo)
  if (yaku.every((y) => y.isExtra)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid yaku' })

  const oya = state[me].wind === 'east'
  const han = yaku.reduce((han, yaku) => han + yaku.han, 0)
  const yakuman = yaku
    .filter((y) => y.isYakuman)
    .map((y) => Math.floor(y.han / 13))
    .reduce((a, b) => a + b, 0)

  const score =
    yakuman > 0
      ? yakuman * (oya ? eastScoreTable[13] : westScoreTable[13])
      : oya
      ? eastScoreTable[han]
      : westScoreTable[han]

  state[me].decisions = []
  state.scoreboard = {
    type: 'agari',
    winner: me,
    hand: state[me].hand,
    agariType: 'tsumo',
    score,
    han,
    yakuman,
    yaku,
    hostConfirmed: false,
    guestConfirmed: false,
    doraTiles: getDoraTiles(state.wall),
    uraDoraTiles: getUraDoraTiles(state.wall),
  }
}

export const callRon = (state: GameState, me: PlayerType) => {
  if (!state[me].decisions.some((dec) => dec.type === 'ron'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'No ron decision' })

  const opponent = getOpponent(me)
  const riverEnd = getRiverEnd(state[opponent])
  if (!riverEnd) throw new TRPCError({ code: 'BAD_REQUEST', message: 'River empty' })

  const calledTile = riverEnd.tile
  if (calledTile.type === 'back') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not visible' })

  const yaku = calculateYaku(state, me, state[me].hand, 'ron', calledTile)
  if (yaku.every((y) => y.isExtra)) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid yaku' })

  const oya = state[me].wind === 'east'
  const han = yaku.reduce((han, yaku) => han + yaku.han, 0)
  const yakuman = yaku
    .filter((y) => y.isYakuman)
    .map((y) => Math.floor(y.han / 13))
    .reduce((a, b) => a + b, 0)

  const score =
    yakuman > 0
      ? yakuman * (oya ? eastScoreTable[13] : westScoreTable[13])
      : oya
      ? eastScoreTable[han]
      : westScoreTable[han]

  state[me].decisions = []
  state.scoreboard = {
    type: 'agari',
    winner: me,
    hand: { ...state[me].hand, tsumo: calledTile },
    agariType: 'ron',
    score,
    han,
    yakuman,
    yaku,
    hostConfirmed: false,
    guestConfirmed: false,
    doraTiles: getDoraTiles(state.wall),
    uraDoraTiles: getUraDoraTiles(state.wall),
  }
}

export const giri = (state: GameState, me: PlayerType, index: number) => {
  if (state[me].decisions.some((dec) => dec.type === 'skip_and_tsumo' || dec.type === 'skip_chankan'))
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Decisions should be made' })

  if (state[me].riichi && state[me].hand.tsumo?.index !== index)
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Riichi only can discard tsumo' })

  const closedHand = getClosedHand(state[me].hand)
  const [tiles, remain] = partition(closedHand, (t) => t.index === index)
  if (!tiles.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })

  onBeforeGiri(state, me)

  const isRiichi = state[me].riichi !== null && !state[me].river.some((r) => r.isRiichi)
  state[me].river.push({ tile: tiles[0], isTsumogiri: state[me].hand.tsumo?.index === index, isRiichi })

  state[me].hand.closed = remain
  state[me].hand.tsumo = undefined

  onAfterGiri(state, me)
  onBeforeTsumo(state, getOpponent(me))
}

export const riichi = (state: GameState, me: PlayerType, index: number) => {
  if (state[me].riichi) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Riichi already declared' })

  const closedHand = getClosedHand(state[me].hand)
  const [tiles, remain] = partition(closedHand, (t) => t.index === index)
  if (!tiles.length) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tile not found' })

  onBeforeGiri(state, me)

  state[me].riichi = state[me].jun
  state[me].river.push({ tile: tiles[0], isTsumogiri: state[me].hand.tsumo?.index === index, isRiichi: true })

  state[me].hand.closed = remain
  state[me].hand.tsumo = undefined

  onAfterGiri(state, me)
  onBeforeTsumo(state, getOpponent(me))
}
