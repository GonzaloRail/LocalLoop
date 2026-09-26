import { ReactNode, useState } from 'react'
import { useTheme } from '@figma/astraui'
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
  ShieldCheck,
  Building2,
  User,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Wallet,
  Bot,
} from 'lucide-react'
import { Page, UserType } from '../types'
import { ConversionSimulatorModal } from './ConversionSimulatorModal'
import { McpAgentModal } from './McpAgentModal'
import { useApp } from '../context/AppContext'
import { Logo } from './Logo'
import { truncateAddress, getStellarExpertAccountUrl } from '../lib/stellar'

interface AppShellProps {
  children: ReactNode
  currentPage: Page
  navigate: (page: Page, params?: Record<string, unknown>) => void
  userType: UserType
  setUserType?: (t: UserType) => void
}

const BUSINESS_NAV = [
  { page: 'business-dashboard' as Page, label: 'Dashboard', icon: Home, desc: 'Resumen & métricas' },
  { page: 'my-campaigns' as Page, label: 'Mis Campañas', icon: Folder, desc: 'Campañas activas y cierre' },
  { page: 'create-campaign' as Page, label: 'Nueva Campaña', icon: Plus, desc: 'Financiar en Soroban' },
  { page: 'business-history' as Page, label: 'Historial On-Chain', icon: Clock, desc: 'Auditoría de pagos' },
]

const PROMOTER_NAV = [
  { page: 'promoter-dashboard' as Page, label: 'Dashboard', icon: Home, desc: 'Métricas de ingresos' },
  { page: 'explore-campaigns' as Page, label: 'Explorar Campañas', icon: Search, desc: 'Catálogo de marcas' },
  { page: 'promoter-campaigns' as Page, label: 'Mis Campañas', icon: Folder, desc: 'Códigos y enlaces' },
  { page: 'promoter-earnings' as Page, label: 'Ganancias & Pagos', icon: TrendingUp, desc: 'Liquidaciones en USDC' },
]

export default function AppShell({ children, currentPage, navigate, userType, setUserType }: AppShellProps) {
  const { currentUser } = useApp()
  const { theme, toggleTheme } = useTheme()
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [mcpModalOpen, setMcpModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = userType === 'promoter' ? PROMOTER_NAV : BUSINESS_NAV
  const profilePage: Page = userType === 'promoter' ? 'promoter-profile' : 'business-profile'
  const isBusiness = userType === 'business'
  const walletAddr = currentUser.wallet || (isBusiness ? 'GC6AXPGMZQZU5RBW5CKGCXL3B3FWFPTGPA2IQDXYKPCGFVTKJWBCKB3Y' : 'GA7HPIC5QEG7GD42Q4XNXJ72FDPYKFRMMXY4IBWA3R5ZNTD5QKKSUSPX')

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
    <div className="flex h-screen overflow-hidden bg-brand-tertiary">
      {/* ── Desktop Sidebar Navigation with Full Labels ── */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-bg border-r border-border-primary shrink-0 z-30 justify-between select-none">
        
        {/* Top Branding */}
        <div className="flex flex-col">
          <div className="p-4 border-b border-border-primary flex items-center justify-between">
            <div
              onClick={() => navigate(isBusiness ? 'business-dashboard' : 'promoter-dashboard')}
              className="cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Logo size="sm" variant="auto" />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isBusiness
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
            }`}>
              {isBusiness ? 'Negocio' : 'Promotor'}
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase px-3 py-1">
              Menú Principal
            </span>
            {navItems.map(({ page, label, icon: Icon, desc }) => {
              const active = currentPage === page
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => navigate(page)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left group ${
                    active
                      ? 'bg-[#00B686]/10 text-[#00B686] font-semibold border border-[#00B686]/25 shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    active ? 'bg-[#00B686]/20 text-[#00B686]' : 'bg-surface-hover text-text-secondary group-hover:text-text-primary'
                  }`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate">{label}</span>
                    <span className="text-[10px] text-text-secondary truncate">{desc}</span>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Simulator Quick Widget */}
          <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-[#00B686]/10 via-[#00B686]/5 to-transparent border border-[#00B686]/20 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <Zap size={14} className="text-[#00B686]" />
              <span>Simulador On-Chain</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Prueba una compra de cliente en tiempo real y verifica el pago.
            </p>
            <button
              type="button"
              onClick={() => setSimulatorOpen(true)}
              className="w-full mt-1 py-1.5 px-2 bg-[#00B686] hover:bg-[#009E74] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1"
            >
              <Zap size={12} />
              <span>Simular conversión</span>
            </button>
          </div>

          {/* MCP AI Agent Widget */}
          <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-[#FDDA24]/15 via-[#FDDA24]/5 to-transparent border border-[#FDDA24]/30 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <Bot size={14} className="text-amber-500" />
              <span>Agente IA (MCP)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FDDA24]/20 text-text-primary font-mono font-bold border border-[#FDDA24]/40">
                Stellar
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Auditoría y operaciones on-chain ejecutadas vía Model Context Protocol.
            </p>
            <button
              type="button"
              onClick={() => setMcpModalOpen(true)}
              className="w-full mt-1 py-1.5 px-2 bg-[#FDDA24] hover:bg-[#FDDA24]/90 text-[#0F0F0F] rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} />
              <span>Abrir Consola MCP</span>
            </button>
          </div>
        </div>

        {/* Bottom User & System Controls */}
        <div className="p-3 border-t border-border-primary flex flex-col gap-1 bg-surface-bg/50">
          {/* Perfil & Wallet link */}
          <button
            type="button"
            onClick={() => navigate(profilePage)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
              currentPage === profilePage
                ? 'bg-[#00B686]/10 text-[#00B686] font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Settings size={15} className="shrink-0" />
            <span className="flex-1 text-left truncate">Mi Perfil & Billetera</span>
          </button>

          {/* Alternar Rol */}
          <button
            type="button"
            onClick={handleToggleRole}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            title="Cambiar de modo de usuario"
          >
            <ArrowLeftRight size={15} className="shrink-0" />
            <span className="flex-1 text-left truncate">
              Cambiar a {isBusiness ? 'Promotor' : 'Negocio'}
            </span>
          </button>

          {/* Theme Switcher with Text */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} className="shrink-0 text-amber-400" /> : <Moon size={15} className="shrink-0" />}
            <span className="flex-1 text-left">
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </button>

          {/* Cerrar Sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
            <span className="flex-1 text-left">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-surface-bg/85 backdrop-blur-md border-b border-border-primary px-4 sm:px-6 py-3 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary hidden sm:inline">LocalLoop</span>
              <span className="text-text-secondary hidden sm:inline">·</span>
              <span className="text-text-secondary">
                {isBusiness ? '🏢 Espacio Empresarial' : '🚀 Portal de Promotor'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connected Wallet Pill */}
            <a
              href={getStellarExpertAccountUrl(walletAddr)}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver cuenta en Stellar Expert"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium hover:bg-emerald-500/15 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{truncateAddress(walletAddr, 4, 4)}</span>
              <ExternalLink size={11} className="opacity-70" />
            </a>

            {/* MCP AI Agent button for Video Demo & Jury */}
            <button
              type="button"
              onClick={() => setMcpModalOpen(true)}
              title="Herramienta MCP: Ejecuta herramientas nativas de Stellar con un Agente de IA"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#FDDA24]/15 hover:bg-[#FDDA24]/25 text-text-primary border border-[#FDDA24]/40 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Bot size={13} className="text-amber-500" />
              <span className="hidden sm:inline">Agente IA</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#FDDA24]/30 text-[#0F0F0F] dark:text-[#FDDA24] font-mono font-bold">MCP</span>
            </button>

            {/* Quick conversion simulation button for Jury & Testing */}
            <button
              type="button"
              onClick={() => setSimulatorOpen(true)}
              title="Herramienta de prueba para el jurado: emula la compra de un cliente"
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>🧪</span>
              <span className="hidden sm:inline">Emular Compra</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-purple-500/20 font-mono">Demo</span>
            </button>


            {/* Role Switcher compact */}
            <button
              type="button"
              onClick={handleToggleRole}
              title={`Cambiar a modo ${isBusiness ? 'Promotor' : 'Negocio'}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-bg hover:bg-surface-hover border border-border-primary text-text-secondary hover:text-text-primary transition-colors text-xs"
            >
              <ArrowLeftRight size={13} />
              <span className="hidden md:inline">{isBusiness ? 'Ver Promotor' : 'Ver Negocio'}</span>
            </button>
          </div>
        </header>

        {/* Mobile dropdown menu when open */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-bg border-b border-border-primary p-4 flex flex-col gap-2 z-30 shadow-lg">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                type="button"
                onClick={() => {
                  navigate(page)
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-text-primary hover:bg-surface-hover"
              >
                <Icon size={16} className="text-[#00B686]" />
                <span>{label}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-border-primary flex justify-between items-center text-xs">
              <button onClick={toggleTheme} className="text-text-secondary hover:text-text-primary">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </button>
              <button onClick={handleLogout} className="text-red-500 font-medium">
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ConversionSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      <McpAgentModal
        isOpen={mcpModalOpen}
        onClose={() => setMcpModalOpen(false)}
        walletAddress={walletAddr}
      />
    </div>
  )
}
