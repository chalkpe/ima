import '@fontsource/poor-story'
import { createTheme } from '@mui/material'

const theme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      background: {
        paper: mode === 'light' ? '#cadf9f' : '#3C422F',
      },
    },
    typography: {
      fontFamily: 'Poor Story, sans-serif',
    },
  })

export default theme
