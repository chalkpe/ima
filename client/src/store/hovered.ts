import { atom } from 'jotai'
import type { Tile } from '@ima/server/types/tile'

export const hoveredAtom = atom<Tile>()
