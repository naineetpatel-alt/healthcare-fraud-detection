"""
Main API v1 router that aggregates all endpoint routers.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, fraud_detection, dataset


# Create main API v1 router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(fraud_detection.router, prefix="/fraud", tags=["Fraud Detection"])
api_router.include_router(dataset.router, prefix="/dataset", tags=["Dataset"])

# Additional routers will be added here as we build them:
# api_router.include_router(data_generation.router)
# api_router.include_router(graph.router)
