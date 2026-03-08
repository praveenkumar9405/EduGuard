# EduGuard - AI-Powered Dropout Prevention System 🎓✨

EduGuard is an intelligent, full-stack application designed to predict and prevent student dropouts before they happen. By aggregating attendance, socioeconomic, and academic data, EduGuard leverages AI (Random Forest) to flag at-risk students, enabling proactive intervention from teachers, principals, volunteers, and district educational officers.

---

## 🚀 Key Features

* **High-Accuracy AI Prediction:** Utilizes a custom Random Forest model to calculate a specific 'dropout risk score' for every student based on over 15 distinct factors.
* **Role-Based Workflows:** Separate dashboards tailored for Teachers (data ingestion & student oversight), Principals (school-wide metrics & interventions), and District Officers (multi-school heatmaps).
* **Automated Intervention Engine:** Instantly drafts warm, human-like WhatsApp notifications to parents and targeted workflow alerts for community volunteers.
* **Geospatial Risk Heatmap:** Provides an interactive `react-leaflet` district heatmap that pinpoints high-risk clusters, enabling data-driven resource allocation.
* **Intervention Tracker:** Logs actions taken (e.g., home visits, counseling) and automatically visualizes 30-day impact metrics on attendance and grades.
* **Government Scheme Matcher:** Instantly cross-references student data against available state/federal grants (e.g., Mid-Day Meal, Bicycles) and links to eligibility checklists.
* **Premium Dashboard UI:** Built with sleek animations, glassmorphism design, fluid risk progress bars, and high-performance canvas backgrounds.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (for utility-first, fully responsive design)
- **Framer Motion** (for cursor interactions, scroll storytelling, and fluid layout animations)
- **Recharts** (for academic trend lines and intervention impact bar charts)
- **React-Leaflet** (for interactive district heatmaps with custom markers/tooltips)
- **Lucide React** (modern iconography)

### Backend
- **FastAPI** (Python framework for lightning-fast, async API delivery)
- **Scikit-Learn** (Random Forest Classifier for dynamic risk scoring)
- **Pandas / NumPy** (for data ingestion, cleaning, and mock AI processing)
- **Uvicorn** (ASGI web server implementation for Python)

---

## ⚙️ Local Development Setup

To run EduGuard locally, you will need to start both the Python backend and the main frontend server.

### 1. Start the API Backend
Navigate to the `backend` directory, activate your virtual environment, and run the server.

```bash
cd backend

# If using a virtual environment (Windows)
venv\Scripts\activate

# Install requirements if not already done
pip install fastapi uvicorn pandas scikit-learn

# Run the API server
python -m uvicorn main:app --reload --port 8000
```
*The backend API will run on http://127.0.0.1:8000*

### 2. Start the Frontend
Open a new terminal session, navigate to the `frontend` directory, install packages if needed, and run the dev server.

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend application will be available at http://localhost:5173 (or 5174 depending on availability).*

---

## 📁 Project Structure

```text
Dropout/
├── backend/
│   ├── main.py            # FastAPI endpoints (predict, heatmap, messages)
│   ├── ai_model.py        # Random Forest model inference and data mock generators
│   └── venv/              # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # LandingPage, Dashboard, HeatmapPage, StudentDetail...
│   │   ├── components/    # Reusable UI elements (Cards, RiskGauge, RiskBadge)
│   │   ├── services/      # Axios/Fetch API wrappers calling the python backend
│   │   ├── AuthContext.jsx # Global user authentication & role state
│   │   ├── App.jsx        # Route definitions and sticky Glassmorphism Nav
│   │   └── index.css      # Core Tailwind styling & Theme CSS Variables
│   └── package.json       # Node dependencies and scripts
│
└── README.md
```

---

## 🔮 Future Enhancements (Roadmap)
- **Postgres/Supabase Integration:** Transition mock CSV endpoints to a relational database for true real-time syncing.
- **Twilio WhatsApp API:** Directly fire WhatsApp messages server-side instead of using deep-linking.
- **LLM Context Analysis:** Integrate an LLM to read subjective teacher notes and extract hidden behavioral risk flags not captured purely by numerical data.

---
*Built with ❤️ to protect futures.*
