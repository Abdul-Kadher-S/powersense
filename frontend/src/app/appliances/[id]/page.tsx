"use client"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Cpu, Refrigerator, AirVent, WashingMachine, Flame, Tv, Microwave,
  AlertTriangle, CheckCircle, Info, Wrench, Calendar, Clock, Zap, TrendingUp
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts"
import AppLayout from "@/components/layout/AppLayout"
import api, { ApplianceDetailData } from "@/lib/api"
import { getHealthScoreColor, getMonthName } from "@/lib/utils"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'refrigerator': Refrigerator, 'air-vent': AirVent, 'washing-machine': WashingMachine,
  'flame': Flame, 'tv': Tv, 'microwave': Microwave,
}

export default function ApplianceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<ApplianceDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await api.getAppliance(id)
        setData(detail)
      } catch (err) {
        console.error("Failed:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return (
    <AppLayout>
      <div className="space-y-6">
        <div className="skeleton h-8 w-60" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </AppLayout>
  )

  if (!data) return (
    <AppLayout>
      <div className="card text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Appliance not found</p>
        <Link href="/appliances" className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block">
          Back to Appliances
        </Link>
      </div>
    </AppLayout>
  )

  const Icon = iconMap[data.icon || ''] || Cpu
  const healthColor = getHealthScoreColor(data.health_score)
  const riskBadge = data.risk_level === 'Healthy' ? 'badge-healthy'
    : data.risk_level === 'Moderate Risk' ? 'badge-moderate' : 'badge-high'

  const energyChartData = (data.energy_readings || []).map(r => ({
    name: `${getMonthName(r.month)} ${String(r.year).slice(-2)}`,
    kwh: r.energy_kwh,
  }))

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Link href="/appliances" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Appliances
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ background: `${healthColor}12`, color: healthColor }}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.name}</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {data.brand} {data.model} · {data.category} · {data.age_years} years old
              </p>
            </div>
          </div>
        </div>

        {/* Health + Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Health Score */}
          <div className="card flex flex-col items-center justify-center py-8 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Health Score</p>
            <div className="health-ring" style={{ width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" />
                <circle cx="70" cy="70" r="56" fill="none" stroke={healthColor}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${data.health_score * 3.52} 352`}
                  style={{ filter: `drop-shadow(0 0 10px ${healthColor}50)` }} />
              </svg>
              <div className="score-text">
                <span className="text-4xl font-bold" style={{ color: healthColor }}>{Math.round(data.health_score)}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
            <span className={`badge ${riskBadge} mt-4`}>{data.risk_level}</span>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Failure Probability: {(data.failure_probability * 100).toFixed(0)}%
            </p>
          </div>

          {/* Info Grid */}
          <div className="lg:col-span-2 card min-w-0">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Appliance Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem icon={<Calendar className="w-4 h-4" />} label="Purchase Year" value={String(data.purchase_year || 'N/A')} />
              <InfoItem icon={<Clock className="w-4 h-4" />} label="Daily Usage" value={`${data.usage_hours_daily}h`} />
              <InfoItem icon={<Zap className="w-4 h-4" />} label="Energy Rating" value={data.energy_rating || 'N/A'} />
              <InfoItem icon={<Wrench className="w-4 h-4" />} label="Last Maintenance" value={data.last_maintenance_date || 'Never'} />
              <InfoItem icon={<AlertTriangle className="w-4 h-4" />} label="Reported Issues" value={String(data.reported_issues || 0)} />
              <InfoItem icon={<TrendingUp className="w-4 h-4" />} label="Energy Trend" value={`${data.energy_trend > 0 ? '+' : ''}${data.energy_trend}%`} />
            </div>
            {data.reported_symptoms && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <p className="text-xs font-medium text-amber-400 mb-1">Reported Symptoms</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{data.reported_symptoms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Energy History Chart */}
        <div className="card w-full min-w-0">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Energy Consumption History</h3>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Monthly energy usage (kWh)</p>
          <div className="w-full min-w-0" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientAppl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={healthColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={healthColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="rgba(148,163,184,0.3)" fontSize={12} />
                <YAxis stroke="rgba(148,163,184,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#334155', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="kwh" stroke={healthColor} fill="url(#gradientAppl)"
                  strokeWidth={2} dot={{ fill: healthColor, r: 3 }} name="Energy (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Assessment */}
        <div className="card" style={{ borderColor: 'rgba(59,130,246,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI Assessment</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {data.ai_assessment}
          </p>
          <p className="text-[10px] mt-3 italic" style={{ color: 'var(--text-muted)' }}>{data.disclaimer}</p>
        </div>

        {/* Contributing Factors */}
        {data.contributing_factors && data.contributing_factors.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Risk Factors</h3>
            <div className="space-y-3">
              {data.contributing_factors.slice(0, 5).map((factor, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)' }}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    factor.concern_level === 'high' ? 'bg-red-400' :
                    factor.concern_level === 'moderate' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{factor.factor}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Value: {typeof factor.value === 'number' ? factor.value.toFixed(1) : factor.value} · 
                      Importance: {(factor.importance * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span className={`badge ${
                    factor.concern_level === 'high' ? 'badge-high' :
                    factor.concern_level === 'moderate' ? 'badge-moderate' : 'badge-healthy'
                  }`}>
                    {factor.concern_level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recommended Action</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {data.recommendation}
          </p>
        </div>

        {/* Maintenance History */}
        {data.maintenance_records && data.maintenance_records.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Maintenance History</h3>
            <div className="space-y-3">
              {data.maintenance_records.map((record, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-default)' }}>
                  <Wrench className="w-4 h-4 mt-0.5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{record.description}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {record.maintenance_date} · {record.performed_by} · ₹{record.cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{icon}</div>
      <div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  )
}
