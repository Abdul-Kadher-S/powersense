"use client"
import { useState, useEffect } from "react"
import {
  Zap, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Activity, DollarSign
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine
} from "recharts"
import AppLayout from "@/components/layout/AppLayout"
import api, { ElectricityReading, ElectricityPrediction, AnomalyResult } from "@/lib/api"
import { formatCurrency, getMonthName, getFullMonthName } from "@/lib/utils"

export default function ElectricityPage() {
  const [history, setHistory] = useState<ElectricityReading[]>([])
  const [prediction, setPrediction] = useState<ElectricityPrediction | null>(null)
  const [anomaly, setAnomaly] = useState<AnomalyResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [h, p, a] = await Promise.all([
          api.getElectricityHistory(),
          api.getElectricityPrediction(),
          api.getElectricityAnomaly(),
        ])
        setHistory(h)
        setPrediction(p)
        setAnomaly(a)
      } catch (err) {
        console.error("Failed to load electricity data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="space-y-6">
        <div className="skeleton h-8 w-60" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </AppLayout>
  )

  const chartData = history.map(r => ({
    name: `${getMonthName(r.month)} ${String(r.year).slice(-2)}`,
    kwh: r.units_kwh,
    bill: r.bill_amount,
  }))

  // Add prediction to chart
  if (prediction) {
    chartData.push({
      name: `${getMonthName(prediction.predicted_month)} ${String(prediction.predicted_year).slice(-2)} (P)`,
      kwh: prediction.predicted_kwh,
      bill: prediction.predicted_bill,
    })
  }

  const lastReading = history[history.length - 1]
  const totalConsumption = history.reduce((sum, r) => sum + r.units_kwh, 0)
  const avgConsumption = totalConsumption / history.length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Zap className="w-6 h-6 inline-block text-blue-400 mr-2 -mt-1" />
            Electricity Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Monitor consumption patterns, predictions, and anomalies
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Current Usage"
            value={`${lastReading?.units_kwh || 0} kWh`}
            subtext={`${getFullMonthName(lastReading?.month || 1)} ${lastReading?.year || ''}`}
            icon={<Zap className="w-5 h-5" />}
            color="#3b82f6"
          />
          <MetricCard
            label="Current Bill"
            value={formatCurrency(lastReading?.bill_amount || 0)}
            subtext="This month"
            icon={<DollarSign className="w-5 h-5" />}
            color="#8b5cf6"
          />
          {prediction && (
            <>
              <MetricCard
                label="Predicted Next Month"
                value={`${prediction.predicted_kwh} kWh`}
                subtext={`${getFullMonthName(prediction.predicted_month)} ${prediction.predicted_year}`}
                badge={`${prediction.percentage_change >= 0 ? '+' : ''}${prediction.percentage_change}%`}
                badgeColor={prediction.percentage_change > 5 ? '#f59e0b' : '#10b981'}
                icon={<TrendingUp className="w-5 h-5" />}
                color="#06b6d4"
              />
              <MetricCard
                label="Predicted Bill"
                value={formatCurrency(prediction.predicted_bill)}
                subtext={`Range: ${formatCurrency(prediction.confidence_low * 8)}–${formatCurrency(prediction.confidence_high * 8)}`}
                icon={<BarChart3 className="w-5 h-5" />}
                color="#10b981"
              />
            </>
          )}
        </div>

        {/* Prediction Details */}
        {prediction && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              📊 ML Prediction — {getFullMonthName(prediction.predicted_month)} {prediction.predicted_year}
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Model: {prediction.model_used} | Trend: {prediction.trend}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <p className="text-xs font-medium text-blue-400 mb-1">Predicted Consumption</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{prediction.predicted_kwh} kWh</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                <p className="text-xs font-medium text-purple-400 mb-1">Estimated Bill</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(prediction.predicted_bill)}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.12)' }}>
                <p className="text-xs font-medium text-cyan-400 mb-1">Expected Range</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {prediction.confidence_low}–{prediction.confidence_high} kWh
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Anomaly Detection */}
        {anomaly && anomaly.is_anomaly && (
          <div className="card" style={{
            borderColor: anomaly.risk_level === 'high' || anomaly.risk_level === 'critical'
              ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'
          }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-6 h-6 mt-0.5 shrink-0 ${
                anomaly.risk_level === 'high' || anomaly.risk_level === 'critical' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  ⚠️ Consumption Anomaly Detected
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {anomaly.explanation}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <MiniStat label="Current" value={`${anomaly.current_usage} kWh`} />
                  <MiniStat label="Normal Range" value={`${anomaly.normal_range_low}–${anomaly.normal_range_high} kWh`} />
                  <MiniStat label="Deviation" value={`${anomaly.percentage_deviation > 0 ? '+' : ''}${anomaly.percentage_deviation}%`} />
                  <MiniStat label="Risk Level" value={anomaly.risk_level.toUpperCase()} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Consumption Chart */}
        <div className="card w-full min-w-0">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Monthly Consumption</h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            12-month history + prediction (P) | Avg: {avgConsumption.toFixed(0)} kWh/month
          </p>
          <div className="w-full min-w-0" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="rgba(148,163,184,0.3)" fontSize={11} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="rgba(148,163,184,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#334155', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                />
                <ReferenceLine y={avgConsumption} stroke="rgba(148,163,184,0.3)" strokeDasharray="4 4" label={{ value: 'Avg', fill: '#64748b', fontSize: 10 }} />
                <Bar dataKey="kwh" radius={[6, 6, 0, 0]} name="Consumption (kWh)">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === chartData.length - 1 ? '#8b5cf6' : '#3b82f6'}
                      fillOpacity={index === chartData.length - 1 ? 0.7 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
            * Purple bar indicates ML prediction. This MVP uses synthetic demo data.
          </p>
        </div>

        {/* Bill Trend */}
        <div className="card w-full min-w-0">
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Bill Trend</h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Estimated monthly bill amount (INR)</p>
          <div className="w-full min-w-0" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientBill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="rgba(148,163,184,0.3)" fontSize={11} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="rgba(148,163,184,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#334155', border: '1px solid #475569', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                  formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Bill Amount']}
                />
                <Area type="monotone" dataKey="bill" stroke="#8b5cf6" fill="url(#gradientBill)"
                  strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="Bill (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function MetricCard({ label, value, subtext, icon, color, badge, badgeColor }: {
  label: string; value: string; subtext: string; icon: React.ReactNode; color: string;
  badge?: string; badgeColor?: string;
}) {
  return (
    <div className="stat-card min-w-0">
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <span className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>{label}</span>
        {badge && (
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: badgeColor, background: `${badgeColor}15` }}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{subtext}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
