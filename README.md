# HomeGuard AI (PowerSense) ⚡🛡️

> **Predict Problems. Prevent Costs.**  
> *AI-powered preventive household intelligence platform.*

HomeGuard AI is a smart living platform that monitors home energy consumption, detects anomalies, forecasts upcoming utility bills using machine learning, tracks appliance health, and delivers prioritized, actionable recommendations to protect homes from unexpected breakdowns and high costs.

---

## 🌟 Features

- **📊 Intelligent Dashboard**: Overview of home health score (0–100), key consumption trends, monthly bill forecast, and active risk alerts.
- **⚡ Electricity Analytics & Forecasting**:
  - Historical 12-month consumption tracking (kWh and INR).
  - Machine learning-based Next Month Prediction (Random Forest regressor).
  - Automated anomaly detection flagging abnormal surges with severity levels.
- **🔬 Appliance Health & Degradation**:
  - Real-time degradation risk scoring for major household appliances (refrigerator, AC, washing machine, water heater, TV, microwave).
  - ML failure probability calculation with maintenance timeline and symptom tracking.
- **💡 AI Insights & Action Center**:
  - Explainable AI insights categorized by energy, cost, and appliance safety.
  - Prioritized action recommendations ranked by cost impact and urgency.
- **📑 Multi-Modal Bill Upload**:
  - OCR extraction for electricity utility bills (Gemini Vision API) with smart fallback to manual entry.
- **💻 Responsive & Collapsible UI**:
  - Designed for mobile, tablet, and laptop/desktop viewports.
  - Collapsible icon-rail sidebar (`Ctrl+B` toggle) with glassmorphic dark theme.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: TypeScript
- **Styling**: Vanilla CSS + Tailwind CSS (Custom Dark Glassmorphic Design System)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn
- **Language**: Python 3.11+
- **Machine Learning**: `scikit-learn`, `joblib`, `numpy` (Random Forest Models)
- **Database**: SQLite / PostgreSQL (SQLAlchemy ORM)
- **AI/OCR**: Google Gemini Vision API

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📁 Project Architecture

```
PowerSense/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # REST API endpoints (dashboard, electricity, appliances, etc.)
│   │   ├── core/              # Config, security, and environment settings
│   │   ├── db/                # Database models and seed data
│   │   ├── ml/                # ML model training and inference pipelines
│   │   ├── services/          # Business logic and AI reasoning engines
│   │   └── utils/             # Bill OCR parser and Gemini integration
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router (dashboard, electricity, appliances, upload, etc.)
│   │   ├── components/layout/ # AppLayout, collapsible sidebar, navigation
│   │   └── lib/               # API client, TypeScript interfaces, and utilities
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
