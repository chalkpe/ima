import Hai from '@ima/client/components/hai'
import { backTile } from '@ima/client/utils/tile'

import type { Tile } from '@ima/server/types/tile'
import type { Meta, StoryObj } from '@storybook/react'

type TileOption = [string, Tile]

const tiles: TileOption[] = [
  ...[1, 9].map((i) => [`${i}m`, { ...backTile, type: 'man', value: i }] satisfies TileOption),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [`${i}p`, { ...backTile, type: 'pin', value: i }] satisfies TileOption),
  ['5pr', { ...backTile, type: 'pin', value: 5, attribute: 'red' }] satisfies TileOption,
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [`${i}s`, { ...backTile, type: 'sou', value: i }] satisfies TileOption),
  ['5sr', { ...backTile, type: 'sou', value: 5, attribute: 'red' }] satisfies TileOption,
  ...[1, 2, 3, 4].map((i) => [`${i}z`, { ...backTile, type: 'wind', value: i }] satisfies TileOption),
  ...[1, 2, 3].map((i) => [`${i + 4}z`, { ...backTile, type: 'dragon', value: i }] satisfies TileOption),
  ['0z', backTile] satisfies TileOption,
]

const meta = {
  component: Hai,
  argTypes: {
    size: {
      control: { type: 'number' },
    },
    tile: {
      options: tiles.map((e) => e[0]),
      mapping: Object.fromEntries(tiles),
    },
  },
  args: {
    size: 30,
    tile: tiles[tiles.length - 2][1],
  },
} satisfies Meta<typeof Hai>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const All: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2vmin' }}>
      {tiles.map(([name, tile]) => (
        <Hai key={name} {...args} tile={tile} />
      ))}
    </div>
  ),
}
