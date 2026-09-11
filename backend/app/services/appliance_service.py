"""Appliance service — handles appliance CRUD and health predictions."""
from typing import List, Dict, Optional
from datetime import datetime, date
from app.database import query, execute
from app.ml.appliance_model import predict_health
import uuid


DEMO_USER_ID = "demo-user-001"


def get_all_appliances(user_id: str = DEMO_USER_ID) -> List[Dict]:
    """Get all appliances for a user with computed health data."""
    appliances = query(
        """SELECT * FROM appliances WHERE user_id = ? AND status = 'active' ORDER BY name""",
        (user_id,)
    )
    
    result = []
    for appl in appliances:
        # Get energy readings
        readings = query(
            """SELECT month, year, energy_kwh FROM appliance_readings 
               WHERE appliance_id = ? ORDER BY year ASC, month ASC""",
            (appl["id"],)
        )
        
        # Calculate energy trend
        energy_trend = 0.0
        if len(readings) >= 3:
            recent = [r["energy_kwh"] for r in readings[-3:]]
            older = [r["energy_kwh"] for r in readings[:max(1, len(readings)-3)]]
            if sum(older) > 0:
                energy_trend = round(((sum(recent)/len(recent)) - (sum(older)/len(older))) / (sum(older)/len(older)) * 100, 1)
        
        # Calculate maintenance gap
        maintenance_gap = 0
        if appl["last_maintenance_date"]:
            try:
                last_maint = datetime.strptime(appl["last_maintenance_date"], "%Y-%m-%d")
                maintenance_gap = (datetime.now() - last_maint).days / 30
            except ValueError:
                maintenance_gap = 6
        else:
            maintenance_gap = appl["age_years"] * 12 if appl["age_years"] else 12
        
        # Predict health
        health_data = predict_health({
            "age_years": appl["age_years"] or 1,
            "usage_hours_daily": appl["usage_hours_daily"] or 4,
            "energy_consumption": readings[-1]["energy_kwh"] if readings else 30,
            "energy_change_pct": energy_trend,
            "maintenance_gap_months": maintenance_gap,
            "maintenance_frequency_months": appl["maintenance_frequency_months"] or 12,
            "reported_issues": appl["reported_issues"] or 0,
            "usage_intensity": min(1.0, (appl["usage_hours_daily"] or 4) / 24),
        })
        
        appl_data = dict(appl)
        appl_data["health_score"] = health_data["health_score"]
        appl_data["risk_level"] = health_data["risk_level"]
        appl_data["energy_trend"] = energy_trend
        appl_data["energy_readings"] = readings
        appl_data["failure_probability"] = health_data["failure_probability"]
        
        result.append(appl_data)
    
    return result


def get_appliance_detail(appliance_id: str) -> Optional[Dict]:
    """Get detailed appliance info with health prediction and maintenance history."""
    appl = query(
        "SELECT * FROM appliances WHERE id = ?",
        (appliance_id,), one=True
    )
    
    if not appl:
        return None
    
    # Energy readings
    readings = query(
        """SELECT month, year, energy_kwh FROM appliance_readings 
           WHERE appliance_id = ? ORDER BY year ASC, month ASC""",
        (appliance_id,)
    )
    
    # Maintenance records
    maintenance = query(
        """SELECT * FROM maintenance_records 
           WHERE appliance_id = ? ORDER BY maintenance_date DESC""",
        (appliance_id,)
    )
    
    # Energy trend
    energy_trend = 0.0
    if len(readings) >= 3:
        recent = [r["energy_kwh"] for r in readings[-3:]]
        older = [r["energy_kwh"] for r in readings[:max(1, len(readings)-3)]]
        if sum(older) > 0:
            energy_trend = round(((sum(recent)/len(recent)) - (sum(older)/len(older))) / (sum(older)/len(older)) * 100, 1)
    
    # Maintenance gap
    maintenance_gap = 0
    if appl["last_maintenance_date"]:
        try:
            last_maint = datetime.strptime(appl["last_maintenance_date"], "%Y-%m-%d")
            maintenance_gap = (datetime.now() - last_maint).days / 30
        except ValueError:
            maintenance_gap = 6
    else:
        maintenance_gap = appl["age_years"] * 12 if appl["age_years"] else 12
    
    # Full health prediction
    health_data = predict_health({
        "age_years": appl["age_years"] or 1,
        "usage_hours_daily": appl["usage_hours_daily"] or 4,
        "energy_consumption": readings[-1]["energy_kwh"] if readings else 30,
        "energy_change_pct": energy_trend,
        "maintenance_gap_months": maintenance_gap,
        "maintenance_frequency_months": appl["maintenance_frequency_months"] or 12,
        "reported_issues": appl["reported_issues"] or 0,
        "usage_intensity": min(1.0, (appl["usage_hours_daily"] or 4) / 24),
    })
    
    result = dict(appl)
    result["energy_readings"] = readings
    result["maintenance_records"] = maintenance
    result["energy_trend"] = energy_trend
    result["maintenance_gap_months"] = round(maintenance_gap, 1)
    result["health_score"] = health_data["health_score"]
    result["risk_level"] = health_data["risk_level"]
    result["failure_probability"] = health_data["failure_probability"]
    result["contributing_factors"] = health_data["contributing_factors"]
    result["recommendation"] = health_data["recommendation"]
    result["ai_assessment"] = health_data["ai_assessment"]
    result["class_probabilities"] = health_data["class_probabilities"]
    result["disclaimer"] = health_data["disclaimer"]
    
    return result


def create_appliance(user_id: str, data: Dict) -> Dict:
    """Create a new appliance."""
    appl_id = str(uuid.uuid4())
    
    execute(
        """INSERT INTO appliances 
           (id, user_id, name, category, brand, model, purchase_year, age_years,
            usage_hours_daily, usage_days_per_week, energy_rating, rated_power_watts,
            last_maintenance_date, maintenance_frequency_months, reported_issues,
            reported_symptoms, icon)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (appl_id, user_id, data.get("name"), data.get("category"),
         data.get("brand"), data.get("model"), data.get("purchase_year"),
         data.get("age_years"), data.get("usage_hours_daily"),
         data.get("usage_days_per_week", 7), data.get("energy_rating"),
         data.get("rated_power_watts"), data.get("last_maintenance_date"),
         data.get("maintenance_frequency_months", 12), data.get("reported_issues", 0),
         data.get("reported_symptoms"), data.get("icon"))
    )
    
    return {"id": appl_id, **data}


def update_appliance(appliance_id: str, data: Dict) -> Optional[Dict]:
    """Update an existing appliance."""
    appl = query("SELECT * FROM appliances WHERE id = ?", (appliance_id,), one=True)
    if not appl:
        return None
    
    fields = []
    values = []
    for key in ["name", "category", "brand", "model", "purchase_year", "age_years",
                 "usage_hours_daily", "usage_days_per_week", "energy_rating", "rated_power_watts",
                 "last_maintenance_date", "maintenance_frequency_months", "reported_issues",
                 "reported_symptoms", "icon"]:
        if key in data and data[key] is not None:
            fields.append(f"{key} = ?")
            values.append(data[key])
    
    if fields:
        values.append(appliance_id)
        execute(
            f"UPDATE appliances SET {', '.join(fields)} WHERE id = ?",
            tuple(values)
        )
    
    return get_appliance_detail(appliance_id)
