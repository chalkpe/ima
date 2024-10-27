import z from 'zod'
import { protectedProcedure, router } from '@ima/server/trpc'
import { prisma } from '@ima/server/db'
import { RiichiStick, Theme, TileTheme } from '@prisma/client'

export const preferenceRouter = router({
  preference: protectedProcedure.query(async (opts) => {
    const { id: userId } = opts.ctx
    return (
      (await prisma.userPreference.findUnique({ where: { userId } })) ||
      (await prisma.userPreference.create({ data: { userId } }))
    )
  }),
  theme: protectedProcedure.input(z.nativeEnum(Theme)).mutation(async (opts) => {
    const { id: userId } = opts.ctx
    const theme = opts.input
    await prisma.userPreference.update({ where: { userId }, data: { theme } })
  }),
  tileTheme: protectedProcedure.input(z.nativeEnum(TileTheme)).mutation(async (opts) => {
    const { id: userId } = opts.ctx
    const tileTheme = opts.input
    await prisma.userPreference.update({ where: { userId }, data: { tileTheme } })
  }),
  riichiStick: protectedProcedure.input(z.nativeEnum(RiichiStick)).mutation(async (opts) => {
    const { id: userId } = opts.ctx
    const riichiStick = opts.input
    await prisma.userPreference.update({ where: { userId }, data: { riichiStick } })
  }),
})
