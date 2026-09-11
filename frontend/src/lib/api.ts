/**
 * API client for HomeGuard AI backend.
 */

import { handleMockRoute } from './mockData'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  isFormData?: boolean
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('homeguard_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('homeguard_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('homeguard_token')
      localStorage.removeItem('homeguard_user')
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, isFormData = false } = options

    const config: RequestInit = {
      method,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...headers,
      },
    }

    if (body) {
      config.body = isFormData ? (body as FormData) : JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `Request failed with status ${response.status}`,
          response.status
        )
      }

      return await response.json()
    } catch (err) {
      // If backend is unreachable or throws network/fetch error (e.g. deployed to Vercel without backend deployed)
      const isNetworkError =
        err instanceof TypeError ||
        (err instanceof Error &&
          (err.message.toLowerCase().includes('fetch') ||
            err.message.toLowerCase().includes('network') ||
            err.message.toLowerCase().includes('failed')))

      if (isNetworkError) {
        console.warn(`[API] Backend at ${this.baseUrl} unreachable for ${endpoint}. Using built-in demo data fallback.`)
        const mock = handleMockRoute(endpoint, options)
        if (mock !== undefined) {
          return mock as T
        }
      }
      throw err
    }
  }

  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const data = await this.request<LoginResponse>('/api/demo/login', {
        method: 'POST',
        body: { email, password },
      })
      this.setToken(data.token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('homeguard_user', JSON.stringify(data.user))
      }
      return data
    } catch (err) {
      // Fallback: If user enters demo credentials and backend is unreachable
      if (email === 'demo@homeguard.ai' && password === 'demo123') {
        const mock = handleMockRoute('/api/demo/login', { method: 'POST' }) as LoginResponse
        this.setToken(mock.token)
        if (typeof window !== 'undefined') {
          localStorage.setItem('homeguard_user', JSON.stringify(mock.user))
        }
        return mock
      }
      throw err
    }
  }

  logout() {
    this.clearToken()
  }

  // Dashboard
  async getDashboard() {
    return this.request<DashboardData>('/api/dashboard')
  }

  // Electricity
  async getElectricityHistory() {
    return this.request<ElectricityReading[]>('/api/electricity/history')
  }

  async getElectricityPrediction() {
    return this.request<ElectricityPrediction>('/api/electricity/prediction')
  }

  async getElectricityAnomaly() {
    return this.request<AnomalyResult>('/api/electricity/anomaly', { method: 'POST' })
  }

  async addElectricityReading(data: { month: number; year: number; units_consumed: number; bill_amount: number }) {
    return this.request('/api/electricity/add-reading', { method: 'POST', body: data })
  }

  // Appliances
  async getAppliances() {
    return this.request<ApplianceData[]>('/api/appliances')
  }

  async getAppliance(id: string) {
    return this.request<ApplianceDetailData>(`/api/appliances/${id}`)
  }

  async createAppliance(data: Record<string, unknown>) {
    return this.request('/api/appliances', { method: 'POST', body: data })
  }

  async updateAppliance(id: string, data: Record<string, unknown>) {
    return this.request(`/api/appliances/${id}`, { method: 'PUT', body: data })
  }

  // Bills
  async uploadBill(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this.request<BillUploadResult>('/api/bills/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  }

  async confirmBill(data: { month: number; year: number; units_consumed: number; bill_amount: number; billing_period?: string }) {
    return this.request('/api/bills/confirm', { method: 'POST', body: data })
  }

  // Insights
  async getInsights() {
    return this.request<InsightData[]>('/api/insights')
  }

  // Recommendations
  async getRecommendations() {
    return this.request<RecommendationData[]>('/api/recommendations')
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string }>('/health')
  }
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export interface LoginResponse {
  token: string
  user: { id: string; email: string; name: string; household_name: string }
  message?: string
}

// ── Types ─────────────────────────────────────────────────────────

export interface DashboardData {
  user_name: string
  household_name: string
  home_health_score: number
  energy_current_kwh: number
  energy_change_pct: number
  current_bill: number
  predicted_next_bill: number
  predicted_next_kwh: number
  appliance_avg_health: number
  active_risks: number
  total_appliances: number
  recent_insights: InsightData[]
  consumption_trend: { month: string; month_num: number; year: number; kwh: number; bill: number }[]
  anomaly: AnomalyResult
  quick_stats: {
    total_consumption_12m: number
    avg_monthly_consumption: number
    total_bills_12m: number
    highest_month: number
    lowest_month: number
  }
}

export interface ElectricityReading {
  id: string
  month: number
  year: number
  units_kwh: number
  bill_amount: number
  source: string
}

export interface ElectricityPrediction {
  predicted_month: number
  predicted_year: number
  predicted_kwh: number
  predicted_bill: number
  confidence_low: number
  confidence_high: number
  percentage_change: number
  trend: string
  model_used: string
}

export interface AnomalyResult {
  is_anomaly: boolean
  current_usage: number
  normal_range_low: number
  normal_range_high: number
  baseline_average: number
  percentage_deviation: number
  risk_level: string
  explanation: string
}

export interface ApplianceData {
  id: string
  user_id: string
  name: string
  category: string
  brand?: string
  model?: string
  purchase_year?: number
  age_years?: number
  usage_hours_daily?: number
  usage_days_per_week?: number
  energy_rating?: string
  rated_power_watts?: number
  last_maintenance_date?: string
  maintenance_frequency_months?: number
  reported_issues?: number
  reported_symptoms?: string
  icon?: string
  status: string
  health_score: number
  risk_level: string
  energy_trend: number
  failure_probability: number
  energy_readings: { month: number; year: number; energy_kwh: number }[]
}

export interface ApplianceDetailData extends ApplianceData {
  maintenance_records: { id: string; maintenance_date: string; maintenance_type: string; description: string; cost: number; performed_by: string }[]
  maintenance_gap_months: number
  contributing_factors: { factor: string; value: number; importance: number; concern_level: string }[]
  recommendation: string
  ai_assessment: string
  class_probabilities: Record<string, number>
  disclaimer: string
}

export interface BillUploadResult {
  success: boolean
  billing_period?: string
  units_consumed?: number
  bill_amount?: number
  meter_number?: string
  consumer_number?: string
  raw_text?: string
  message: string
}

export interface InsightData {
  id: string
  category: string
  severity: string
  title: string
  description: string
  explanation?: string
  recommendation?: string
  related_appliance_id?: string
  is_read?: boolean | number
  created_at?: string
}

export interface RecommendationData {
  id: string
  priority: string
  category: string
  title: string
  description: string
  expected_impact?: string
  reason?: string
  suggested_action?: string
  related_appliance_id?: string
  is_completed?: boolean | number
  created_at?: string
}

export const api = new ApiClient(API_BASE)
export default api
