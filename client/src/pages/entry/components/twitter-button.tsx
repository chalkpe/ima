import { FC, useRef } from 'react'
import SketchButton from '@ima/client/components/sketch-button'

interface TwitterButtonProps {
  size: number
}

const TwitterButton: FC<TwitterButtonProps> = ({ size }) => {
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <form method="get" action="/api/twitter/auth" ref={formRef}>
      <SketchButton
        onClick={() => formRef.current?.submit()}
        style={{ width: '50vmin', fontSize: `${size}vmin`, padding: '1vmin 2vmin', backgroundColor: '#1da1f2' }}
      >
        트위터로 시작하기
      </SketchButton>
    </form>
  )
}

export default TwitterButton
