"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Zap, DollarSign, Cpu, AlertTriangle, TrendingUp, TrendingDown,
  Activity, ArrowRight, ChevronRight, BarChart3
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts"
import AppLayout from "@/components/layout/AppLayout"
import api, { DashboardData } from "@/lib/api"
import { formatCurrency, getHealthScoreColor } from "@/lib/utils"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await api.getDashboard()
        setData(dashboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="space-y-6">
        <div className="skeleton h-10 w-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </AppLayout>
  )

  if (error || !data) return (
    <AppLayout>
      <div className="card text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Failed to load dashboard</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-lg text-sm text-blue-400 hover:bg-blue-400/10 transition-colors">
          Retry
        </button>
      </div>
    </AppLayout>
  )

  const healthColor = getHealthScoreColor(data.home_health_score)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Good morning 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here&apos;s what your home is telling you today.
          </p>
        </div>

        {/* Home Health Score + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Health Score Card */}
          <div className="lg:col-span-4 xl:col-span-3 card-glass animate-fade-in-up delay-100 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Home Health
            </p>
            {/* SVG Ring */}
            <div className="health-ring" style={{ width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={healthColor}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${data.home_health_score * 3.14} 314`}
                  style={{ filter: `drop-shadow(0 0 8px ${healthColor}40)` }} />
              </svg>
              <div className="score-text">
                <span className="text-3xl font-bold" style={{ color: healthColor }}>{Math.round(data.home_health_score)}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
            <p className="text-xs mt-3 font-semibold" style={{ color: healthColor }}>
              {data.home_health_score >= 80 ? 'Good' : data.home_health_score >= 60 ? 'Needs Attention' : 'At Risk'}
            </p>
          </div>

          {/* Stat Cards */}
          <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Energy */}
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              iconColor="#3b82f6"
              label="Energy Usage"
              value={`${data.energy_current_kwh} kWh`}
              change={data.energy_change_pct}
              href="/electricity"
              delay="delay-100"
            />
            {/* Bill */}
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              iconColor="#8b5cf6"
              label="Next Month Bill"
              value={formatCurrency(data.predicted_next_bill)}
              subtext={`Current: ${formatCurrency(data.current_bill)}`}
              href="/electricity"
              delay="delay-200"
            />
            {/* Appliance Health */}
            <StatCard
              icon={<Cpu className="w-5 h-5" />}
              iconColor="#06b6d4"
              label="Appliance Health"
              value={`${Math.round(data.appliance_avg_health)}/100`}
              subtext={`${data.total_appliances} appliances monitored`}
              href="/appliances"
              delay="delay-300"
            />
            {/* Active Risks */}
            <StatCard
              icon={<AlertTriangle className="w-5 h-5" />}
              iconColor={data.active_risks > 0 ? "#f59e0b" : "#10b981"}
              label="Active Risks"
              value={String(data.active_risks)}
              subtext={data.active_risks > 0 ? "Action recommended" : "All clear"}
              href="/actions"
              delay="delay-400"
            />
          </div>
        </div>

        {/* Consumption Chart */}
        <div className="card animate-fade-in-up w-full min-w-0" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Consumption Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monthly electricity usage (kWh)</p>
            </div>
            <Link href="/electricity" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-full min-w-0" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.consumption_trend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientKwh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.3)" fontSize={12} />
                <YAxis stroke="rgba(148,163,184,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#334155', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="kwh" stroke="#3b82f6" fill="url(#gradientKwh)"
                  strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5, fill: '#3b82f6' }}
                  name="Consumption (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Insights */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Insights</h2>
            <Link href="/insights" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_insights.slice(0, 3).map((insight, i) => (
              <div key={insight.id || i} className="p-3 rounded-xl flex items-start gap-3 transition-colors hover:bg-white/[0.02]"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)' }}>
                <div className="mt-0.5 text-lg">{getSeverityEmoji(insight.severity)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{insight.title}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{insight.description}</p>
                </div>
                <span className={`badge ${getSeverityBadgeClass(insight.severity)}`}>
                  {insight.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function StatCard({ icon, iconColor, label, value, change, subtext, href, delay }: {
  icon: React.ReactNode; iconColor: string; label: string; value: string;
  change?: number; subtext?: string; href: string; delay: string;
}) {
  return (
    <Link href={href} className={`stat-card block no-underline animate-fade-in-up min-w-0 ${delay}`}>
      <div className="flex items-center gap-2.5 mb-3 min-w-0">
        <div className="p-2 rounded-lg shrink-0" style={{ background: `${iconColor}15`, color: iconColor }}>
          {icon}
        </div>
        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span className={`text-xs font-medium ${change >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>vs last mo.</span>
        </div>
      )}
      {subtext && (
        <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{subtext}</p>
      )}
    </Link>
  )
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'critical': case 'high': return '🔴'
    case 'warning': case 'moderate': return '🟡'
    case 'info': return '🔵'
    default: return '⚪'
  }
}

function getSeverityBadgeClass(severity: string): string {
  switch (severity) {
    case 'critical': case 'high': return 'badge-high'
    case 'warning': case 'moderate': return 'badge-moderate'
    case 'info': return 'badge-info'
    default: return 'badge-healthy'
  }
}
