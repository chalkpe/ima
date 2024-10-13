import { FC } from 'react'
import SketchBox from '@ima/client/components/sketch-box'
import SketchButton from '@ima/client/components/sketch-button'

interface UserPreferenceProps {
  open: boolean
  onClose: () => void
}

const UserPreference: FC<UserPreferenceProps> = ({ open, onClose }) => {
  if (!open) return null

  return (
    <SketchBox>
      <SketchButton onClick={onClose}>Close</SketchButton>
    </SketchBox>
  )
}

export default UserPreference
