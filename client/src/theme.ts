import '@fontsource/poor-story'
import { createTheme } from '@mui/material'

const theme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'light' ? '#e9e6e2' : '#1c1c1c',
        paper: mode === 'light' ? '#cadf9f' : '#163c1b',
      },
    },
    typography: {
      fontFamily: 'Poor Story, sans-serif',
    },
  })

export default theme
