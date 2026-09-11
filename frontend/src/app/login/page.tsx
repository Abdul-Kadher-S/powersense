"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Zap, Eye, AlertTriangle } from "lucide-react"
import api from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("demo@homeguard.ai")
  const [password, setPassword] = useState("demo123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await api.login(email, password)
    } catch (err) {
      console.warn("Backend login failed or unreachable, proceeding in demo mode:", err)
      // Always succeed for demo experience
      localStorage.setItem("homeguard_token", "demo-jwt-token-homeguard-2026")
      localStorage.setItem("homeguard_user", JSON.stringify({
        id: "demo-user-001",
        email: email || "demo@homeguard.ai",
        name: "Demo User",
        household_name: "My Smart Home",
      }))
    } finally {
      setLoading(false)
      router.push("/dashboard")
    }
  }

  const handleDirectDemoAccess = () => {
    localStorage.setItem("homeguard_token", "demo-jwt-token-homeguard-2026")
    localStorage.setItem("homeguard_user", JSON.stringify({
      id: "demo-user-001",
      email: "demo@homeguard.ai",
      name: "Demo User",
      household_name: "My Smart Home",
    }))
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1a1a2e 100%)' }}>
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500 rounded-full filter blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-500 rounded-full filter blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <Shield className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              HomeGuard AI
            </h1>
          </div>

          <p className="text-xl font-medium text-white/90 mb-3">
            Predict problems. Prevent costs.
          </p>
          <p className="text-sm text-white/50 mb-12">
            AI-powered preventive intelligence for your home
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 text-left">
            {[
              { icon: Zap, text: "Predict electricity consumption & bills", color: "#3b82f6" },
              { icon: Eye, text: "Detect abnormal energy patterns", color: "#8b5cf6" },
              { icon: AlertTriangle, text: "Estimate appliance health & degradation risk", color: "#06b6d4" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <feature.icon className="w-5 h-5 shrink-0" style={{ color: feature.color }} />
                <span className="text-sm text-white/70">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                HomeGuard AI
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Predict problems. Prevent costs.</p>
          </div>

          {/* Demo Mode Badge */}
          <div className="mb-8 p-3 rounded-xl text-center"
            style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Demo Mode</span>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              This MVP uses synthetic data for demonstration purposes
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Sign in with demo credentials to explore
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                placeholder="demo@homeguard.ai"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm text-red-400"
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
              }}
              onMouseOver={(e) => { if (!loading) (e.target as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
            >
              {loading ? "Signing in..." : "Sign In to Demo"}
            </button>

            <button
              type="button"
              onClick={handleDirectDemoAccess}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-default)',
              }}
            >
              Direct Demo Access (Instant) ⚡
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Demo Credentials</p>
            <div className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Email: <span className="text-blue-400 font-mono">demo@homeguard.ai</span></p>
              <p>Password: <span className="text-blue-400 font-mono">demo123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
