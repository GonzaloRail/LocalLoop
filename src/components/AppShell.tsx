import { ReactNode, useState } from 'react'
import { SidebarNavigation, SidebarButton, Avatar, useTheme } from '@figma/astraui'
import {
  Home,
  Folder,
  Plus,
  Settings,
  Search,
  TrendingUp,
  Clock,
  Sun,
  Moon,
  LogOut,
  Zap,
  ArrowLeftRight,
  GitBranch,
} from 'lucide-react'
import { Page, UserType } from '../types'
import { ConversionSimulatorModal } from './ConversionSimulatorModal'
import { useApp } from '../context/AppContext'

interface AppShellProps {
  children: ReactNode
  currentPage: Page
  navigate: (page: Page, params?: Record<string, unknown>) => void
  userType: UserType
  setUserType?: (t: UserType) => void
}

const BUSINESS_NAV = [
  { page: 'business-dashboard' as Page, icon: Home },
  { page: 'my-campaigns' as Page, icon: Folder },
  { page: 'create-campaign' as Page, icon: Plus },
  { page: 'business-history' as Page, icon: Clock },
]

const PROMOTER_NAV = [
  { page: 'promoter-dashboard' as Page, icon: Home },
  { page: 'explore-campaigns' as Page, icon: Search },
  { page: 'promoter-campaigns' as Page, icon: Folder },
  { page: 'promoter-earnings' as Page, icon: TrendingUp },
]

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  return (
    <SidebarButton
      icon={
        theme === 'dark'
          ? <Sun className="size-full" strokeWidth={1.5} />
          : <Moon className="size-full" strokeWidth={1.5} />
      }
      onClick={toggleTheme}
    />
  )
}

export default function AppShell({ children, currentPage, navigate, userType, setUserType }: AppShellProps) {
  const { currentUser, resetToMockData } = useApp()
  const [simulatorOpen, setSimulatorOpen] = useState(false)

  const navItems = userType === 'promoter' ? PROMOTER_NAV : BUSINESS_NAV
  const profilePage: Page = userType === 'promoter' ? 'promoter-profile' : 'business-profile'
  const initials = userType === 'promoter' ? 'DH' : 'EX'

  function handleLogout() {
    setUserType?.(null)
    navigate('landing')
  }

  function handleToggleRole() {
    const nextType: UserType = userType === 'business' ? 'promoter' : 'business'
    setUserType?.(nextType)
    navigate(nextType === 'business' ? 'business-dashboard' : 'promoter-dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNavigation
        footer={
          <>
            <ThemeToggleButton />
            <SidebarButton
              icon={<Settings className="size-full" strokeWidth={1.5} />}
              active={currentPage === profilePage}
              onClick={() => navigate(profilePage)}
            />
            <SidebarButton
              icon={<LogOut className="size-full" strokeWidth={1.5} />}
              onClick={handleLogout}
            />
            <Avatar type="initial" initials={initials} size="medium" shape="circle" />
          </>
        }
      >
        {navItems.map(({ page, icon: Icon }) => (
          <SidebarButton
            key={page}
            icon={<Icon className="size-full" strokeWidth={1.5} />}
            active={currentPage === page}
            onClick={() => navigate(page)}
          />
        ))}

        {/* Separador y botón de simulador en la sidebar */}
        <div className="my-xs border-t border-border-primary/50" />
        <SidebarButton
          icon={<Zap className="size-full text-brand-primary" strokeWidth={1.5} />}
          onClick={() => setSimulatorOpen(true)}
        />
      </SidebarNavigation>

      <main className="flex-1 bg-brand-tertiary overflow-y-auto relative flex flex-col">
        {/* Barra superior de herramientas para la demo del hackathon */}
        <header className="sticky top-0 z-40 bg-surface-bg/80 backdrop-blur-md border-b border-border-primary px-xl py-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-sm">
            <span className="font-semibold text-text-primary">LocalLoop</span>
            <span className="text-text-secondary">·</span>
            <span className="text-brand-primary font-medium">
              Rol activo: {userType === 'business' ? '🏢 Negocio' : '🚀 Promotor'}
            </span>
            <span className="text-text-secondary">·</span>
            <span className="text-xs px-xs py-0.5 rounded bg-bg-faint text-text-secondary border border-border-primary font-mono">
              Stellar Testnet
            </span>
          </div>

          <div className="flex items-center gap-xs">
            <button
              type="button"
              onClick={() => setSimulatorOpen(true)}
              className="flex items-center gap-xs px-sm py-1 bg-brand-primary hover:bg-brand-secondary text-on-brand rounded-corner-md font-medium shadow-xs transition-colors"
            >
              <Zap size={13} />
              <span>Simular conversión cliente</span>
            </button>

            <button
              type="button"
              onClick={handleToggleRole}
              title="Alternar entre Negocio y Promotor"
              className="flex items-center gap-xs px-sm py-1 bg-surface-bg hover:bg-surface-hover border border-border-primary text-text-primary rounded-corner-md transition-colors"
            >
              <ArrowLeftRight size={13} />
              <span>Cambiar a {userType === 'business' ? 'Promotor' : 'Negocio'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('demo-flow')}
              title="Ver el flujo interactivo de 8 pasos"
              className="flex items-center gap-xs px-sm py-1 bg-surface-bg hover:bg-surface-hover border border-border-primary text-text-secondary hover:text-text-primary rounded-corner-md transition-colors"
            >
              <GitBranch size={13} />
              <span>Flujo demo</span>
            </button>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>

      <ConversionSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />
    </div>
  )
}
