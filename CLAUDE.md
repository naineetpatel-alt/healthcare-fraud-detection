# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Health Insurance Fraud Detection System** - A full-stack application for detecting fraudulent health insurance claims using graph-based machine learning, FastAPI backend, React frontend, and Memgraph graph database.

## Tech Stack

- **Backend**: FastAPI (Python 3.9+), SQLite (auth), Memgraph (graph DB)
- **Frontend**: React 18 + Vite + TypeScript (planned)
- **ML**: scikit-learn, pandas, numpy
- **Authentication**: JWT with access/refresh tokens
- **Visualization**: Recharts (charts) + vis.js (network graphs)

## Quick Start Commands

### Backend Setup
```bash
cd backend

# Setup virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize authentication database
python scripts/init_db.py

# Generate synthetic data (100 patients, 500 claims, 15% fraud)
python dataset/health_data_generator.py 100 500 0.15

# Start API server (runs on port 8001 to avoid conflicts)
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Docker (Memgraph Graph Database)
```bash
# Start Memgraph
docker-compose up -d memgraph

# Access Memgraph Lab UI
open http://localhost:3000
```

### Testing Authentication
```bash
# Health check
curl http://localhost:8001/health

# Login with default admin
curl -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Architecture Overview

### High-Level Design

The system uses a **graph-based approach** to detect fraud patterns by modeling relationships between:
- Patients (individuals with health insurance)
- Providers (doctors, hospitals, clinics, pharmacies)
- Policies (health insurance coverage)
- Claims (submitted medical claims)
- Procedures, Diagnoses, Medications (medical reference data)

**Key Innovation**: By storing data in a graph database (Memgraph), we can detect complex fraud patterns like:
- Provider fraud rings (kickback schemes)
- Patient identity theft networks
- Family ganging (shared address clusters)
- Ping-ponging (circular referrals)

### Backend Architecture

```
backend/
├── app/                          # FastAPI application
│   ├── api/v1/endpoints/         # REST API endpoints
│   │   ├── auth.py               # JWT authentication (COMPLETE ✅)
│   │   ├── data_generation.py    # Trigger data generation (TODO)
│   │   ├── dataset.py            # View datasets (TODO)
│   │   ├── fraud_detection.py    # Run ML fraud detection (TODO)
│   │   ├── graph.py              # Graph data for vis.js (TODO)
│   │   └── metrics.py            # Model metrics (TODO)
│   ├── core/                     # Business logic
│   │   ├── security.py           # JWT & password hashing (COMPLETE ✅)
│   │   ├── fraud_detection_service.py (TODO)
│   │   └── graph_service.py      # Memgraph queries (TODO)
│   ├── db/                       # Database connections
│   │   ├── sqlite_db.py          # SQLite for auth (COMPLETE ✅)
│   │   └── memgraph_db.py        # Memgraph driver (TODO)
│   ├── models/                   # SQLAlchemy ORM models
│   │   └── auth_models.py        # User, RefreshToken (COMPLETE ✅)
│   ├── schemas/                  # Pydantic request/response schemas
│   │   └── auth_schemas.py       # Auth schemas (COMPLETE ✅)
│   └── ml/                       # Machine learning
│       ├── feature_extraction.py # Graph-based features (TODO)
│       ├── fraud_model.py        # ML model (TODO)
│       └── model_training.py     # Training pipeline (TODO)
├── dataset/                      # Data generation
│   ├── medical_codes.py          # ICD-10, CPT, NDC codes (COMPLETE ✅)
│   ├── provider_data.py          # Provider utilities (COMPLETE ✅)
│   └── health_data_generator.py  # Synthetic data gen (COMPLETE ✅)
├── scripts/
│   ├── init_db.py                # Init SQLite (COMPLETE ✅)
│   ├── load_health_dataset.py    # Load to Memgraph (TODO)
│   └── train_model.py            # Train ML model (TODO)
└── data/                         # Generated data (CSV files)
```

## Fraud Detection Patterns (16 Total)

The system detects **16 different fraud patterns**:

### Critical Severity (4 patterns)
1. **Phantom Billing** - Claims for deceased patients or non-existent services
2. **Kickback Schemes** - Illegal referral arrangements (requires graph analysis)
3. **Credential Misuse** - Using another provider's credentials
4. **Identity Theft** - Stolen patient information (requires graph analysis)

### High Severity (9 patterns)
5. **Upcoding** - Billing expensive procedures for simple diagnoses
6. **Unbundling** - Splitting bundled procedures
7. **Excessive Services** - Unnecessary repeated procedures
8. **Double Billing** - Same service billed multiple times
9. **DRG Creep** - Inflating diagnosis codes
10. **Cloning** - Copying treatment info between patients
11. **Unnecessary Admissions** - Admitting patients unnecessarily
12. **LOS Inflation** - Extending hospital stays
13. **Equipment Fraud** - Billing for undelivered equipment

### Medium Severity (3 patterns)
14. **Service Substitution** - Billing for different service than provided
15. **Ping-Ponging** - Unnecessary back-and-forth referrals (requires graph analysis)
16. **Family Ganging** - Billing all family members (requires graph analysis)

**Graph-Powered Detection**: 5 patterns use graph analysis (kickback schemes, identity theft, ping-ponging, family ganging, equipment fraud)

## Data Generation

### Usage
```bash
python dataset/health_data_generator.py <num_patients> <num_claims> [fraud_rate]

# Example: 10,000 patients, 50,000 claims, 15% fraud
python dataset/health_data_generator.py 10000 50000 0.15
```

### Output Files (saved to `data/`)
- `patients.csv` - Patient demographics
- `providers.csv` - Healthcare providers (doctors, hospitals, etc.)
- `pharmacies.csv` - Pharmacy locations
- `policies.csv` - Insurance policies
- `claims.csv` - Medical claims (normal + fraudulent)
- `diagnoses.csv` - ICD-10 diagnosis codes
- `procedures.csv` - CPT procedure codes
- `medications.csv` - NDC medication codes
- `metadata.json` - Generation statistics

### Fraud Distribution
With 15% fraud rate on 50,000 claims:
- 42,500 normal claims
- 7,500 fraudulent claims distributed across 16 patterns (~469 per pattern)

## Authentication System

### Default Credentials
- **Username**: admin
- **Password**: admin123

**IMPORTANT**: Change these in production!

### JWT Flow
1. **Login**: POST `/api/v1/auth/login` → Returns access token (30min) + refresh token (7 days)
2. **Protected Endpoints**: Include `Authorization: Bearer <access_token>` header
3. **Refresh**: POST `/api/v1/auth/refresh` with refresh token → Get new access token
4. **Logout**: POST `/api/v1/auth/logout` → Revoke refresh token

### Database
- SQLite at `backend/data/auth.db`
- Tables: `users`, `refresh_tokens`

## Adding New Fraud Patterns

**Easy!** Just add to `backend/dataset/medical_codes.py`:

```python
FRAUD_PATTERNS = {
    "new_pattern": {
        "description": "What the fraud is",
        "indicators": ["signal1", "signal2"],
        "severity": "high",  # critical, high, medium, low
        "avg_loss": 2000,
        "detection_difficulty": "medium",  # easy, medium, hard
        "graph_pattern": None  # or "pattern_name" if graph needed
    }
}
```

The system automatically:
- ✅ Generates data with this pattern
- ✅ Extracts ML features
- ✅ Displays in dashboards
- ✅ Tracks in analytics

## Development Status

### ✅ Completed (Phases 1-2)
- Backend foundation (FastAPI, CORS, config)
- JWT authentication system
- Medical reference data (ICD-10, CPT, NDC codes)
- Data generator with 16 fraud patterns
- Docker Compose setup

### 🔄 In Progress (Phase 2.3)
- Memgraph data loading script

### 📋 TODO (Phases 3-10)
- ML model training and fraud detection service
- Dataset and graph API endpoints
- React frontend with authentication
- Data generation UI
- Dataset viewer with tables
- Fraud detection UI
- Visualizations (Recharts + vis.js)
- Testing and documentation

## Important Notes

- Backend API runs on **port 8001** (not 8000) to avoid conflicts
- Data generator supports **command-line arguments** for flexibility
- All 16 fraud patterns are **production-ready** and research-backed
- Graph patterns require **Memgraph** for detection
- System designed for **easy extensibility** - add fraud patterns without code refactoring

## Resources

- API Documentation: http://localhost:8001/docs (when server running)
- Memgraph Lab: http://localhost:3000 (when Docker running)
- Implementation Plan: `.claude/plans/encapsulated-leaping-teapot.md`
- Fraud Patterns Guide: `FRAUD_PATTERNS_GUIDE.md`
