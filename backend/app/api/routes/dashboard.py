"""Dashboard route."""
from fastapi import APIRouter
from app.services.dashboard_service import get_dashboard_data

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard")
async def dashboard():
    """Get aggregated dashboard data."""
    return get_dashboard_data()
