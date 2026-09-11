"""Appliance routes."""
from fastapi import APIRouter, HTTPException
from app.services.appliance_service import (
    get_all_appliances, get_appliance_detail, create_appliance, update_appliance
)
from app.schemas import ApplianceCreate, HealthPredictionRequest
from app.ml.appliance_model import predict_health

router = APIRouter(prefix="/api/appliances", tags=["appliances"])

DEMO_USER_ID = "demo-user-001"


@router.get("")
async def list_appliances():
    """Get all appliances with health summaries."""
    return get_all_appliances()


@router.get("/{appliance_id}")
async def get_appliance(appliance_id: str):
    """Get detailed appliance information with health prediction."""
    result = get_appliance_detail(appliance_id)
    if not result:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return result


@router.post("")
async def add_appliance(data: ApplianceCreate):
    """Add a new appliance."""
    result = create_appliance(DEMO_USER_ID, data.model_dump())
    return result


@router.put("/{appliance_id}")
async def edit_appliance(appliance_id: str, data: ApplianceCreate):
    """Update an existing appliance."""
    result = update_appliance(appliance_id, data.model_dump(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Appliance not found")
    return result


@router.post("/predict-health")
async def predict_appliance_health(data: HealthPredictionRequest):
    """Run ML health prediction for custom appliance data."""
    result = predict_health(data.model_dump())
    return result
