import { ReactNode } from 'react'
import { SidebarNavigation, SidebarButton, Avatar, useTheme } from '@figma/astraui'
import { Home, Folder, Plus, Settings, Search, TrendingUp, Clock, Sun, Moon, LogOut } from 'lucide-react'
import { Page, UserType } from '../types'

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
  const navItems = userType === 'promoter' ? PROMOTER_NAV : BUSINESS_NAV
  const profilePage: Page = userType === 'promoter' ? 'promoter-profile' : 'business-profile'
  const initials = userType === 'promoter' ? 'DH' : 'EX'

  function handleLogout() {
    setUserType?.(null)
    navigate('landing')
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
      </SidebarNavigation>
      <main className="flex-1 bg-brand-tertiary overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
