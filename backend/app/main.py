"""HomeGuard AI — FastAPI Backend Application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.database.seed import seed_all
from app.ml.electricity_model import load_model as load_electricity_model, train_model as train_electricity
from app.ml.appliance_model import load_model as load_appliance_model, train_model as train_appliance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # ── Startup ──────────────────────────────────────────────────
    print("[HOME] Starting HomeGuard AI Backend...")

    # Initialize database
    print("[DB] Initializing database...")
    init_db()

    # Seed demo data
    print("[SEED] Seeding demo data...")
    seed_all()

    # Train/load ML models
    print("[ML] Loading ML models...")
    model_e = load_electricity_model()
    if model_e is None:
        print("   Training electricity model...")
        train_electricity()

    model_a, _ = load_appliance_model()
    if model_a is None:
        print("   Training appliance model...")
        train_appliance()

    print("[OK] HomeGuard AI Backend ready!")
    print(f"   CORS origins: {settings.CORS_ORIGINS}")
    yield

    # ── Shutdown ─────────────────────────────────────────────────
    print("[STOP] Shutting down HomeGuard AI Backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered preventive household intelligence platform",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────
from app.api.routes.auth import router as auth_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.electricity import router as electricity_router
from app.api.routes.appliances import router as appliances_router
from app.api.routes.bills import router as bills_router
from app.api.routes.insights import router as insights_router

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(electricity_router)
app.include_router(appliances_router)
app.include_router(bills_router)
app.include_router(insights_router)


@app.get("/health")
async def health_check():
    """Health check endpoint for Render."""
    return {"status": "ok", "service": "HomeGuard AI Backend", "version": settings.APP_VERSION}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": "Predict problems. Prevent costs.",
        "docs": "/docs",
    }
