<div align="center">

# 🌊 VARUN
### Urban Flood Nowcasting & Digital Twin Platform
*Coupled Meteorological Radar Telemetry, DEM Topography, and Municipal Storm Drainage Hydraulics*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet_1.9-emerald.svg)](https://leafletjs.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost-orange.svg)](https://xgboost.readthedocs.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

</div>

---

## 📌 Overview

**VARUN** is an advanced **Urban Flood Intelligence and Nowcasting Digital Twin** designed to predict street-level flood risks and inundation depths across urban centers.

Traditional flood forecasting relies purely on rainfall accumulation, failing in dense metropolitan areas where **low-lying underpass depressions, land-use imperviousness, and choked storm drainage conduits** govern waterlogging. **VARUN** solves this by physically and computationally coupling:

$$\text{Water Accumulation} = \text{Rainfall Surge} + \text{Surface Runoff (DEM Slope)} - \text{Effective Drainage Capacity}$$

---

## 🚀 Key Modules & Capabilities

1. **🗺️ Interactive GIS Digital Twin Command Center**:
   - Leaflet-based geospatial map supporting 10 live toggleable layers: Base Dark Canvas, IMD Doppler Radar Telemetry, Flood Hotspots, Water Depth Contours, Storm Drainage Network, Inflow Sumps & Barrage Outfalls, Road Safety Status, DEM Elevation Mesh, and Historical Flood Footprints.
   - Dynamic inspection drawers for hotspots and drainage segments with real-time hydraulic metrics.

2. **⏱️ 0–3 Hour Temporal Hydrograph Nowcasting**:
   - Multi-step timeline slider (`NOW`, `+30 MIN`, `+60 MIN`, `+90 MIN`, `+120 MIN`, `+150 MIN`, `+180 MIN`) with automated playback.
   - LSTM-driven hydrograph sequences predicting rainfall convergence, peak ponding, and delayed drainage recession.

3. **🚰 Urban Storm Drainage Hydraulic Matrix**:
   - Hydraulic monitoring of major trunk drains (Najafgarh Basin, Barapullah Nallah, Shahdara Outfall, Supplementary Drain, Kushak Nallah) and Yamuna barrage outfalls.
   - Identifies active surcharge bottlenecks, siltation blockages, and backwater pressures.

4. **🚗 NetworkX A* Flood-Safe Emergency Routing**:
   - Graph routing engine calculating **Shortest Route** vs **Varun Safest Route**.
   - Dynamically penalizes waterlogged road corridors, routing ambulances and citizens via elevated ridges with zero hazard exposure.

5. **🔬 2D Cellular Finite-Volume Simulation Lab**:
   - Interactive cloudburst scenarios (10 to 100 mm/hr) and drainage efficiency modifiers.
   - Live 2D mass-balance cellular matrix modeling water flux across topography.

6. **🤖 Grounded AI Flood Assistant**:
   - Natural language situational advisor conditioned strictly on structured ML outputs and hydraulic telemetry.
   - Formulates tactical municipal responses (pump deployments, traffic diversions, sluice gate operations).

---

## 📂 Project Architecture

```
varun/
├── backend/                  # Django REST Framework Backend
│   ├── config/               # Settings, routing, WSGI/ASGI
│   ├── flood/                # Flood models, views, GeoJSON endpoints
│   ├── prediction/           # Flood risk service, LSTM nowcaster, explainability
│   ├── gis/                  # Spatial data manager, drainage hydraulic service
│   ├── routing/              # NetworkX graph builder and A* flood router
│   ├── simulation/           # 2D cellular water mass-balance engine
│   ├── chatbot/              # Grounded AI Assistant service & views
│   ├── data_providers/       # IMD Weather and Radar telemetry providers
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py             # Django management script
│   └── test_api.py           # End-to-end API test verification suite
│
├── frontend/                 # React 18 + Vite + TailwindCSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/       # Header, navigation tabs, status indicators
│   │   │   ├── Map/          # Leaflet map, layer controls, time slider, zone modals
│   │   │   ├── Dashboard/    # Disaster command cards, hyetographs, alerts feed
│   │   │   ├── Drainage/     # Drainage network views and segment inspectors
│   │   │   ├── Routing/      # Emergency flood-safe routing interface
│   │   │   ├── Simulation/   # 2D cellular mesh simulation lab
│   │   │   ├── Analytics/    # XGBoost feature importance & SHAP factor charts
│   │   │   ├── Assistant/    # AI conversational drawer with situational queries
│   │   │   └── Common/       # Data sources & transparency modal
│   │   ├── services/         # Axios API service interfaces
│   │   ├── App.jsx           # Main application shell
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Custom styling & Tailwind directives
│   ├── package.json          # Node dependencies & build scripts
│   ├── vite.config.js        # Vite configuration & dev server proxy
│   └── tailwind.config.js    # Tailwind theme configuration
│
├── ml/                       # Machine Learning Core
│   ├── models/               # Trained models (.pkl, .json)
│   ├── training/             # train_flood_model.py, train_temporal_model.py
│   ├── preprocessing/        # Synthetic generator & feature engineering
│   └── inference/            # Unified ML inference runner
│
├── data/
│   └── sample/               # Delhi GeoJSON layers (roads, drainage, DEM, zones, history)
│
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

---

## 🛠️ Step-by-Step Installation & Setup

### 📋 Prerequisites
- **Python**: 3.10 or higher ([Download Python](https://www.python.org/downloads/))
- **Node.js**: 18.x or higher & npm ([Download Node.js](https://nodejs.org/))
- **Git**: Installed and configured ([Download Git](https://git-scm.com/))

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Naman-56-56/varun.git
cd varun
```

---

### 2️⃣ Backend Setup (Django & ML)

```bash
# Navigate to the project root
cd varun

# Create a virtual environment
# Windows:
python -m venv backend/venv
backend\venv\Scripts\activate

# Linux / macOS:
python3 -m venv backend/venv
source backend/venv/bin/activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Apply database migrations
python backend/manage.py migrate

# (Optional) Verify end-to-end APIs and ML inference
python backend/test_api.py

# Start the Django development server (runs on port 8000)
python backend/manage.py runserver 8000
```

> **🔑 Optional AI Assistant Key:**  
> If you wish to use live Google Gemini model generation in the AI Assistant, create a `.env` file inside `backend/` and add:  
> `GEMINI_API_KEY=your_api_key_here`  
> *(If omitted, VARUN automatically uses its built-in analytical rule-grounded response engine).*

---

### 3️⃣ Frontend Setup (React & Vite)

Open a **second terminal window** and run:

```bash
# Navigate to the frontend directory
cd varun/frontend

# Install dependencies
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

---

### 4️⃣ Open in Browser

Visit **`http://localhost:5173`** in your browser to access the live VARUN platform.

---

## 📡 REST API Reference

The backend provides high-performance REST endpoints consumed by the digital twin frontend:

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/dashboard/` | `GET` | City-wide metrics (Risk score, alert level, max depth, affected roads) |
| `/api/flood/zones/` | `GET` | GeoJSON hotspots with predicted water depths and risk classes |
| `/api/flood/timeline/` | `GET` | 0–3 hour multi-horizon LSTM hydrograph predictions |
| `/api/drainage/` | `GET` | GeoJSON trunk channels with flow, capacity, and surcharge status |
| `/api/drainage/nodes/` | `GET` | Inlet sumps, manholes, and Yamuna barrage outfall nodes |
| `/api/drainage/summary/` | `GET` | Aggregate drainage network stress and bottleneck diagnostics |
| `/api/routing/nodes/` | `GET` | List of road graph intersection landmarks |
| `/api/routing/safe-route/` | `POST` | NetworkX A* flood-safe vs shortest route comparison |
| `/api/rainfall/` | `GET` | IMD Doppler Radar stations and live precipitation telemetry |
| `/api/elevation/` | `GET` | Digital Elevation Model (DEM) topographic grid GeoJSON |
| `/api/roads/` | `GET` | Road network topology and underpass hazard classifications |
| `/api/alerts/` | `GET` | Active municipal flood warnings and tactical response protocols |
| `/api/explanation/` | `GET` | XGBoost feature importances and SHAP factor decompositions |
| `/api/historical/` | `GET` | Historical Delhi monsoon cloudburst benchmark archives |
| `/api/chatbot/query/` | `POST` | Grounded AI Assistant conversational flood advisor |

---

## 🧪 Retraining the ML Models (Optional)

The repository comes with pre-calibrated model weights. To retrain or customize the ML models with new data:

```bash
# Ensure virtual environment is activated
# Retrain XGBoost Classifier & Depth Regressor
python ml/training/train_flood_model.py

# Retrain 0-3h Temporal Sequence LSTM Nowcaster
python ml/training/train_temporal_model.py
```

---

## 🛡️ Built With

- **Backend Framework**: Django 5.0, Django REST Framework, Django CORS Headers
- **Spatial & Graph Processing**: GeoPandas, Shapely, NetworkX, SciPy
- **Machine Learning**: XGBoost, Scikit-Learn, NumPy, Pandas
- **Frontend Stack**: React 18, Vite 5, TailwindCSS 3.4, Lucide Icons, Recharts
- **GIS Mapping**: Leaflet 1.9, React-Leaflet, Esri World Dark Canvas Tiles

---

<div align="center">
Developed with ❤️ for <b>Urban Flood Resilience & Disaster Management</b>
</div>
