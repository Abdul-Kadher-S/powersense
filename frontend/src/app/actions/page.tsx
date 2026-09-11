"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Target, ChevronRight, CheckCircle, AlertTriangle, Info } from "lucide-react"
import AppLayout from "@/components/layout/AppLayout"
import api, { RecommendationData } from "@/lib/api"

export default function ActionsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getRecommendations()
        setRecommendations(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="space-y-4">
        <div className="skeleton h-8 w-60" />
        {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}
      </div>
    </AppLayout>
  )

  const priorityColors: Record<string, string> = {
    high: '#ef4444', moderate: '#f59e0b', low: '#10b981', info: '#3b82f6',
  }
  const priorityEmojis: Record<string, string> = {
    high: '🔴', moderate: '🟠', low: '🟢', info: '🔵',
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Target className="w-6 h-6 inline-block text-orange-400 mr-2 -mt-1" />
            Action Center
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            What should you do now? Prioritized by impact.
          </p>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, i) => {
            const color = priorityColors[rec.priority] || '#64748b'
            const emoji = priorityEmojis[rec.priority] || '⚪'

            return (
              <div key={rec.id} className="card animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms`, borderLeftWidth: '3px', borderLeftColor: color }}>
                
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rec.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ color, background: `${color}12` }}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{rec.description}</p>

                    {/* Impact & Reason */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {rec.expected_impact && (
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">Expected Impact</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rec.expected_impact}</p>
                        </div>
                      )}
                      {rec.reason && (
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">Reason</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{rec.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Suggested Action */}
                    {rec.suggested_action && (
                      <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1">Suggested Action</p>
                        <p className="text-xs whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{rec.suggested_action}</p>
                      </div>
                    )}

                    {rec.related_appliance_id && (
                      <Link
                        href={`/appliances/${rec.related_appliance_id}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3 transition-colors"
                      >
                        View Appliance Details <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
