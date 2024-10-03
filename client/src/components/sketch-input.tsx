import { ChangeEvent, CSSProperties, FC, FocusEventHandler, useCallback } from 'react'
import useSketchToggle from '@ima/client/hooks/useSketchToggle'
import styled from '@emotion/styled'
import { useTheme } from '@mui/material'

interface SketchInputProps {
  size: number
  name?: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  onBlur?: FocusEventHandler<HTMLInputElement>
  placeholder?: string
  style?: CSSProperties
}

const SketchInput: FC<SketchInputProps> = ({ size, name, value, onChange, autoFocus, onBlur, placeholder, style }) => {
  const theme = useTheme()
  const { toggle } = useSketchToggle()

  const commonStyles: CSSProperties = {
    fontSize: `${size}vmin`,
    fontFamily: theme.typography.fontFamily,
  }

  const ref = useCallback(
    (node: HTMLElement) =>
      node &&
      new MutationObserver(() => {
        const shadowRoot = node.shadowRoot
        if (!shadowRoot) return

        const style = new CSSStyleSheet()
        style.replaceSync(`
          input { background-color: transparent }
          input::placeholder { color: rgba(50, 50, 50, 0.5) }
        `)
        shadowRoot.adoptedStyleSheets.push(style)
        if (autoFocus) shadowRoot.querySelector('input')?.focus()
      }).observe(node, { attributes: true, attributeFilter: ['class'] }),
    [autoFocus]
  )

  return (
    <>
      {toggle ? (
        <>
          <input type="hidden" name={name} value={value} />
          <wired-input
            ref={ref}
            value={value}
            onInput={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            style={{
              ...commonStyles,
              ...style,
            }}
          />
        </>
      ) : (
        <Input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            ...commonStyles,
            ...style,
          }}
        />
      )}
    </>
  )
}

export default SketchInput

const Input = styled.input`
  box-sizing: content-box;
  border: 0.5vmin solid rgba(50, 50, 50, 0.5);
  background-color: transparent;
  ::placeholder {
    color: rgba(50, 50, 50, 0.5);
  }
`
