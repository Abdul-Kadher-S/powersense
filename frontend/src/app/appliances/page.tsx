"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Cpu, Refrigerator, AirVent, WashingMachine, Flame, Tv, Microwave,
  ChevronRight, TrendingUp, TrendingDown, Activity, AlertTriangle
} from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import api, { ApplianceData } from "@/lib/api"
import { getHealthScoreColor } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'refrigerator': Refrigerator,
  'air-vent': AirVent,
  'washing-machine': WashingMachine,
  'flame': Flame,
  'tv': Tv,
  'microwave': Microwave,
}

export default function AppliancesPage() {
  const [appliances, setAppliances] = useState<ApplianceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getAppliances()
        setAppliances(data)
      } catch (err) {
        console.error("Failed:", err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="space-y-6">
        <div className="skeleton h-8 w-60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Cpu className="w-6 h-6 inline-block text-cyan-400 mr-2 -mt-1" />
            Appliance Health
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Monitor appliance health scores and degradation risk
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Total" value={appliances.length} color="#3b82f6" />
          <SummaryCard label="Healthy" value={appliances.filter(a => a.risk_level === 'Healthy').length} color="#10b981" />
          <SummaryCard label="Moderate" value={appliances.filter(a => a.risk_level === 'Moderate Risk').length} color="#f59e0b" />
          <SummaryCard label="High Risk" value={appliances.filter(a => a.risk_level === 'High Risk').length} color="#ef4444" />
        </div>

        {/* Appliance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {appliances.map((appl, i) => {
            const Icon = iconMap[appl.icon || ''] || Cpu
            const healthColor = getHealthScoreColor(appl.health_score)
            const riskBadge = appl.risk_level === 'Healthy' ? 'badge-healthy'
              : appl.risk_level === 'Moderate Risk' ? 'badge-moderate' : 'badge-high'

            return (
              <Link
                key={appl.id}
                href={`/appliances/${appl.id}`}
                className="card block no-underline group animate-fade-in-up min-w-0"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl" style={{ background: `${healthColor}12`, color: healthColor }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{appl.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {appl.brand} {appl.model} · {appl.age_years}yr
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
                </div>

                {/* Health Score Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Health Score</span>
                    <span className="text-sm font-bold" style={{ color: healthColor }}>{Math.round(appl.health_score)}/100</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${appl.health_score}%`, background: healthColor, boxShadow: `0 0 8px ${healthColor}40` }} />
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="flex items-center justify-between">
                  <span className={`badge ${riskBadge}`}>{appl.risk_level}</span>
                  <div className="flex items-center gap-1">
                    {appl.energy_trend > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    ) : appl.energy_trend < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="text-xs font-medium" style={{ color: appl.energy_trend > 0 ? '#f59e0b' : appl.energy_trend < 0 ? '#10b981' : 'var(--text-muted)' }}>
                      {appl.energy_trend > 0 ? '+' : ''}{appl.energy_trend}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>energy</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded-xl text-center" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
