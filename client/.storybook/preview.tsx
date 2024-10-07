import React from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Preview } from '@storybook/react'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <AnimatePresence>
          <Story />
        </AnimatePresence>
      )
    },
  ],
}

export default preview
