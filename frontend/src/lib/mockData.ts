/**
 * Realistic demo data fallback when the Python FastAPI backend is not deployed
 * (e.g. when frontend is deployed on Vercel before backend deployment).
 */

import type {
  DashboardData,
  ElectricityReading,
  ElectricityPrediction,
  AnomalyResult,
  ApplianceData,
  ApplianceDetailData,
  InsightData,
  RecommendationData,
  LoginResponse,
  BillUploadResult,
} from './api'

export const mockUser: LoginResponse = {
  token: 'demo-jwt-token-homeguard-2026',
  user: {
    id: 'demo-user-001',
    email: 'demo@homeguard.ai',
    name: 'Demo User',
    household_name: 'My Smart Home',
  },
  message: 'Logged in successfully (demo session)',
}

export const mockElectricityHistory: ElectricityReading[] = [
  { id: 'el-1', month: 9, year: 2025, units_kwh: 182, bill_amount: 1456.0, source: 'demo' },
  { id: 'el-2', month: 10, year: 2025, units_kwh: 189, bill_amount: 1512.0, source: 'demo' },
  { id: 'el-3', month: 11, year: 2025, units_kwh: 178, bill_amount: 1424.0, source: 'demo' },
  { id: 'el-4', month: 12, year: 2025, units_kwh: 195, bill_amount: 1560.0, source: 'demo' },
  { id: 'el-5', month: 1, year: 2026, units_kwh: 188, bill_amount: 1504.0, source: 'demo' },
  { id: 'el-6', month: 2, year: 2026, units_kwh: 201, bill_amount: 1608.0, source: 'demo' },
  { id: 'el-7', month: 3, year: 2026, units_kwh: 210, bill_amount: 1680.0, source: 'demo' },
  { id: 'el-8', month: 4, year: 2026, units_kwh: 228, bill_amount: 1824.0, source: 'demo' },
  { id: 'el-9', month: 5, year: 2026, units_kwh: 247, bill_amount: 1976.0, source: 'demo' },
  { id: 'el-10', month: 6, year: 2026, units_kwh: 261, bill_amount: 2088.0, source: 'demo' },
  { id: 'el-11', month: 7, year: 2026, units_kwh: 272, bill_amount: 2176.0, source: 'demo' },
  { id: 'el-12', month: 8, year: 2026, units_kwh: 298, bill_amount: 2384.0, source: 'demo' },
]

export const mockPrediction: ElectricityPrediction = {
  predicted_month: 9,
  predicted_year: 2026,
  predicted_kwh: 312,
  predicted_bill: 2496.0,
  confidence_low: 285,
  confidence_high: 338,
  percentage_change: 4.7,
  trend: 'Upward (Summer degradation peak)',
  model_used: 'Random Forest Regressor (R² = 0.94)',
}

export const mockAnomaly: AnomalyResult = {
  is_anomaly: true,
  current_usage: 298,
  normal_range_low: 210,
  normal_range_high: 265,
  baseline_average: 224,
  percentage_deviation: 33.0,
  risk_level: 'high',
  explanation:
    'August consumption (298 kWh) is 33% higher than your seasonal baseline. Continuous compressor run-time on the Samsung refrigerator combined with high ambient temperature is contributing ~48 extra kWh.',
}

const defaultReadings = [
  { month: 5, year: 2026, energy_kwh: 42 },
  { month: 6, year: 2026, energy_kwh: 45 },
  { month: 7, year: 2026, energy_kwh: 46 },
  { month: 8, year: 2026, energy_kwh: 54 },
]

export const mockAppliances: ApplianceData[] = [
  {
    id: 'appl-refrigerator',
    user_id: 'demo-user-001',
    name: 'Refrigerator',
    category: 'Kitchen',
    brand: 'Samsung',
    model: 'RT42',
    purchase_year: 2022,
    age_years: 4.0,
    usage_hours_daily: 24.0,
    usage_days_per_week: 7,
    energy_rating: '3-Star',
    rated_power_watts: 200,
    last_maintenance_date: '2025-11-15',
    maintenance_frequency_months: 12,
    reported_issues: 2,
    reported_symptoms: 'Loud compressor cycling, occasional frost buildup on cooling coils',
    icon: 'refrigerator',
    status: 'active',
    health_score: 58,
    risk_level: 'High Risk',
    energy_trend: 18.5,
    failure_probability: 0.48,
    energy_readings: [
      { month: 5, year: 2026, energy_kwh: 52 },
      { month: 6, year: 2026, energy_kwh: 58 },
      { month: 7, year: 2026, energy_kwh: 64 },
      { month: 8, year: 2026, energy_kwh: 76 },
    ],
  },
  {
    id: 'appl-ac',
    user_id: 'demo-user-001',
    name: 'Air Conditioner',
    category: 'Cooling',
    brand: 'Daikin',
    model: 'FTKF50',
    purchase_year: 2023,
    age_years: 3.0,
    usage_hours_daily: 8.0,
    usage_days_per_week: 7,
    energy_rating: '5-Star',
    rated_power_watts: 1500,
    last_maintenance_date: '2026-03-10',
    maintenance_frequency_months: 6,
    reported_issues: 1,
    reported_symptoms: 'Airflow restriction, dust accumulation on filter mesh',
    icon: 'air-vent',
    status: 'active',
    health_score: 72,
    risk_level: 'Moderate Risk',
    energy_trend: 8.2,
    failure_probability: 0.22,
    energy_readings: [
      { month: 5, year: 2026, energy_kwh: 95 },
      { month: 6, year: 2026, energy_kwh: 110 },
      { month: 7, year: 2026, energy_kwh: 118 },
      { month: 8, year: 2026, energy_kwh: 125 },
    ],
  },
  {
    id: 'appl-washer',
    user_id: 'demo-user-001',
    name: 'Washing Machine',
    category: 'Laundry',
    brand: 'LG',
    model: 'FHM1207',
    purchase_year: 2024,
    age_years: 2.0,
    usage_hours_daily: 1.5,
    usage_days_per_week: 4,
    energy_rating: '5-Star',
    rated_power_watts: 800,
    last_maintenance_date: '2026-01-20',
    maintenance_frequency_months: 12,
    reported_issues: 0,
    reported_symptoms: 'None — operating smoothly',
    icon: 'washing-machine',
    status: 'active',
    health_score: 89,
    risk_level: 'Healthy',
    energy_trend: -1.5,
    failure_probability: 0.05,
    energy_readings: defaultReadings,
  },
  {
    id: 'appl-geyser',
    user_id: 'demo-user-001',
    name: 'Water Heater (Geyser)',
    category: 'Bathroom',
    brand: 'AO Smith',
    model: 'HSE-SDS-25',
    purchase_year: 2021,
    age_years: 5.0,
    usage_hours_daily: 2.0,
    usage_days_per_week: 7,
    energy_rating: '4-Star',
    rated_power_watts: 2000,
    last_maintenance_date: '2025-08-10',
    maintenance_frequency_months: 12,
    reported_issues: 1,
    reported_symptoms: 'Takes 8-10 mins longer to reach cutoff temperature',
    icon: 'flame',
    status: 'active',
    health_score: 64,
    risk_level: 'Moderate Risk',
    energy_trend: 12.0,
    failure_probability: 0.28,
    energy_readings: defaultReadings,
  },
  {
    id: 'appl-tv',
    user_id: 'demo-user-001',
    name: 'Smart OLED TV',
    category: 'Entertainment',
    brand: 'Sony',
    model: 'Bravia XR 55',
    purchase_year: 2025,
    age_years: 1.0,
    usage_hours_daily: 4.5,
    usage_days_per_week: 7,
    energy_rating: '5-Star',
    rated_power_watts: 120,
    last_maintenance_date: '2025-09-01',
    maintenance_frequency_months: 24,
    reported_issues: 0,
    reported_symptoms: 'Optimal performance',
    icon: 'tv',
    status: 'active',
    health_score: 95,
    risk_level: 'Healthy',
    energy_trend: 0.0,
    failure_probability: 0.02,
    energy_readings: defaultReadings,
  },
  {
    id: 'appl-microwave',
    user_id: 'demo-user-001',
    name: 'Microwave Oven',
    category: 'Kitchen',
    brand: 'Panasonic',
    model: 'NN-CT645M',
    purchase_year: 2023,
    age_years: 3.0,
    usage_hours_daily: 0.5,
    usage_days_per_week: 6,
    energy_rating: '4-Star',
    rated_power_watts: 900,
    last_maintenance_date: '2025-10-05',
    maintenance_frequency_months: 18,
    reported_issues: 0,
    reported_symptoms: 'Normal operation',
    icon: 'microwave',
    status: 'active',
    health_score: 91,
    risk_level: 'Healthy',
    energy_trend: 1.2,
    failure_probability: 0.04,
    energy_readings: defaultReadings,
  },
]

export const mockInsights: InsightData[] = [
  {
    id: 'ins-1',
    category: 'appliance',
    severity: 'high',
    title: 'Samsung Refrigerator Showing Compressor Fatigue',
    description:
      'Continuous running duty cycle increased by 42% over the last 30 days. Estimated failure probability is 48% within 90 days.',
    explanation:
      'The condenser coils may be choked with dust, causing the compressor to overheat and run 21 hours/day instead of the typical 14 hours.',
    recommendation: 'Clean back condenser coils and schedule gasket inspection to prevent motor seizure.',
    related_appliance_id: 'appl-refrigerator',
    created_at: '2026-08-30T10:00:00Z',
  },
  {
    id: 'ins-2',
    category: 'energy',
    severity: 'warning',
    title: 'August Electricity Bill Exceeded Normal Trend by 33%',
    description:
      'Monthly bill reached ₹2,384 compared to ₹1,824 historical average. AC runtime and cooling losses are the primary drivers.',
    explanation: 'Peak summer temperature combined with clogged AC air filters reduced heat exchange efficiency by 22%.',
    recommendation: 'Set AC thermostat to 24°C instead of 20°C and clean the front mesh filters.',
    related_appliance_id: 'appl-ac',
    created_at: '2026-08-28T14:30:00Z',
  },
  {
    id: 'ins-3',
    category: 'cost',
    severity: 'info',
    title: 'Potential Monthly Savings of ₹450 Identified',
    description:
      'By shifting washing machine cycles to off-peak morning hours and tuning standby appliances, you can save up to ₹5,400 annually.',
    explanation: 'Standby vampire draw across electronics averages 38 watts continuous.',
    recommendation: 'Use a smart power strip for entertainment units and run washer loads before 10 AM.',
    related_appliance_id: 'appl-washer',
    created_at: '2026-08-25T09:00:00Z',
  },
  {
    id: 'ins-4',
    category: 'appliance',
    severity: 'warning',
    title: 'Water Heater Heating Element Limescale Buildup',
    description: 'Heating cycle duration extended from 18 minutes to 27 minutes for a full tank.',
    explanation: 'Hard water mineral deposits insulate the heating coil, forcing it to draw power for 50% longer.',
    recommendation: 'Perform descaling flush and inspect anode rod before winter.',
    related_appliance_id: 'appl-geyser',
    created_at: '2026-08-20T16:00:00Z',
  },
]

export const mockRecommendations: RecommendationData[] = [
  {
    id: 'rec-1',
    category: 'appliance',
    title: 'Clean Refrigerator Condenser Coils & Door Seal',
    description:
      'Dust accumulation on coils is making the compressor work 40% harder, driving up your power bill and wearing down the motor.',
    priority: 'high',
    related_appliance_id: 'appl-refrigerator',
    expected_impact: 'Saves ~₹320/month and extends compressor life by 3+ years',
    reason: 'Compressor run time has risen to 88% of daytime hours',
    suggested_action: '1. Unplug refrigerator\n2. Vacuum rear condenser coils\n3. Wipe rubber door gaskets with warm water',
    created_at: '2026-08-30T10:00:00Z',
  },
  {
    id: 'rec-2',
    category: 'cooling',
    title: 'Wash Daikin AC Air Filters & Set ECO 24°C',
    description:
      'Clogged air filters force the blower motor to strain, reducing cooling airflow and increasing power consumption by 15%.',
    priority: 'moderate',
    related_appliance_id: 'appl-ac',
    expected_impact: 'Saves ~₹280/month and improves indoor air quality',
    reason: 'Airflow restriction flagged in last diagnostic cycle',
    suggested_action: '1. Pop open front grille\n2. Wash mesh filters under tap\n3. Reinstall once completely dry',
    created_at: '2026-08-28T14:30:00Z',
  },
  {
    id: 'rec-3',
    category: 'heating',
    title: 'Flush Water Heater Tank to Remove Mineral Sediment',
    description:
      'Sediment at the bottom of the geyser tank acts as a thermal barrier between the heating element and the water.',
    priority: 'moderate',
    related_appliance_id: 'appl-geyser',
    expected_impact: 'Restores rapid heating and reduces heating electricity draw by 18%',
    reason: 'Heating time increased by 9 minutes per tank',
    suggested_action: 'Drain 5 liters from bottom valve to flush loose sediment before winter arrives',
    created_at: '2026-08-20T16:00:00Z',
  },
  {
    id: 'rec-4',
    category: 'energy',
    title: 'Shift Washing Machine Usage to Morning Solar Hours',
    description:
      'Operating the washer between 8 AM and 11 AM takes advantage of cooler ambient temperatures and reduced peak grid strain.',
    priority: 'low',
    related_appliance_id: 'appl-washer',
    expected_impact: 'Optimizes household energy distribution',
    reason: 'Consistent laundry usage detected in evening peak hours (7-9 PM)',
    suggested_action: 'Use timer delay to start washing cycle at 9 AM',
    created_at: '2026-08-15T11:00:00Z',
  },
]

export const mockDashboardData: DashboardData = {
  user_name: 'Demo User',
  household_name: 'My Smart Home',
  home_health_score: 74,
  energy_current_kwh: 298,
  energy_change_pct: 9.6,
  current_bill: 2384.0,
  predicted_next_bill: 2496.0,
  predicted_next_kwh: 312,
  appliance_avg_health: 78,
  active_risks: 2,
  total_appliances: 6,
  recent_insights: mockInsights,
  consumption_trend: mockElectricityHistory.map((h) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][h.month - 1] || String(h.month),
    month_num: h.month,
    year: h.year,
    kwh: h.units_kwh,
    bill: h.bill_amount,
  })),
  anomaly: mockAnomaly,
  quick_stats: {
    total_consumption_12m: 2651,
    avg_monthly_consumption: 220.9,
    total_bills_12m: 21208,
    highest_month: 8,
    lowest_month: 11,
  },
}

export function getMockApplianceDetail(id: string): ApplianceDetailData {
  const base = mockAppliances.find((a) => a.id === id) || mockAppliances[0]
  return {
    ...base,
    maintenance_records: [
      {
        id: 'mr-1',
        maintenance_date: '2025-11-15',
        maintenance_type: 'Annual Inspection',
        description: 'Compressor check and thermostat calibration',
        cost: 650,
        performed_by: 'Authorized Brand Service',
      },
    ],
    maintenance_gap_months: 10,
    contributing_factors: [
      { factor: 'Operating Age', value: 4, importance: 0.35, concern_level: 'Moderate' },
      { factor: 'Duty Cycle', value: 24, importance: 0.40, concern_level: 'High' },
      { factor: 'Energy Consumption Trend', value: 18.5, importance: 0.25, concern_level: 'High' },
    ],
    recommendation: 'Clean condenser coils and check door gasket seal to relieve compressor strain.',
    ai_assessment:
      base.health_score < 60
        ? 'Diagnostic signals indicate thermal stress and mechanical wear. Compressor is cycling significantly longer than baseline parameters. Preventive servicing is strongly recommended within 30 days.'
        : base.health_score < 75
        ? 'Appliance operates within acceptable parameters with minor degradation. Air filter cleaning and general inspection recommended to preserve high energy efficiency.'
        : 'Appliance is in pristine health. Power consumption and operating cycle match manufacturer specifications perfectly.',
    class_probabilities: { Healthy: 0.12, Moderate_Risk: 0.40, High_Risk: 0.48 },
    disclaimer: 'Predictions are generated using synthetic machine-learning models for demonstration purposes.',
  }
}

export function handleMockRoute(endpoint: string, options: { method?: string; body?: unknown }): unknown {
  if (endpoint.includes('/api/demo/login') || endpoint.includes('/api/auth/login')) {
    return mockUser
  }
  if (endpoint === '/api/dashboard') {
    return mockDashboardData
  }
  if (endpoint === '/api/electricity/history') {
    return mockElectricityHistory
  }
  if (endpoint === '/api/electricity/prediction') {
    return mockPrediction
  }
  if (endpoint === '/api/electricity/anomaly') {
    return mockAnomaly
  }
  if (endpoint === '/api/electricity/add-reading') {
    return { success: true, message: 'Reading added to demo session' }
  }
  if (endpoint === '/api/appliances') {
    return mockAppliances
  }
  if (endpoint.startsWith('/api/appliances/')) {
    const id = endpoint.replace('/api/appliances/', '')
    return getMockApplianceDetail(id)
  }
  if (endpoint === '/api/insights') {
    return mockInsights
  }
  if (endpoint === '/api/recommendations') {
    return mockRecommendations
  }
  if (endpoint === '/api/bills/upload') {
    const result: BillUploadResult = {
      success: true,
      billing_period: 'August 2026',
      units_consumed: 298,
      bill_amount: 2384.0,
      message: 'Bill parsed successfully via OCR engine',
    }
    return result
  }
  if (endpoint === '/api/bills/confirm') {
    return { success: true, message: 'Bill confirmed and added to consumption history' }
  }
  if (endpoint === '/health') {
    return { status: 'healthy', mode: 'demo-fallback' }
  }

  return undefined
}
