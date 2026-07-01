import logo from '../assets/logo.png'

interface Props {
  className?: string
  /** Width in px — height scales automatically to preserve aspect ratio */
  width?: number
}

export default function BrimzLogo({ className = '', width = 160 }: Props) {
  return (
    <img
      src={logo}
      alt="Brimz"
      style={{
        width,
        height: 'auto',
        display: 'block',
        mixBlendMode: 'screen',
        imageRendering: 'auto',
      }}
      className={className}
    />
  )
}
