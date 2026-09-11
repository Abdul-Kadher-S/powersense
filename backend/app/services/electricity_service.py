"""Electricity service — handles consumption data, predictions, and anomalies."""
from typing import List, Dict, Optional
from app.database import query, execute
from app.ml.electricity_model import predict_next_month, detect_anomaly
from app.config import settings
import uuid


DEMO_USER_ID = "demo-user-001"


def get_history(user_id: str = DEMO_USER_ID) -> List[Dict]:
    """Get all electricity readings for a user, sorted chronologically."""
    rows = query(
        """SELECT id, month, year, units_kwh, bill_amount, source
           FROM electricity_readings 
           WHERE user_id = ?
           ORDER BY year ASC, month ASC""",
        (user_id,)
    )
    return rows


def get_prediction(user_id: str = DEMO_USER_ID) -> Dict:
    """Get next month's electricity prediction."""
    history = get_history(user_id)
    if not history:
        return {"error": "No historical data available"}
    
    prediction = predict_next_month(history, settings.ELECTRICITY_RATE)
    return prediction


def get_anomaly(user_id: str = DEMO_USER_ID) -> Dict:
    """Detect anomalies in the latest electricity reading."""
    history = get_history(user_id)
    if not history:
        return {"error": "No historical data available"}
    
    return detect_anomaly(history)


def add_reading(user_id: str, month: int, year: int, units_kwh: float, 
                bill_amount: Optional[float] = None, source: str = "manual") -> Dict:
    """Add a new electricity reading."""
    reading_id = str(uuid.uuid4())
    if bill_amount is None:
        bill_amount = units_kwh * settings.ELECTRICITY_RATE
    
    execute(
        """INSERT INTO electricity_readings 
           (id, user_id, month, year, units_kwh, bill_amount, source)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (reading_id, user_id, month, year, units_kwh, bill_amount, source)
    )
    
    return {
        "id": reading_id,
        "month": month,
        "year": year,
        "units_kwh": units_kwh,
        "bill_amount": bill_amount,
        "source": source,
    }
