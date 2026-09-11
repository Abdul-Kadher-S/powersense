"""Electricity consumption forecasting model using Gradient Boosting."""
import numpy as np
import pandas as pd
import os
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_score
from typing import Dict, List, Tuple, Optional


MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "electricity_model.joblib")


def generate_synthetic_training_data(n_households: int = 200) -> pd.DataFrame:
    """Generate synthetic electricity consumption data for multiple households."""
    np.random.seed(42)
    records = []

    for household in range(n_households):
        base_consumption = np.random.uniform(120, 250)
        trend = np.random.uniform(-0.5, 3.0)  # monthly trend
        seasonal_amplitude = np.random.uniform(15, 60)
        noise_level = np.random.uniform(5, 20)

        for month_idx in range(24):  # 2 years of data
            month_of_year = (month_idx % 12) + 1
            # Seasonal pattern (summer peak around month 6-8)
            seasonal = seasonal_amplitude * np.sin(2 * np.pi * (month_of_year - 3) / 12)
            consumption = base_consumption + trend * month_idx + seasonal + np.random.normal(0, noise_level)
            consumption = max(50, consumption)
            records.append({
                "household_id": household,
                "month_index": month_idx,
                "month_of_year": month_of_year,
                "consumption": round(consumption, 1),
            })

    df = pd.DataFrame(records)
    return df


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer features for the forecasting model."""
    df = df.copy()
    df = df.sort_values(["household_id", "month_index"])

    # Rolling features per household
    for window in [3, 6]:
        df[f"rolling_avg_{window}"] = df.groupby("household_id")["consumption"].transform(
            lambda x: x.rolling(window, min_periods=1).mean()
        )

    # Lag features
    df["prev_month"] = df.groupby("household_id")["consumption"].shift(1)
    df["prev_2_month"] = df.groupby("household_id")["consumption"].shift(2)
    df["prev_3_month"] = df.groupby("household_id")["consumption"].shift(3)

    # Trend (difference from 3 months ago)
    df["trend_3m"] = df["consumption"] - df["prev_3_month"]

    # Seasonal indicator (summer = 1 if month 4-9)
    df["is_summer"] = (df["month_of_year"].isin([4, 5, 6, 7, 8, 9])).astype(int)

    # Month sin/cos for cyclical encoding
    df["month_sin"] = np.sin(2 * np.pi * df["month_of_year"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month_of_year"] / 12)

    df = df.dropna()
    return df


FEATURE_COLS = [
    "month_index", "month_of_year", "rolling_avg_3", "rolling_avg_6",
    "prev_month", "prev_2_month", "prev_3_month", "trend_3m",
    "is_summer", "month_sin", "month_cos"
]


def train_model() -> GradientBoostingRegressor:
    """Train the electricity forecasting model."""
    print("[ELECTRICITY] Training electricity forecasting model...")
    df = generate_synthetic_training_data(200)
    df = create_features(df)

    X = df[FEATURE_COLS]
    y = df["consumption"]

    model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_samples_split=10,
        random_state=42
    )

    # Cross-validation
    scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    print(f"   CV R² scores: {scores.round(3)}")
    print(f"   Mean R²: {scores.mean():.3f}")

    model.fit(X, y)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"   [OK] Model saved to {MODEL_PATH}")

    return model


def load_model() -> Optional[GradientBoostingRegressor]:
    """Load the trained model from disk."""
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None


def predict_next_month(
    history: List[Dict],
    rate_per_kwh: float = 8.0
) -> Dict:
    """Predict next month's electricity consumption.
    
    Args:
        history: List of dicts with keys: month, year, units_kwh
                 Must be sorted chronologically, at least 4 months.
        rate_per_kwh: Electricity rate for bill estimation.
    
    Returns:
        Dict with prediction details.
    """
    model = load_model()
    if model is None:
        model = train_model()

    if len(history) < 4:
        # Fallback: simple average
        avg = np.mean([h["units_kwh"] for h in history])
        return _build_prediction_result(avg, history, rate_per_kwh, "fallback_average")

    consumptions = [h["units_kwh"] for h in history]

    # Determine next month
    last = history[-1]
    next_month = last["month"] + 1
    next_year = last["year"]
    if next_month > 12:
        next_month = 1
        next_year += 1

    # Build feature vector for prediction
    month_index = len(history)
    rolling_3 = np.mean(consumptions[-3:])
    rolling_6 = np.mean(consumptions[-6:]) if len(consumptions) >= 6 else np.mean(consumptions)
    prev_1 = consumptions[-1]
    prev_2 = consumptions[-2]
    prev_3 = consumptions[-3]
    trend_3m = consumptions[-1] - consumptions[-3] if len(consumptions) >= 3 else 0
    is_summer = 1 if next_month in [4, 5, 6, 7, 8, 9] else 0
    month_sin = np.sin(2 * np.pi * next_month / 12)
    month_cos = np.cos(2 * np.pi * next_month / 12)

    features = pd.DataFrame([[
        month_index, next_month, rolling_3, rolling_6,
        prev_1, prev_2, prev_3, trend_3m,
        is_summer, month_sin, month_cos
    ]], columns=FEATURE_COLS)

    predicted_kwh = float(model.predict(features)[0])
    predicted_kwh = max(50, round(predicted_kwh, 1))

    return _build_prediction_result(predicted_kwh, history, rate_per_kwh, "gradient_boosting")


def _build_prediction_result(
    predicted_kwh: float,
    history: List[Dict],
    rate_per_kwh: float,
    model_name: str
) -> Dict:
    """Build the prediction result dict."""
    consumptions = [h["units_kwh"] for h in history]
    last = history[-1]

    next_month = last["month"] + 1
    next_year = last["year"]
    if next_month > 12:
        next_month = 1
        next_year += 1

    prev_kwh = consumptions[-1]
    pct_change = round(((predicted_kwh - prev_kwh) / prev_kwh) * 100, 1) if prev_kwh > 0 else 0

    # Confidence interval (±10-15%)
    std_dev = np.std(consumptions[-6:]) if len(consumptions) >= 6 else np.std(consumptions)
    confidence_low = round(predicted_kwh - 1.5 * std_dev, 1)
    confidence_high = round(predicted_kwh + 1.5 * std_dev, 1)

    trend = "increasing" if pct_change > 3 else "decreasing" if pct_change < -3 else "stable"

    return {
        "predicted_month": next_month,
        "predicted_year": next_year,
        "predicted_kwh": predicted_kwh,
        "predicted_bill": round(predicted_kwh * rate_per_kwh, 2),
        "confidence_low": max(50, confidence_low),
        "confidence_high": confidence_high,
        "percentage_change": pct_change,
        "trend": trend,
        "model_used": model_name,
    }


def detect_anomaly(history: List[Dict]) -> Dict:
    """Detect anomalous consumption in the latest reading."""
    if len(history) < 3:
        return {
            "is_anomaly": False,
            "current_usage": history[-1]["units_kwh"] if history else 0,
            "normal_range_low": 0,
            "normal_range_high": 0,
            "baseline_average": 0,
            "percentage_deviation": 0,
            "risk_level": "low",
            "explanation": "Insufficient data for anomaly detection (need at least 3 months).",
        }

    consumptions = [h["units_kwh"] for h in history]
    current = consumptions[-1]
    baseline = consumptions[:-1]  # Everything except latest

    mean_val = np.mean(baseline)
    std_val = np.std(baseline)

    # Calculate rolling baseline (last 6 months excluding current)
    recent_baseline = baseline[-6:] if len(baseline) >= 6 else baseline
    rolling_mean = np.mean(recent_baseline)
    rolling_std = np.std(recent_baseline) if len(recent_baseline) > 1 else mean_val * 0.1

    # Z-score
    z_score = (current - rolling_mean) / rolling_std if rolling_std > 0 else 0

    # Percentage deviation from rolling average
    pct_deviation = round(((current - rolling_mean) / rolling_mean) * 100, 1) if rolling_mean > 0 else 0

    # Normal range
    normal_low = round(rolling_mean - 1.5 * rolling_std, 1)
    normal_high = round(rolling_mean + 1.5 * rolling_std, 1)

    # Risk level
    if abs(z_score) > 3:
        risk_level = "critical"
        is_anomaly = True
    elif abs(z_score) > 2:
        risk_level = "high"
        is_anomaly = True
    elif abs(z_score) > 1.5:
        risk_level = "moderate"
        is_anomaly = True
    elif abs(z_score) > 1:
        risk_level = "low"
        is_anomaly = True
    else:
        risk_level = "normal"
        is_anomaly = False

    # Build explanation
    if is_anomaly and pct_deviation > 0:
        explanation = (
            f"Your electricity consumption of {current} kWh is {abs(pct_deviation)}% higher "
            f"than your normal household pattern (baseline average: {rolling_mean:.0f} kWh). "
            f"The expected normal range is {max(0, normal_low):.0f}–{normal_high:.0f} kWh."
        )
    elif is_anomaly and pct_deviation < 0:
        explanation = (
            f"Your electricity consumption of {current} kWh is {abs(pct_deviation)}% lower "
            f"than your normal household pattern. This could indicate reduced usage or a meter issue."
        )
    else:
        explanation = (
            f"Your electricity consumption of {current} kWh is within the normal range "
            f"({max(0, normal_low):.0f}–{normal_high:.0f} kWh)."
        )

    return {
        "is_anomaly": is_anomaly,
        "current_usage": current,
        "normal_range_low": max(0, normal_low),
        "normal_range_high": normal_high,
        "baseline_average": round(rolling_mean, 1),
        "percentage_deviation": pct_deviation,
        "risk_level": risk_level,
        "explanation": explanation,
    }
