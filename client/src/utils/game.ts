import type { Wind } from '@ima/server/types/game'
import type { Tenpai } from '@ima/server/types/tenpai'

export const getWindName = (wind: Wind) => {
  switch (wind) {
    case 'east':
      return '동'
    case 'south':
      return '남'
    case 'west':
      return '서'
    case 'north':
      return '북'
  }
}

export const getWindCode = (wind: Wind) => {
  switch (wind) {
    case 'east':
      return '1z'
    case 'south':
      return '2z'
    case 'west':
      return '3z'
    case 'north':
      return '4z'
  }
}

export const tenpaiStatusText: Record<Tenpai['status'], string> = {
  tenpai: '텐파이',
  furiten: '후리텐',
  muyaku: '역 없음',
}
