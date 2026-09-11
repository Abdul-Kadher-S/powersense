"""Insights and recommendations routes."""
from fastapi import APIRouter
from app.database import query

router = APIRouter(prefix="/api", tags=["insights"])

DEMO_USER_ID = "demo-user-001"


@router.get("/insights")
async def get_insights():
    """Get all AI-generated insights."""
    return query(
        """SELECT * FROM insights WHERE user_id = ? ORDER BY 
           CASE severity 
             WHEN 'critical' THEN 1 
             WHEN 'high' THEN 2 
             WHEN 'warning' THEN 3 
             WHEN 'moderate' THEN 4 
             WHEN 'info' THEN 5 
           END, created_at DESC""",
        (DEMO_USER_ID,)
    )


@router.get("/recommendations")
async def get_recommendations():
    """Get prioritized action recommendations."""
    return query(
        """SELECT * FROM recommendations WHERE user_id = ? ORDER BY
           CASE priority
             WHEN 'high' THEN 1
             WHEN 'moderate' THEN 2
             WHEN 'low' THEN 3
             WHEN 'info' THEN 4
           END, created_at DESC""",
        (DEMO_USER_ID,)
    )
