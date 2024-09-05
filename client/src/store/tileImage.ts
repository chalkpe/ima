import { atom } from 'jotai'
import type { SimpleTile, Tile } from '@ima/server/types/tile'

export const tileImageAtom = atom<WeakMap<Tile | SimpleTile, string>>(new WeakMap())
