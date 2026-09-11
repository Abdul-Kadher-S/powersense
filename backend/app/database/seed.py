"""Seed the database with realistic demo data for the hackathon demo."""
import uuid
from datetime import datetime, timedelta
from app.database import get_connection, query


DEMO_USER_ID = "demo-user-001"
DEMO_EMAIL = "demo@homeguard.ai"


def _uid():
    return str(uuid.uuid4())


def is_seeded() -> bool:
    """Check if demo data already exists."""
    result = query("SELECT COUNT(*) as cnt FROM users WHERE id = ?", (DEMO_USER_ID,), one=True)
    return result and result["cnt"] > 0


def seed_all():
    """Insert all demo data."""
    if is_seeded():
        return

    with get_connection() as conn:
        # ── Demo User ──────────────────────────────────────────────
        conn.execute(
            "INSERT INTO users (id, email, name, household_name) VALUES (?, ?, ?, ?)",
            (DEMO_USER_ID, DEMO_EMAIL, "Demo User", "My Smart Home")
        )

        # ── Electricity Readings (Sep 2025 → Aug 2026) ────────────
        # Story: gradual increase with summer spike, Sep anomaly
        electricity_data = [
            (9,  2025, 182, 1456.0),   # Sep 2025 — baseline
            (10, 2025, 189, 1512.0),   # Oct
            (11, 2025, 178, 1424.0),   # Nov — slight dip (cooler)
            (12, 2025, 195, 1560.0),   # Dec — heater usage
            (1,  2026, 188, 1504.0),   # Jan
            (2,  2026, 201, 1608.0),   # Feb
            (3,  2026, 210, 1680.0),   # Mar — warming up
            (4,  2026, 228, 1824.0),   # Apr — AC starts
            (5,  2026, 247, 1976.0),   # May — summer
            (6,  2026, 261, 2088.0),   # Jun — peak summer
            (7,  2026, 272, 2176.0),   # Jul — peak
            (8,  2026, 298, 2384.0),   # Aug — anomaly month! (refrigerator degradation + heavy AC)
        ]

        for month, year, kwh, bill in electricity_data:
            conn.execute(
                "INSERT INTO electricity_readings (id, user_id, month, year, units_kwh, bill_amount, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (_uid(), DEMO_USER_ID, month, year, kwh, bill, "demo")
            )

        # ── Appliances ─────────────────────────────────────────────
        appliances = [
            {
                "id": "appl-refrigerator",
                "name": "Refrigerator",
                "category": "Kitchen",
                "brand": "Samsung",
                "model": "RT42",
                "purchase_year": 2022,
                "age_years": 4.0,
                "usage_hours_daily": 24.0,
                "usage_days_per_week": 7,
                "energy_rating": "3-Star",
                "rated_power_watts": 200,
                "last_maintenance_date": "2025-11-15",
                "maintenance_frequency_months": 12,
                "reported_issues": 2,
                "reported_symptoms": "Slightly louder compressor noise, occasional frost buildup",
                "icon": "refrigerator",
            },
            {
                "id": "appl-ac",
                "name": "Air Conditioner",
                "category": "Cooling",
                "brand": "Daikin",
                "model": "FTKF50",
                "purchase_year": 2023,
                "age_years": 3.0,
                "usage_hours_daily": 8.0,
                "usage_days_per_week": 7,
                "energy_rating": "5-Star",
                "rated_power_watts": 1500,
                "last_maintenance_date": "2026-03-10",
                "maintenance_frequency_months": 6,
                "reported_issues": 1,
                "reported_symptoms": "Filter needs cleaning",
                "icon": "air-vent",
            },
            {
                "id": "appl-washer",
                "name": "Washing Machine",
                "category": "Laundry",
                "brand": "LG",
                "model": "FHM1207",
                "purchase_year": 2024,
                "age_years": 2.0,
                "usage_hours_daily": 1.0,
                "usage_days_per_week": 4,
                "energy_rating": "5-Star",
                "rated_power_watts": 500,
                "last_maintenance_date": "2026-07-20",
                "maintenance_frequency_months": 12,
                "reported_issues": 0,
                "reported_symptoms": None,
                "icon": "washing-machine",
            },
            {
                "id": "appl-geyser",
                "name": "Geyser",
                "category": "Heating",
                "brand": "Havells",
                "model": "Instanio",
                "purchase_year": 2021,
                "age_years": 5.0,
                "usage_hours_daily": 0.5,
                "usage_days_per_week": 7,
                "energy_rating": "4-Star",
                "rated_power_watts": 2000,
                "last_maintenance_date": "2026-06-01",
                "maintenance_frequency_months": 12,
                "reported_issues": 0,
                "reported_symptoms": None,
                "icon": "flame",
            },
            {
                "id": "appl-microwave",
                "name": "Microwave",
                "category": "Kitchen",
                "brand": "IFB",
                "model": "20SC2",
                "purchase_year": 2025,
                "age_years": 1.0,
                "usage_hours_daily": 0.3,
                "usage_days_per_week": 6,
                "energy_rating": "N/A",
                "rated_power_watts": 800,
                "last_maintenance_date": None,
                "maintenance_frequency_months": 24,
                "reported_issues": 0,
                "reported_symptoms": None,
                "icon": "microwave",
            },
            {
                "id": "appl-tv",
                "name": "Television",
                "category": "Entertainment",
                "brand": "Sony",
                "model": "Bravia 55",
                "purchase_year": 2023,
                "age_years": 3.0,
                "usage_hours_daily": 4.0,
                "usage_days_per_week": 7,
                "energy_rating": "4-Star",
                "rated_power_watts": 120,
                "last_maintenance_date": None,
                "maintenance_frequency_months": 24,
                "reported_issues": 0,
                "reported_symptoms": None,
                "icon": "tv",
            },
        ]

        for a in appliances:
            conn.execute(
                """INSERT INTO appliances 
                (id, user_id, name, category, brand, model, purchase_year, age_years,
                 usage_hours_daily, usage_days_per_week, energy_rating, rated_power_watts,
                 last_maintenance_date, maintenance_frequency_months, reported_issues,
                 reported_symptoms, icon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (a["id"], DEMO_USER_ID, a["name"], a["category"], a["brand"], a["model"],
                 a["purchase_year"], a["age_years"], a["usage_hours_daily"], a["usage_days_per_week"],
                 a["energy_rating"], a["rated_power_watts"], a["last_maintenance_date"],
                 a["maintenance_frequency_months"], a["reported_issues"], a["reported_symptoms"],
                 a["icon"])
            )

        # ── Appliance Readings (monthly energy per appliance) ──────
        # Refrigerator: gradual increase (degradation story)
        fridge_kwh = [45, 46, 44, 47, 48, 49, 51, 53, 55, 58, 62, 68]
        # AC: seasonal pattern (summer spike)
        ac_kwh = [15, 12, 10, 18, 40, 65, 80, 90, 95, 85, 55, 30]
        # Washing machine: stable
        washer_kwh = [8, 8, 7, 8, 9, 8, 8, 9, 8, 8, 8, 9]
        # Geyser: winter higher
        geyser_kwh = [20, 22, 25, 18, 12, 8, 5, 4, 4, 5, 10, 18]
        # Microwave: stable low
        micro_kwh = [4, 4, 3, 4, 4, 5, 4, 4, 5, 4, 4, 4]
        # TV: stable
        tv_kwh = [14, 15, 14, 14, 15, 14, 15, 15, 14, 14, 15, 14]

        months_years = [
            (9, 2025), (10, 2025), (11, 2025), (12, 2025),
            (1, 2026), (2, 2026), (3, 2026), (4, 2026),
            (5, 2026), (6, 2026), (7, 2026), (8, 2026),
        ]

        appliance_readings = [
            ("appl-refrigerator", fridge_kwh),
            ("appl-ac", ac_kwh),
            ("appl-washer", washer_kwh),
            ("appl-geyser", geyser_kwh),
            ("appl-microwave", micro_kwh),
            ("appl-tv", tv_kwh),
        ]

        for appl_id, kwh_list in appliance_readings:
            for i, (month, year) in enumerate(months_years):
                conn.execute(
                    "INSERT INTO appliance_readings (id, appliance_id, month, year, energy_kwh) VALUES (?, ?, ?, ?, ?)",
                    (_uid(), appl_id, month, year, kwh_list[i])
                )

        # ── Maintenance Records ────────────────────────────────────
        maintenance = [
            ("appl-refrigerator", "2025-11-15", "routine", "General cleaning and inspection", 500, "Service Center"),
            ("appl-ac", "2026-03-10", "filter_clean", "Filter cleaning and gas check", 800, "Daikin Service"),
            ("appl-washer", "2026-07-20", "routine", "Drum cleaning and inspection", 400, "LG Service"),
            ("appl-geyser", "2026-06-01", "routine", "Anode rod check and cleaning", 600, "Local Technician"),
        ]

        for appl_id, mdate, mtype, desc, cost, by in maintenance:
            conn.execute(
                "INSERT INTO maintenance_records (id, appliance_id, maintenance_date, maintenance_type, description, cost, performed_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (_uid(), appl_id, mdate, mtype, desc, cost, by)
            )

        # ── Insights (pre-generated) ──────────────────────────────
        insights = [
            {
                "category": "energy",
                "severity": "warning",
                "title": "⚡ Electricity Consumption Rising",
                "description": "Your electricity consumption has increased by 24% compared to your 6-month average baseline.",
                "explanation": "Your household consumed 298 kWh in August 2026, while your rolling 6-month average was 240 kWh. This 24% increase is above the normal seasonal variation.",
                "recommendation": "Review individual appliance energy usage. Consider checking appliances that have been running longer than usual.",
                "related_appliance_id": None,
            },
            {
                "category": "appliance",
                "severity": "high",
                "title": "🔧 Refrigerator Showing Degradation Signs",
                "description": "Your refrigerator's energy consumption has increased by 18% over the last 3 months, suggesting declining efficiency.",
                "explanation": "The refrigerator consumed 68 kWh in August vs. an average of 48 kWh in previous months. Combined with its age (4 years), lack of recent maintenance (10 months ago), and reported symptoms (louder compressor, frost buildup), the appliance shows moderate-to-high degradation risk.",
                "recommendation": "Schedule a maintenance inspection. Check the door seal, clean the condenser coils, and defrost if frost has built up. If consumption continues to rise, consider professional servicing.",
                "related_appliance_id": "appl-refrigerator",
            },
            {
                "category": "cost",
                "severity": "info",
                "title": "💰 Next Month Bill Estimate",
                "description": "If the current consumption trend continues, your next month's estimated bill will be approximately ₹2,640.",
                "explanation": "Based on the ML prediction model, your September 2026 consumption is estimated at approximately 315 kWh, which at ₹8/kWh results in an estimated bill of ₹2,520 plus applicable taxes/charges.",
                "recommendation": "Reducing AC usage by 1 hour daily and addressing refrigerator efficiency could save approximately ₹400-600 per month.",
                "related_appliance_id": None,
            },
            {
                "category": "connection",
                "severity": "warning",
                "title": "🔗 AI Insight: Electricity ↔ Refrigerator Connection",
                "description": "Your household electricity consumption increased by 24%. Based on appliance data analysis, the refrigerator is the strongest potential contributor.",
                "explanation": "The refrigerator's energy consumption increased from 55 kWh to 68 kWh (+24%) over the last 3 months, closely matching the overall household consumption increase. Its health score has declined to 64/100 due to age, maintenance gap, and reported symptoms.",
                "recommendation": "Priority action: Schedule refrigerator maintenance. Secondary: Monitor AC usage during remaining summer months.",
                "related_appliance_id": "appl-refrigerator",
            },
            {
                "category": "appliance",
                "severity": "moderate",
                "title": "🌡️ Air Conditioner Filter Due for Cleaning",
                "description": "Your AC's last filter cleaning was 6 months ago. With heavy summer usage, the filter may be reducing efficiency.",
                "explanation": "The AC has been running 8+ hours daily during summer months. Last maintenance was in March 2026. Dirty filters can increase energy consumption by 5-15%.",
                "recommendation": "Clean or replace the AC filter. This is a simple maintenance task that can improve cooling efficiency and reduce energy consumption.",
                "related_appliance_id": "appl-ac",
            },
        ]

        for ins in insights:
            conn.execute(
                """INSERT INTO insights 
                (id, user_id, category, severity, title, description, explanation, recommendation, related_appliance_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (_uid(), DEMO_USER_ID, ins["category"], ins["severity"], ins["title"],
                 ins["description"], ins["explanation"], ins["recommendation"], ins["related_appliance_id"])
            )

        # ── Recommendations (Action Center) ────────────────────────
        recommendations = [
            {
                "priority": "high",
                "category": "maintenance",
                "title": "Check Refrigerator Efficiency",
                "description": "Your refrigerator is showing signs of declining performance with increasing energy consumption.",
                "expected_impact": "Could reduce monthly consumption by 15-20 kWh (₹120-160/month)",
                "reason": "Energy consumption increased 18% over 3 months. Health score: 64/100. No maintenance in 10 months.",
                "suggested_action": "1. Check and clean door seals\n2. Clean condenser coils\n3. Defrost if frost has built up\n4. Schedule professional inspection if issues persist",
                "related_appliance_id": "appl-refrigerator",
            },
            {
                "priority": "moderate",
                "category": "efficiency",
                "title": "Optimize AC Usage",
                "description": "Your air conditioner usage is high during summer months, contributing significantly to electricity bills.",
                "expected_impact": "Could save ₹400-600/month during summer",
                "reason": "AC consumption peaked at 95 kWh in August. Running 8+ hours daily.",
                "suggested_action": "1. Set temperature to 24-25°C instead of lower\n2. Clean AC filter\n3. Use fan in combination with AC\n4. Close windows and doors while AC is running",
                "related_appliance_id": "appl-ac",
            },
            {
                "priority": "low",
                "category": "monitoring",
                "title": "Monitor Geyser Usage in Winter",
                "description": "Your geyser is 5 years old. While currently healthy, its age warrants monitoring during high-usage winter months.",
                "expected_impact": "Preventive — avoids potential ₹2,000-5,000 repair costs",
                "reason": "Appliance age: 5 years. Currently healthy but approaching mid-life for geysers.",
                "suggested_action": "1. Check for any leaks around connections\n2. Monitor hot water heating time\n3. Schedule anode rod inspection before winter",
                "related_appliance_id": "appl-geyser",
            },
            {
                "priority": "info",
                "category": "positive",
                "title": "Washing Machine Operating Normally",
                "description": "Your washing machine is in excellent condition with stable energy consumption.",
                "expected_impact": "No action needed — continue current maintenance schedule",
                "reason": "Age: 2 years. Recent maintenance. Stable energy pattern. Health: 91/100.",
                "suggested_action": "Continue with regular maintenance schedule. Next recommended maintenance: January 2027.",
                "related_appliance_id": "appl-washer",
            },
        ]

        for rec in recommendations:
            conn.execute(
                """INSERT INTO recommendations 
                (id, user_id, priority, category, title, description, expected_impact, reason, suggested_action, related_appliance_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (_uid(), DEMO_USER_ID, rec["priority"], rec["category"], rec["title"],
                 rec["description"], rec["expected_impact"], rec["reason"],
                 rec["suggested_action"], rec["related_appliance_id"])
            )

    print("[OK] Demo data seeded successfully!")
