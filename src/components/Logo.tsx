import { useTheme } from '@figma/astraui'

interface LogoProps {
  variant?: 'auto' | 'full' | 'icon' | 'color' | 'negative'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  alt?: string
}

export function Logo({
  variant = 'auto',
  size = 'md',
  className = '',
  alt = 'LocalLoop',
}: LogoProps) {
  let theme = 'light'
  try {
    const themeHook = useTheme()
    theme = themeHook.theme
  } catch {
    // Fallback if rendered outside AstraUI ThemeProvider
  }

  const sizeClasses = {
    xs: 'h-5',
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16',
  }

  let src = '/logos/localloop-logo-color.png'

  if (variant === 'icon') {
    src = '/logos/localloop-logo-color1x1.png'
  } else if (variant === 'negative' || (variant === 'auto' && theme === 'dark')) {
    src = '/logos/localloop-logo-negativos.png'
  } else if (variant === 'color' || (variant === 'auto' && theme === 'light')) {
    src = '/logos/localloop-logo-color.png'
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-auto object-contain select-none transition-opacity duration-200 ${sizeClasses[size]} ${className}`}
      loading="eager"
    />
  )
}

export default Logo
