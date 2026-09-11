"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Lightbulb, Zap, Cpu, DollarSign, Link2, AlertTriangle, Info, ChevronRight } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import api, { InsightData } from "@/lib/api"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  energy: Zap, appliance: Cpu, cost: DollarSign, connection: Link2,
}
const categoryColors: Record<string, string> = {
  energy: '#3b82f6', appliance: '#06b6d4', cost: '#8b5cf6', connection: '#f59e0b',
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightData[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getInsights()
        setInsights(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="space-y-4">
        <div className="skeleton h-8 w-60" />
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Lightbulb className="w-6 h-6 inline-block text-yellow-400 mr-2 -mt-1" />
            AI Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Intelligence generated from your home&apos;s data patterns
          </p>
        </div>

        <div className="space-y-4">
          {insights.map((insight, i) => {
            const Icon = categoryIcons[insight.category] || Info
            const color = categoryColors[insight.category] || '#64748b'
            const isExpanded = expanded === insight.id
            const severityBadge = insight.severity === 'high' || insight.severity === 'critical' ? 'badge-high'
              : insight.severity === 'warning' || insight.severity === 'moderate' ? 'badge-moderate'
              : insight.severity === 'info' ? 'badge-info' : 'badge-healthy'

            return (
              <div
                key={insight.id}
                className="card cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms`, borderLeftWidth: '3px', borderLeftColor: color }}
                onClick={() => setExpanded(isExpanded ? null : insight.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}12`, color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{insight.title}</h3>
                      <span className={`badge ${severityBadge}`}>{insight.severity}</span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      {insight.description}
                    </p>

                    {isExpanded && (
                      <div className="mt-4 space-y-3 animate-fade-in-up">
                        {insight.explanation && (
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                            <p className="text-xs font-medium text-blue-400 mb-1">Why?</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insight.explanation}</p>
                          </div>
                        )}
                        {insight.recommendation && (
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                            <p className="text-xs font-medium text-emerald-400 mb-1">Recommended Action</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insight.recommendation}</p>
                          </div>
                        )}
                        {insight.related_appliance_id && (
                          <Link
                            href={`/appliances/${insight.related_appliance_id}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Related Appliance <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
