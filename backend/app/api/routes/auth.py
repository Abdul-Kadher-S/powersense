"""Authentication routes — demo login only."""
from fastapi import APIRouter, HTTPException
from app.schemas import LoginRequest, LoginResponse
from app.config import settings
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api", tags=["auth"])

DEMO_USER_ID = "demo-user-001"


@router.post("/demo/login", response_model=LoginResponse)
async def demo_login(request: LoginRequest):
    """Authenticate with demo credentials."""
    if request.email != settings.DEMO_EMAIL or request.password != settings.DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid demo credentials")
    
    # Generate JWT token
    expiry = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    token_data = {
        "sub": DEMO_USER_ID,
        "email": request.email,
        "exp": expiry,
    }
    token = jwt.encode(token_data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    
    return LoginResponse(
        token=token,
        user={
            "id": DEMO_USER_ID,
            "email": settings.DEMO_EMAIL,
            "name": "Demo User",
            "household_name": "My Smart Home",
        },
        message="Demo login successful",
    )
