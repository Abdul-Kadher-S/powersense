"""Appliance health classification model using Random Forest."""
import numpy as np
import pandas as pd
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
from typing import Dict, List, Optional


MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "appliance_model.joblib")
ENCODER_PATH = os.path.join(MODEL_DIR, "appliance_label_encoder.joblib")


FEATURE_COLS = [
    "age_years", "usage_hours_daily", "energy_consumption",
    "energy_change_pct", "maintenance_gap_months",
    "maintenance_frequency_months", "reported_issues", "usage_intensity"
]


def generate_synthetic_training_data(n_records: int = 1500) -> pd.DataFrame:
    """Generate synthetic appliance health dataset."""
    np.random.seed(42)
    records = []

    for i in range(n_records):
        age = np.random.uniform(0.5, 12)
        usage_hours = np.random.uniform(0.2, 24)
        base_energy = np.random.uniform(5, 100)
        maintenance_gap = np.random.uniform(0, 24)
        maintenance_freq = np.random.choice([6, 12, 18, 24])
        reported_issues = np.random.choice([0, 0, 0, 0, 1, 1, 2, 3, 4, 5],
                                            p=[0.35, 0.15, 0.1, 0.1, 0.1, 0.05, 0.05, 0.05, 0.03, 0.02])

        # Usage intensity (0-1 scale)
        usage_intensity = min(1.0, (usage_hours / 24) * (7 / 7))

        # Energy change (degrading appliances tend to consume more)
        if age > 5 and maintenance_gap > 6:
            energy_change = np.random.uniform(5, 35)  # increasing
        elif age > 3 and maintenance_gap > 9:
            energy_change = np.random.uniform(0, 20)
        else:
            energy_change = np.random.uniform(-5, 10)

        energy_consumption = base_energy * (1 + energy_change / 100)

        # Determine health label based on realistic rules
        risk_score = 0
        risk_score += min(30, age * 3)  # Age contributes up to 30
        risk_score += min(20, maintenance_gap * 1.5)  # Maintenance gap up to 20
        risk_score += min(15, energy_change * 0.8)  # Energy increase up to 15
        risk_score += min(15, reported_issues * 5)  # Issues up to 15
        risk_score += min(10, usage_intensity * 12)  # Usage intensity up to 10
        risk_score += np.random.normal(0, 8)  # Noise

        if risk_score > 55:
            label = "High Risk"
        elif risk_score > 30:
            label = "Moderate Risk"
        else:
            label = "Healthy"

        records.append({
            "age_years": round(age, 1),
            "usage_hours_daily": round(usage_hours, 1),
            "energy_consumption": round(energy_consumption, 1),
            "energy_change_pct": round(energy_change, 1),
            "maintenance_gap_months": round(maintenance_gap, 1),
            "maintenance_frequency_months": maintenance_freq,
            "reported_issues": int(reported_issues),
            "usage_intensity": round(usage_intensity, 2),
            "health_label": label,
        })

    return pd.DataFrame(records)


def train_model() -> RandomForestClassifier:
    """Train the appliance health classification model."""
    print("[APPLIANCE] Training appliance health classifier...")
    df = generate_synthetic_training_data(1500)

    X = df[FEATURE_COLS]
    y = df["health_label"]

    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    # Cross-validation
    scores = cross_val_score(model, X, y_encoded, cv=5, scoring="accuracy")
    print(f"   CV Accuracy: {scores.round(3)}")
    print(f"   Mean Accuracy: {scores.mean():.3f}")

    model.fit(X, y_encoded)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(le, ENCODER_PATH)
    print(f"   [OK] Model saved to {MODEL_PATH}")

    return model


def load_model():
    """Load the trained model and label encoder."""
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        model = joblib.load(MODEL_PATH)
        le = joblib.load(ENCODER_PATH)
        return model, le
    return None, None


def predict_health(appliance_data: Dict) -> Dict:
    """Predict appliance health from feature dict.
    
    Args:
        appliance_data: Dict with keys matching FEATURE_COLS
    
    Returns:
        Dict with health_score, risk_level, failure_probability, etc.
    """
    model, le = load_model()
    if model is None:
        model = train_model()
        model, le = load_model()

    # Build feature vector
    features = pd.DataFrame([[
        appliance_data.get("age_years", 1),
        appliance_data.get("usage_hours_daily", 4),
        appliance_data.get("energy_consumption", 30),
        appliance_data.get("energy_change_pct", 0),
        appliance_data.get("maintenance_gap_months", 0),
        appliance_data.get("maintenance_frequency_months", 12),
        appliance_data.get("reported_issues", 0),
        appliance_data.get("usage_intensity", 0.5),
    ]], columns=FEATURE_COLS)

    # Predict class and probabilities
    predicted_class_idx = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    class_names = le.inverse_transform(range(len(probabilities)))

    # Map probabilities to labels
    prob_dict = {name: round(float(prob), 3) for name, prob in zip(class_names, probabilities)}

    predicted_label = le.inverse_transform([predicted_class_idx])[0]

    # Calculate health score (0-100, higher = healthier)
    healthy_prob = prob_dict.get("Healthy", 0)
    moderate_prob = prob_dict.get("Moderate Risk", 0)
    high_risk_prob = prob_dict.get("High Risk", 0)

    health_score = round(healthy_prob * 100 * 0.9 + moderate_prob * 50 * 0.8 + high_risk_prob * 15 * 0.5, 0)
    health_score = min(100, max(0, health_score))

    # Failure/degradation probability
    failure_prob = round(high_risk_prob * 0.7 + moderate_prob * 0.3, 3)

    # Contributing factors from feature importances
    importances = model.feature_importances_
    factor_contributions = []
    for i, (feat, imp) in enumerate(zip(FEATURE_COLS, importances)):
        val = features.iloc[0, i]
        factor_contributions.append({
            "factor": _format_factor_name(feat),
            "value": float(val),
            "importance": round(float(imp), 3),
            "concern_level": _assess_factor_concern(feat, val),
        })

    # Sort by importance
    factor_contributions.sort(key=lambda x: x["importance"], reverse=True)

    # Generate explanation and recommendation
    top_factors = factor_contributions[:4]
    explanation = _generate_explanation(appliance_data, predicted_label, top_factors)
    recommendation = _generate_recommendation(predicted_label, top_factors, appliance_data)

    return {
        "health_score": health_score,
        "risk_level": predicted_label,
        "failure_probability": failure_prob,
        "class_probabilities": prob_dict,
        "contributing_factors": factor_contributions,
        "recommendation": recommendation,
        "ai_assessment": explanation,
        "disclaimer": "This is an MVP/demo model estimate and not a scientifically validated prediction.",
    }


def _format_factor_name(feature: str) -> str:
    """Convert feature name to human-readable label."""
    mapping = {
        "age_years": "Appliance Age",
        "usage_hours_daily": "Daily Usage Hours",
        "energy_consumption": "Energy Consumption",
        "energy_change_pct": "Energy Consumption Change",
        "maintenance_gap_months": "Maintenance Gap",
        "maintenance_frequency_months": "Maintenance Frequency",
        "reported_issues": "Reported Issues",
        "usage_intensity": "Usage Intensity",
    }
    return mapping.get(feature, feature)


def _assess_factor_concern(feature: str, value: float) -> str:
    """Assess how concerning a factor value is."""
    thresholds = {
        "age_years": [(7, "high"), (4, "moderate"), (0, "low")],
        "usage_hours_daily": [(16, "high"), (8, "moderate"), (0, "low")],
        "energy_change_pct": [(20, "high"), (10, "moderate"), (0, "low")],
        "maintenance_gap_months": [(12, "high"), (6, "moderate"), (0, "low")],
        "reported_issues": [(3, "high"), (1, "moderate"), (0, "low")],
        "usage_intensity": [(0.8, "high"), (0.5, "moderate"), (0, "low")],
    }
    for threshold, level in thresholds.get(feature, []):
        if value >= threshold:
            return level
    return "low"


def _generate_explanation(data: Dict, risk_level: str, top_factors: List[Dict]) -> str:
    """Generate a human-readable AI assessment."""
    parts = []

    if risk_level == "High Risk":
        parts.append("The appliance shows significant signs of declining performance and may require immediate attention.")
    elif risk_level == "Moderate Risk":
        parts.append("The appliance shows some signs of declining efficiency that warrant monitoring and potential maintenance.")
    else:
        parts.append("The appliance appears to be operating normally with no significant concerns detected.")

    # Add factor-specific explanations
    for factor in top_factors[:3]:
        if factor["concern_level"] == "high":
            if "Age" in factor["factor"]:
                parts.append(f"The appliance age ({factor['value']:.1f} years) is above the typical baseline for this category.")
            elif "Energy Consumption Change" in factor["factor"]:
                parts.append(f"Energy consumption has changed by {factor['value']:.1f}% over recent months, indicating potential efficiency loss.")
            elif "Maintenance Gap" in factor["factor"]:
                parts.append(f"No maintenance has been performed for {factor['value']:.0f} months, exceeding the recommended interval.")
            elif "Reported Issues" in factor["factor"]:
                parts.append(f"There are {int(factor['value'])} reported issues that may indicate underlying problems.")
        elif factor["concern_level"] == "moderate":
            if "Age" in factor["factor"]:
                parts.append(f"The appliance age ({factor['value']:.1f} years) is within a moderate range.")
            elif "Energy Consumption Change" in factor["factor"]:
                parts.append(f"Energy consumption has changed by {factor['value']:.1f}% recently — worth monitoring.")
            elif "Maintenance Gap" in factor["factor"]:
                parts.append(f"Maintenance was last performed {factor['value']:.0f} months ago.")

    return " ".join(parts)


def _generate_recommendation(risk_level: str, top_factors: List[Dict], data: Dict) -> str:
    """Generate contextual recommendations based on detected issues."""
    actions = []

    if risk_level == "High Risk":
        actions.append("Schedule an immediate maintenance inspection.")
    elif risk_level == "Moderate Risk":
        actions.append("Schedule a maintenance inspection within the next 2-4 weeks.")

    for factor in top_factors[:3]:
        if factor["concern_level"] in ("high", "moderate"):
            if "Energy Consumption Change" in factor["factor"]:
                actions.append("Monitor energy consumption closely over the next billing cycle.")
            elif "Maintenance Gap" in factor["factor"]:
                actions.append("Perform routine maintenance including cleaning and inspection.")
            elif "Age" in factor["factor"] and factor["concern_level"] == "high":
                actions.append("Consider evaluating replacement options if repair costs are high.")

    if not actions:
        actions.append("Continue with the regular maintenance schedule.")
        actions.append("No immediate action is required.")

    return " ".join(actions)
