"""
Main FastAPI application entry point for Health Insurance Fraud Detection System.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.db.sqlite_db import init_db


# Create FastAPI application instance
app = FastAPI(
    title="Health Insurance Fraud Detection API",
    description="API for detecting fraudulent health insurance claims using graph-based ML",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Initialize application on startup.
    Creates database tables if they don't exist.
    """
    init_db()
    print("Database initialized successfully")


@app.get("/", tags=["health"])
async def root():
    """
    Root endpoint for health check.

    Returns:
        Basic API information
    """
    return {
        "message": "Health Insurance Fraud Detection API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.

    Returns:
        System health status
    """
    return {"status": "healthy"}


# Include API v1 router
app.include_router(api_router, prefix=settings.api_v1_prefix)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
