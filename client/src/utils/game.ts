import type { Wind } from '../../../server/src/types/game'

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
