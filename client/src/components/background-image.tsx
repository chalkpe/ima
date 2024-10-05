import { FC } from 'react'
import { GlobalStyles, useTheme } from '@mui/material'

interface BackgroundImageProps {
  type: 'game' | 'lobby'
}

const BackgroundImage: FC<BackgroundImageProps> = ({ type }) => {
  const theme = useTheme()
  return (
    <GlobalStyles
      styles={{
        body: {
          backgroundSize: 'cover',
          backgroundImage: `url('/background_${type}_${theme.palette.mode}.png')`,
          backgroundColor: type === 'game' ? theme.palette.background.paper : theme.palette.background.default,
        },
      }}
    />
  )
}

export default BackgroundImage
