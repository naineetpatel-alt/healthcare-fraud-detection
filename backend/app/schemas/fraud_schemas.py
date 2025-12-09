"""
Pydantic schemas for fraud detection API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class FraudRiskFactor(BaseModel):
    """Risk factor contributing to fraud prediction."""
    factor: str = Field(..., description="Name of the risk factor")
    value: float = Field(..., description="Value of the risk factor")


class FraudPrediction(BaseModel):
    """Fraud prediction for a single claim."""
    claim_id: str = Field(..., description="Unique claim identifier")
    patient_id: Optional[str] = Field(None, description="Patient ID")
    provider_id: Optional[str] = Field(None, description="Provider ID")
    claim_amount: Optional[float] = Field(None, description="Claim amount")
    service_date: Optional[str] = Field(None, description="Service date")
    claim_type: Optional[str] = Field(None, description="Type of claim")

    is_fraud_predicted: bool = Field(..., description="Whether fraud is predicted")
    fraud_probability: float = Field(..., ge=0, le=1, description="Probability of fraud (0-1)")
    risk_level: str = Field(..., description="Risk level: MINIMAL, LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(..., ge=0, le=1, description="Confidence in prediction")

    risk_factors: List[FraudRiskFactor] = Field(default_factory=list, description="Top risk factors")

    actual_fraud_label: Optional[bool] = Field(None, description="Actual fraud label (if available)")
    actual_fraud_type: Optional[str] = Field(None, description="Actual fraud type (if available)")

    class Config:
        json_schema_extra = {
            "example": {
                "claim_id": "CLM123456",
                "patient_id": "PAT000123",
                "provider_id": "PRV000456",
                "claim_amount": 5000.00,
                "service_date": "2024-01-15",
                "claim_type": "inpatient",
                "is_fraud_predicted": True,
                "fraud_probability": 0.85,
                "risk_level": "HIGH",
                "confidence": 0.85,
                "risk_factors": [
                    {"factor": "claim_amount", "value": 5000.0},
                    {"factor": "provider_fraud_rate", "value": 0.25}
                ],
                "actual_fraud_label": True,
                "actual_fraud_type": "upcoding"
            }
        }


class FraudDetectionRequest(BaseModel):
    """Request to detect fraud in claims."""
    claim_ids: Optional[List[str]] = Field(None, description="List of claim IDs to analyze (None = all claims)")
    limit: Optional[int] = Field(None, ge=1, le=10000, description="Maximum number of claims to analyze")

    class Config:
        json_schema_extra = {
            "example": {
                "claim_ids": ["CLM123456", "CLM123457"],
                "limit": 100
            }
        }


class FraudDetectionResponse(BaseModel):
    """Response from fraud detection."""
    total_analyzed: int = Field(..., description="Total number of claims analyzed")
    fraud_detected: int = Field(..., description="Number of claims flagged as fraud")
    fraud_rate: float = Field(..., ge=0, le=1, description="Percentage of claims flagged as fraud")
    predictions: List[FraudPrediction] = Field(..., description="List of fraud predictions")

    class Config:
        json_schema_extra = {
            "example": {
                "total_analyzed": 100,
                "fraud_detected": 15,
                "fraud_rate": 0.15,
                "predictions": [
                    {
                        "claim_id": "CLM123456",
                        "is_fraud_predicted": True,
                        "fraud_probability": 0.85,
                        "risk_level": "HIGH"
                    }
                ]
            }
        }


class FraudStatisticsResponse(BaseModel):
    """Response with fraud statistics."""
    total_claims: int = Field(..., description="Total number of claims")
    fraudulent_claims: int = Field(..., description="Number of fraudulent claims")
    normal_claims: int = Field(..., description="Number of normal claims")
    fraud_rate: float = Field(..., ge=0, le=1, description="Fraud rate")
    fraud_by_type: Dict[str, int] = Field(..., description="Fraud counts by type")
    model_info: Optional[Dict[str, Any]] = Field(None, description="Model information")

    class Config:
        json_schema_extra = {
            "example": {
                "total_claims": 5000,
                "fraudulent_claims": 750,
                "normal_claims": 4250,
                "fraud_rate": 0.15,
                "fraud_by_type": {
                    "upcoding": 150,
                    "phantom_billing": 100
                },
                "model_info": {
                    "trained_at": "2024-01-15T10:30:00",
                    "test_accuracy": 0.867,
                    "test_f1": 0.381
                }
            }
        }


class ModelPerformanceResponse(BaseModel):
    """Response with model performance metrics."""
    trained_at: Optional[str] = Field(None, description="When the model was trained")
    num_features: Optional[int] = Field(None, description="Number of features used")
    num_training_samples: Optional[int] = Field(None, description="Number of training samples")
    num_test_samples: Optional[int] = Field(None, description="Number of test samples")
    fraud_rate_train: Optional[float] = Field(None, description="Fraud rate in training set")
    fraud_rate_test: Optional[float] = Field(None, description="Fraud rate in test set")
    used_smote: Optional[bool] = Field(None, description="Whether SMOTE was used")
    metrics: Optional[Dict[str, Any]] = Field(None, description="Performance metrics")

    class Config:
        json_schema_extra = {
            "example": {
                "trained_at": "2024-01-15T10:30:00",
                "num_features": 48,
                "num_training_samples": 4000,
                "num_test_samples": 1000,
                "fraud_rate_train": 0.15,
                "fraud_rate_test": 0.15,
                "used_smote": True,
                "metrics": {
                    "train": {
                        "accuracy": 0.963,
                        "precision": 0.993,
                        "recall": 0.758,
                        "f1": 0.860
                    },
                    "test": {
                        "accuracy": 0.867,
                        "precision": 0.631,
                        "recall": 0.273,
                        "f1": 0.381
                    }
                }
            }
        }


class FeatureImportance(BaseModel):
    """Feature importance score."""
    feature: str = Field(..., description="Feature name")
    importance: float = Field(..., description="Importance score")


class FeatureImportanceResponse(BaseModel):
    """Response with feature importance."""
    features: List[FeatureImportance] = Field(..., description="List of features with importance scores")

    class Config:
        json_schema_extra = {
            "example": {
                "features": [
                    {"feature": "claim_amount", "importance": 0.1357},
                    {"feature": "service_day_of_week", "importance": 0.1287}
                ]
            }
        }


class FraudInsight(BaseModel):
    """Dynamic fraud insight."""
    title: str = Field(..., description="Insight title")
    description: str = Field(..., description="Insight description")
    impact: str = Field(..., description="Impact level: High, Medium, Low")
    action: str = Field(..., description="Recommended action")


class FraudExplanation(BaseModel):
    """Detailed fraud explanation for a claim."""
    summary: str = Field(..., description="Summary explanation")
    red_flags: List[Dict[str, Any]] = Field(..., description="Red flags identified")
    recommendation: str = Field(..., description="Recommended action")
    confidence_explanation: str = Field(..., description="Confidence explanation")
    total_red_flags: int = Field(..., description="Total number of red flags")
    risk_score: float = Field(..., description="Risk score")


class FraudPredictionWithExplanation(FraudPrediction):
    """Fraud prediction with detailed explanation."""
    explanation: Optional[FraudExplanation] = Field(None, description="Detailed fraud explanation")


class FraudDetectionWithInsightsResponse(BaseModel):
    """Response from fraud detection with AI-powered insights."""
    total_analyzed: int = Field(..., description="Total number of claims analyzed")
    fraud_detected: int = Field(..., description="Number of claims flagged as fraud")
    executive_summary: Optional[str] = Field(None, description="OpenAI-generated executive summary")
    insights: Optional[List[FraudInsight]] = Field(None, description="OpenAI-generated dynamic insights")
    predictions: List[FraudPredictionWithExplanation] = Field(..., description="List of fraud predictions with explanations")
    statistics: Dict[str, Any] = Field(..., description="Fraud statistics")

    class Config:
        json_schema_extra = {
            "example": {
                "total_analyzed": 100,
                "fraud_detected": 15,
                "executive_summary": "Analysis of 100 claims revealed 15 potentially fraudulent cases...",
                "insights": [
                    {
                        "title": "High-Risk Provider Cluster Detected",
                        "description": "Three providers account for 60% of flagged claims",
                        "impact": "High",
                        "action": "Immediate investigation of providers PRV001, PRV005, PRV012"
                    }
                ],
                "predictions": [],
                "statistics": {}
            }
        }
