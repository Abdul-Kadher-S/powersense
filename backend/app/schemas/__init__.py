"""Pydantic schemas for API request/response models."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ── Auth ───────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: dict
    message: str


# ── Electricity ────────────────────────────────────────────────────
class ElectricityReading(BaseModel):
    id: str
    month: int
    year: int
    units_kwh: float
    bill_amount: Optional[float] = None
    source: str = "demo"


class ElectricityPrediction(BaseModel):
    predicted_month: int
    predicted_year: int
    predicted_kwh: float
    predicted_bill: float
    confidence_low: float
    confidence_high: float
    percentage_change: float
    trend: str
    model_used: str


class AnomalyResult(BaseModel):
    is_anomaly: bool
    current_usage: float
    normal_range_low: float
    normal_range_high: float
    baseline_average: float
    percentage_deviation: float
    risk_level: str  # low, moderate, high, critical
    explanation: str


# ── Appliance ──────────────────────────────────────────────────────
class ApplianceBase(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    model: Optional[str] = None
    purchase_year: Optional[int] = None
    age_years: Optional[float] = None
    usage_hours_daily: Optional[float] = None
    usage_days_per_week: int = 7
    energy_rating: Optional[str] = None
    rated_power_watts: Optional[float] = None
    last_maintenance_date: Optional[str] = None
    maintenance_frequency_months: Optional[int] = 12
    reported_issues: int = 0
    reported_symptoms: Optional[str] = None
    icon: Optional[str] = None


class ApplianceCreate(ApplianceBase):
    pass


class ApplianceResponse(ApplianceBase):
    id: str
    user_id: str
    status: str = "active"
    created_at: Optional[str] = None
    # Computed fields (filled by service)
    health_score: Optional[float] = None
    risk_level: Optional[str] = None
    energy_trend: Optional[float] = None
    energy_readings: Optional[List[dict]] = None
    maintenance_records: Optional[List[dict]] = None


class ApplianceHealthPrediction(BaseModel):
    appliance_id: str
    appliance_name: str
    health_score: float
    risk_level: str
    failure_probability: float
    contributing_factors: List[Dict[str, Any]]
    recommendation: str
    ai_assessment: str
    disclaimer: str = "This is an MVP/demo model estimate and not a scientifically validated prediction."


class HealthPredictionRequest(BaseModel):
    age_years: float = Field(ge=0)
    usage_hours_daily: float = Field(ge=0)
    energy_consumption: float = Field(ge=0)
    energy_change_pct: float = 0.0
    maintenance_gap_months: float = 0.0
    maintenance_frequency_months: int = 12
    reported_issues: int = 0
    usage_intensity: float = 0.5  # 0-1 scale


# ── Bill Upload ────────────────────────────────────────────────────
class BillUploadResponse(BaseModel):
    success: bool
    billing_period: Optional[str] = None
    units_consumed: Optional[float] = None
    bill_amount: Optional[float] = None
    meter_number: Optional[str] = None
    consumer_number: Optional[str] = None
    raw_text: Optional[str] = None
    message: str


class BillConfirmRequest(BaseModel):
    billing_period: Optional[str] = None
    month: int
    year: int
    units_consumed: float
    bill_amount: float
    meter_number: Optional[str] = None


# ── Dashboard ──────────────────────────────────────────────────────
class DashboardResponse(BaseModel):
    user_name: str
    household_name: str
    home_health_score: float
    energy_current_kwh: float
    energy_change_pct: float
    current_bill: float
    predicted_next_bill: float
    predicted_next_kwh: float
    appliance_avg_health: float
    active_risks: int
    total_appliances: int
    recent_insights: List[dict]
    quick_stats: dict
    consumption_trend: List[dict]


# ── Insights ───────────────────────────────────────────────────────
class InsightResponse(BaseModel):
    id: str
    category: str
    severity: str
    title: str
    description: str
    explanation: Optional[str] = None
    recommendation: Optional[str] = None
    related_appliance_id: Optional[str] = None
    is_read: bool = False
    created_at: Optional[str] = None


# ── Recommendations ───────────────────────────────────────────────
class RecommendationResponse(BaseModel):
    id: str
    priority: str
    category: str
    title: str
    description: str
    expected_impact: Optional[str] = None
    reason: Optional[str] = None
    suggested_action: Optional[str] = None
    related_appliance_id: Optional[str] = None
    is_completed: bool = False
    created_at: Optional[str] = None
