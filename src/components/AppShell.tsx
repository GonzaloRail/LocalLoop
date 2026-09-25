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
import { Logo } from './Logo'

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
        <div className="flex items-center justify-center pt-2 pb-3">
          <button
            type="button"
            onClick={() => navigate(userType === 'business' ? 'business-dashboard' : 'promoter-dashboard')}
            title="LocalLoop Dashboard"
            className="p-1 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <Logo variant="icon" className="w-6 h-6 object-contain" />
          </button>
        </div>
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
          icon={<Zap className="size-full text-[#00B686]" strokeWidth={1.5} />}
          onClick={() => setSimulatorOpen(true)}
        />
      </SidebarNavigation>

      <main className="flex-1 bg-brand-tertiary overflow-y-auto relative flex flex-col">
        {/* Barra superior de herramientas para la demo del hackathon */}
        <header className="sticky top-0 z-40 bg-surface-bg/85 backdrop-blur-md border-b border-border-primary px-xl py-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={() => navigate(userType === 'business' ? 'business-dashboard' : 'promoter-dashboard')}
              className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
            >
              <Logo size="xs" variant="auto" />
            </button>
            <span className="text-text-secondary">·</span>
            <span className="text-[#00B686] font-medium">
              Rol: {userType === 'business' ? '🏢 Negocio' : '🚀 Promotor'}
            </span>
            <span className="text-text-secondary">·</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
