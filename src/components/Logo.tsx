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
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
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
