"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Zap, Cpu, Lightbulb, Target, Upload, LogOut, Shield,
  Menu, X, ChevronRight, ChevronLeft
} from "lucide-react"

interface AppLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/electricity", label: "Electricity", icon: Zap },
  { href: "/appliances", label: "Appliances", icon: Cpu },
  { href: "/insights", label: "AI Insights", icon: Lightbulb },
  { href: "/actions", label: "Action Center", icon: Target },
  { href: "/upload", label: "Data Upload", icon: Upload },
]

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [userName, setUserName] = useState("Demo User")

  useEffect(() => {
    const token = localStorage.getItem("homeguard_token")
    if (!token) {
      router.replace("/login")
      return
    }
    try {
      const user = JSON.parse(localStorage.getItem("homeguard_user") || "{}")
      setUserName(user.name || "Demo User")
    } catch { /* ignore */ }

    try {
      const savedCollapsed = localStorage.getItem("homeguard_sidebar_collapsed")
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true")
      }
    } catch { /* ignore */ }
  }, [router])

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggleCollapsed()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [collapsed])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem("homeguard_sidebar_collapsed", String(next))
      } catch { /* ignore */ }
      return next
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("homeguard_token")
    localStorage.removeItem("homeguard_user")
    router.replace("/login")
  }

  return (
    <div className="app-root">
      {/* ── Desktop Sidebar (Flex sibling: sticky, never overlaps) ── */}
      <aside className={`desktop-sidebar hidden lg:flex ${collapsed ? 'collapsed' : 'expanded'}`}>
        {/* Header */}
        <div
          className={`py-5 flex items-center transition-all ${
            collapsed ? 'px-3 justify-center' : 'px-5 justify-between'
          }`}
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          {collapsed ? (
            <button
              onClick={toggleCollapsed}
              title="Expand Sidebar (Ctrl+B)"
              className="p-2 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.25)' }}
            >
              <Shield className="w-5 h-5 text-blue-400" />
            </button>
          ) : (
            <>
              <Link href="/dashboard" className="flex items-center gap-2.5 no-underline min-w-0">
                <div className="p-1.5 rounded-lg shrink-0" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight truncate">
                    HomeGuard AI
                  </h1>
                  <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>
                    Smart Living Platform
                  </p>
                </div>
              </Link>
              <button
                onClick={toggleCollapsed}
                title="Collapse Sidebar (Ctrl+B)"
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Demo Badge */}
        {!collapsed ? (
          <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg text-center"
            style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.12)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
              Demo Mode
            </span>
          </div>
        ) : (
          <div className="flex justify-center mt-3" title="Demo Mode Active">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`sidebar-link group ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50 shrink-0" />}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Expand Toggle (in collapsed mode) */}
        {collapsed && (
          <div className="flex justify-center py-2" style={{ borderTop: '1px solid var(--border-default)' }}>
            <button
              onClick={toggleCollapsed}
              title="Expand Sidebar (Ctrl+B)"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-blue-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User profile */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border-default)' }}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3 px-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  {userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>My Smart Home</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-500/10 hover:text-red-400"
                style={{ color: 'var(--text-muted)' }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md cursor-pointer"
                title={`${userName} (My Smart Home)`}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
              >
                {userName.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                style={{ color: 'var(--text-muted)' }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer (< 1024px) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`mobile-sidebar-drawer lg:hidden ${sidebarOpen ? 'open' : ''}`}>
        <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline" onClick={() => setSidebarOpen(false)}>
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                HomeGuard AI
              </h1>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Smart Living Platform
              </p>
            </div>
          </Link>
          <button
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg text-center"
          style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.12)' }}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
            Demo Mode
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50 shrink-0" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{userName}</p>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>My Smart Home</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area (Flex sibling: ALWAYS starts to the right of sidebar!) ── */}
      <main className="main-content-area">
        {/* Mobile Top Header */}
        <div
          className="lg:hidden sticky top-0 z-20 px-4 py-3 flex items-center justify-between"
          style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-default)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              HomeGuard AI
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Page Container */}
        <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto min-w-0">
          {children}
        </div>
      </main>
    </div>
  )
}
