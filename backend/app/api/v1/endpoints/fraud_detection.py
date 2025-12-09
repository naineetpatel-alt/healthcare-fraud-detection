"""
Fraud detection API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.fraud_schemas import (
    FraudDetectionRequest,
    FraudDetectionResponse,
    FraudPrediction,
    FraudStatisticsResponse,
    ModelPerformanceResponse,
    FeatureImportanceResponse,
    FeatureImportance,
    FraudDetectionWithInsightsResponse,
    FraudPredictionWithExplanation,
    FraudInsight
)
from app.core.fraud_detection_service import get_fraud_service
from app.dependencies import get_current_user
from app.models.auth_models import User


router = APIRouter()


@router.post("/detect", response_model=FraudDetectionResponse, status_code=status.HTTP_200_OK)
def detect_fraud(
    request: FraudDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Detect fraud in health insurance claims.

    This endpoint analyzes claims using a trained ML model and returns fraud predictions
    with risk levels and confidence scores.

    - **claim_ids**: Optional list of specific claim IDs to analyze (if None, analyzes all claims)
    - **limit**: Optional maximum number of claims to analyze

    Returns fraud predictions for each analyzed claim including:
    - Fraud probability (0-1)
    - Risk level (MINIMAL, LOW, MEDIUM, HIGH, CRITICAL)
    - Top risk factors contributing to the prediction
    """
    try:
        fraud_service = get_fraud_service()

        if not fraud_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Fraud detection model not loaded. Please train the model first."
            )

        # Detect fraud
        if request.claim_ids:
            predictions = fraud_service.detect_fraud_by_claim_ids(request.claim_ids)
        else:
            predictions = fraud_service.detect_fraud_all_claims(limit=request.limit)

        # Calculate statistics
        total_analyzed = len(predictions)
        fraud_detected = sum(1 for p in predictions if p['is_fraud_predicted'])
        fraud_rate = fraud_detected / total_analyzed if total_analyzed > 0 else 0

        # Convert to response model
        fraud_predictions = [FraudPrediction(**p) for p in predictions]

        return FraudDetectionResponse(
            total_analyzed=total_analyzed,
            fraud_detected=fraud_detected,
            fraud_rate=fraud_rate,
            predictions=fraud_predictions
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error detecting fraud: {str(e)}"
        )


@router.get("/statistics", response_model=FraudStatisticsResponse, status_code=status.HTTP_200_OK)
def get_fraud_statistics(current_user: User = Depends(get_current_user)):
    """
    Get fraud statistics from the database.

    Returns:
    - Total claims count
    - Fraudulent claims count
    - Normal claims count
    - Fraud rate
    - Fraud counts by type
    - Model information (if available)
    """
    try:
        fraud_service = get_fraud_service()
        stats = fraud_service.get_fraud_statistics()

        return FraudStatisticsResponse(**stats)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting fraud statistics: {str(e)}"
        )


@router.get("/model/performance", response_model=ModelPerformanceResponse, status_code=status.HTTP_200_OK)
def get_model_performance(current_user: User = Depends(get_current_user)):
    """
    Get fraud detection model performance metrics.

    Returns detailed performance metrics including:
    - Training date
    - Number of features used
    - Training and test set sizes
    - Fraud rates in train/test sets
    - Accuracy, precision, recall, F1 score, AUC-ROC for both train and test sets
    """
    try:
        fraud_service = get_fraud_service()

        if not fraud_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Fraud detection model not loaded. Please train the model first."
            )

        performance = fraud_service.get_model_performance()

        return ModelPerformanceResponse(**performance)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting model performance: {str(e)}"
        )


@router.get("/model/feature-importance", response_model=FeatureImportanceResponse, status_code=status.HTTP_200_OK)
def get_feature_importance(
    top_n: int = 20,
    current_user: User = Depends(get_current_user)
):
    """
    Get feature importance from the trained fraud detection model.

    - **top_n**: Number of top features to return (default: 20, max: 100)

    Returns a list of features ranked by importance for fraud detection.
    """
    try:
        if top_n > 100:
            top_n = 100

        fraud_service = get_fraud_service()

        if not fraud_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Fraud detection model not loaded. Please train the model first."
            )

        importance_list = fraud_service.get_feature_importance(top_n=top_n)

        features = [FeatureImportance(**item) for item in importance_list]

        return FeatureImportanceResponse(features=features)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting feature importance: {str(e)}"
        )


@router.get("/health", status_code=status.HTTP_200_OK)
def fraud_detection_health(current_user: User = Depends(get_current_user)):
    """
    Check if fraud detection service is ready.

    Returns the status of the fraud detection service including whether
    the model is loaded and ready to make predictions.
    """
    try:
        fraud_service = get_fraud_service()
        is_ready = fraud_service.is_ready()

        return {
            "status": "ready" if is_ready else "not_ready",
            "model_loaded": is_ready,
            "message": "Fraud detection service is ready" if is_ready else "Model not loaded. Please train the model first."
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking fraud detection health: {str(e)}"
        )


@router.post("/detect-with-insights", response_model=FraudDetectionWithInsightsResponse, status_code=status.HTTP_200_OK)
def detect_fraud_with_insights(
    request: FraudDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Detect fraud with OpenAI-powered executive summary and dynamic insights.

    This endpoint analyzes claims using ML and enhances results with:
    - Executive summary for banking executives
    - Dynamic insights based on detected patterns
    - Detailed explanations for each fraud case

    - **claim_ids**: Optional list of specific claim IDs to analyze (if None, analyzes all claims)
    - **limit**: Optional maximum number of claims to analyze

    Returns comprehensive fraud analysis including AI-generated insights.
    """
    try:
        fraud_service = get_fraud_service()

        if not fraud_service.is_ready():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Fraud detection model not loaded. Please train the model first."
            )

        # Detect fraud with insights
        result = fraud_service.detect_fraud_with_insights(
            limit=request.limit,
            claim_ids=request.claim_ids
        )

        # Convert predictions to response model
        predictions_with_explanations = [
            FraudPredictionWithExplanation(**p) for p in result['predictions']
        ]

        # Convert insights to response model
        insights = None
        if result.get('insights'):
            insights = [FraudInsight(**ins) for ins in result['insights']]

        return FraudDetectionWithInsightsResponse(
            total_analyzed=result['total_analyzed'],
            fraud_detected=result['fraud_detected'],
            executive_summary=result.get('executive_summary'),
            insights=insights,
            predictions=predictions_with_explanations,
            statistics=result['statistics']
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error detecting fraud with insights: {str(e)}"
        )
