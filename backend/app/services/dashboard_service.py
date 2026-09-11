"""Dashboard service — aggregates data for the main dashboard view."""
from typing import Dict
from app.database import query
from app.services.electricity_service import get_history, get_prediction, get_anomaly
from app.services.appliance_service import get_all_appliances
from app.config import settings
import numpy as np


DEMO_USER_ID = "demo-user-001"


def get_dashboard_data(user_id: str = DEMO_USER_ID) -> Dict:
    """Build the complete dashboard response."""
    # User info
    user = query("SELECT * FROM users WHERE id = ?", (user_id,), one=True)
    if not user:
        return {"error": "User not found"}

    # Electricity data
    history = get_history(user_id)
    prediction = get_prediction(user_id)
    anomaly = get_anomaly(user_id)

    # Current consumption
    current_kwh = history[-1]["units_kwh"] if history else 0
    current_bill = history[-1]["bill_amount"] if history else 0

    # Previous month for comparison
    prev_kwh = history[-2]["units_kwh"] if len(history) >= 2 else current_kwh
    energy_change_pct = round(((current_kwh - prev_kwh) / prev_kwh) * 100, 1) if prev_kwh > 0 else 0

    # Appliance data
    appliances = get_all_appliances(user_id)
    health_scores = [a["health_score"] for a in appliances if a.get("health_score")]
    avg_health = round(np.mean(health_scores), 0) if health_scores else 100

    # Active risks (appliances with Moderate or High Risk)
    active_risks = sum(1 for a in appliances if a.get("risk_level") in ("Moderate Risk", "High Risk"))

    # Home health score (weighted: 40% appliance health, 30% energy pattern, 30% maintenance)
    energy_score = max(0, 100 - abs(anomaly.get("percentage_deviation", 0)) * 1.5) if anomaly else 100
    home_health = round(avg_health * 0.5 + energy_score * 0.3 + min(100, avg_health + 10) * 0.2, 0)
    home_health = min(100, max(0, home_health))

    # Recent insights
    insights = query(
        """SELECT id, category, severity, title, description, created_at 
           FROM insights WHERE user_id = ? ORDER BY created_at DESC LIMIT 5""",
        (user_id,)
    )

    # Consumption trend for chart
    consumption_trend = [
        {
            "month": _month_name(h["month"]),
            "month_num": h["month"],
            "year": h["year"],
            "kwh": h["units_kwh"],
            "bill": h["bill_amount"],
        }
        for h in history
    ]

    # Predicted next month
    predicted_kwh = prediction.get("predicted_kwh", 0) if isinstance(prediction, dict) else 0
    predicted_bill = prediction.get("predicted_bill", 0) if isinstance(prediction, dict) else 0

    return {
        "user_name": user["name"],
        "household_name": user["household_name"],
        "home_health_score": home_health,
        "energy_current_kwh": current_kwh,
        "energy_change_pct": energy_change_pct,
        "current_bill": current_bill,
        "predicted_next_bill": predicted_bill,
        "predicted_next_kwh": predicted_kwh,
        "appliance_avg_health": avg_health,
        "active_risks": active_risks,
        "total_appliances": len(appliances),
        "recent_insights": insights,
        "consumption_trend": consumption_trend,
        "anomaly": anomaly,
        "quick_stats": {
            "total_consumption_12m": round(sum(h["units_kwh"] for h in history), 1),
            "avg_monthly_consumption": round(np.mean([h["units_kwh"] for h in history]), 1) if history else 0,
            "total_bills_12m": round(sum(h["bill_amount"] for h in history if h["bill_amount"]), 0),
            "highest_month": max(history, key=lambda h: h["units_kwh"])["month"] if history else 0,
            "lowest_month": min(history, key=lambda h: h["units_kwh"])["month"] if history else 0,
        },
    }


def _month_name(month: int) -> str:
    """Convert month number to short name."""
    names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return names[month] if 1 <= month <= 12 else str(month)
