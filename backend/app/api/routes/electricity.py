"""Electricity routes."""
from fastapi import APIRouter
from app.services.electricity_service import get_history, get_prediction, get_anomaly, add_reading
from app.schemas import BillConfirmRequest

router = APIRouter(prefix="/api/electricity", tags=["electricity"])

DEMO_USER_ID = "demo-user-001"


@router.get("/history")
async def electricity_history():
    """Get 12-month electricity consumption history."""
    return get_history()


@router.get("/prediction")
async def electricity_prediction():
    """Get next month's consumption and bill prediction."""
    return get_prediction()


@router.post("/anomaly")
async def electricity_anomaly():
    """Detect anomalies in current consumption."""
    return get_anomaly()


@router.post("/add-reading")
async def add_electricity_reading(data: BillConfirmRequest):
    """Add a new electricity reading (from manual entry or confirmed OCR)."""
    result = add_reading(
        user_id=DEMO_USER_ID,
        month=data.month,
        year=data.year,
        units_kwh=data.units_consumed,
        bill_amount=data.bill_amount,
        source="manual"
    )
    return result
