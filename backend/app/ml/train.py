"""Training script for all ML models. Run: python -m app.ml.train"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

from app.ml.electricity_model import train_model as train_electricity
from app.ml.appliance_model import train_model as train_appliance


def train_all():
    """Train all ML models and save to disk."""
    print("=" * 60)
    print("HomeGuard AI - ML Model Training")
    print("=" * 60)
    print()

    train_electricity()
    print()
    train_appliance()

    print()
    print("=" * 60)
    print("[OK] All models trained successfully!")
    print("=" * 60)


if __name__ == "__main__":
    train_all()
