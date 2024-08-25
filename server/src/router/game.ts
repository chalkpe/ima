import z from 'zod'
import { availableTiles, database } from '../db'
import { publicProcedure, router } from '../trpc'

export const gameRouter = router({
  state: publicProcedure.query((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new Error('Room not found')

    return room.state
  }),
  start: publicProcedure.mutation((opts) => {
    const { username } = opts.ctx
    const room = database.rooms.find((room) => room.host === username || room.guest === username)
    if (!room) throw new Error('Room not found')

    const tiles = availableTiles.slice()
    for (let i = tiles.length - 1; i > 0; i--) {
      const rand = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[rand]] = [tiles[rand], tiles[i]]
    }

    room.state.wall.kingTiles = tiles.splice(0, 14)
    room.state.wall.supplementTiles = []

    room.state.host.hand.closed = []
    room.state.guest.hand.closed = []
    ;[4, 4, 4, 1].forEach((count) => {
      room.state.host.hand.closed.push(...tiles.splice(0, count))
      room.state.guest.hand.closed.push(...tiles.splice(0, count))
    })

    room.state.wall.tiles = tiles
    room.started = true
  }),
})
