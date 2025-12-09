"""
Fraud detection service for analyzing health insurance claims.
"""
from typing import Dict, List, Optional, Any
import pandas as pd
from app.db.memgraph_db import get_data_loader
from app.ml.feature_extraction import FraudFeatureExtractor
from app.ml.fraud_model import FraudDetectionModel, FraudRiskAssessor
from app.core.fraud_explainer_service import get_fraud_explainer
import os


class FraudDetectionService:
    """Service for detecting fraudulent health insurance claims."""

    def __init__(self, model_path: str = "models_storage"):
        """
        Initialize fraud detection service.

        Args:
            model_path: Path to directory containing trained model
        """
        self.model_path = model_path
        self.model = None
        self.feature_extractor = None
        self.risk_assessor = None
        self.data_loader = None

        # Try to load model on initialization
        self._initialize()

    def _initialize(self):
        """Initialize model and data loader."""
        try:
            # Load data
            self.data_loader = get_data_loader()

            # Load trained model
            self.model = FraudDetectionModel(model_path=self.model_path)
            model_loaded = self.model.load('fraud_model')

            if model_loaded:
                # Initialize feature extractor
                self.feature_extractor = FraudFeatureExtractor(self.data_loader)

                # Initialize risk assessor
                self.risk_assessor = FraudRiskAssessor(self.model)

                print("✓ Fraud detection service initialized successfully")
            else:
                print("⚠ Warning: Model not found. Please train the model first.")
                print("   Run: python scripts/train_model.py")

        except Exception as e:
            print(f"⚠ Warning: Could not initialize fraud detection service: {e}")

    def detect_fraud_all_claims(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Detect fraud in all claims in the database.

        Args:
            limit: Maximum number of claims to analyze (None = all)

        Returns:
            List of fraud predictions with risk assessments
        """
        if self.model is None or self.feature_extractor is None:
            raise ValueError("Model not loaded. Please train the model first.")

        # Get all claims
        claims_df = self.data_loader.claims_df.copy()

        if limit:
            claims_df = claims_df.head(limit)

        # Extract features
        print(f"Analyzing {len(claims_df)} claims for fraud...")
        claim_ids = claims_df['claim_id'].tolist()
        features_df = self.feature_extractor.extract_all_features(claim_ids)

        # Get claim IDs in correct order
        claim_ids_ordered = features_df['claim_id'].tolist()
        features_df = features_df.drop('claim_id', axis=1)

        # Fill missing values
        features_df = features_df.fillna(0)
        features_df = features_df.replace([float('inf'), float('-inf')], 0)

        # Get predictions
        assessments = self.risk_assessor.assess_claims(features_df, claim_ids_ordered)

        # Add claim details to assessments
        # Drop duplicate claim_ids to ensure unique index
        claim_details = claims_df.drop_duplicates(subset='claim_id').set_index('claim_id').to_dict('index')

        for assessment in assessments:
            claim_id = assessment['claim_id']
            if claim_id in claim_details:
                details = claim_details[claim_id]
                assessment.update({
                    'patient_id': str(details.get('patient_id', '')),
                    'provider_id': str(details.get('provider_id', '')),
                    'claim_amount': float(details.get('claim_amount', 0)),
                    'service_date': str(details.get('service_date', '')),
                    'claim_type': str(details.get('claim_type', '')),
                    'actual_fraud_label': bool(details.get('is_fraudulent', False)),
                    'actual_fraud_type': str(details.get('fraud_type', '')) if pd.notna(details.get('fraud_type')) else None
                })

        # Generate explanations for each assessment
        explainer = get_fraud_explainer()
        for assessment in assessments:
            try:
                explanation = explainer.generate_explanation(
                    claim_data=assessment,
                    risk_factors=assessment.get('risk_factors', []),
                    fraud_probability=assessment.get('fraud_probability', 0.0),
                    risk_level=assessment.get('risk_level', 'LOW')
                )
                assessment['explanation'] = explanation
            except Exception as e:
                # If explanation fails, continue without it
                print(f"Warning: Could not generate explanation for claim {assessment.get('claim_id')}: {e}")
                assessment['explanation'] = None

        print(f"✓ Analyzed {len(assessments)} claims")
        return assessments

    def detect_fraud_by_claim_ids(self, claim_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Detect fraud for specific claim IDs.

        Args:
            claim_ids: List of claim IDs to analyze

        Returns:
            List of fraud predictions with risk assessments
        """
        if self.model is None or self.feature_extractor is None:
            raise ValueError("Model not loaded. Please train the model first.")

        # Get claims
        claims_df = self.data_loader.claims_df[
            self.data_loader.claims_df['claim_id'].isin(claim_ids)
        ].copy()

        if len(claims_df) == 0:
            return []

        # Extract features
        print(f"Analyzing {len(claims_df)} claims for fraud...")
        features_df = self.feature_extractor.extract_all_features(claim_ids)

        # Get claim IDs in correct order
        claim_ids_ordered = features_df['claim_id'].tolist()
        features_df = features_df.drop('claim_id', axis=1)

        # Fill missing values
        features_df = features_df.fillna(0)
        features_df = features_df.replace([float('inf'), float('-inf')], 0)

        # Get predictions
        assessments = self.risk_assessor.assess_claims(features_df, claim_ids_ordered)

        # Add claim details to assessments
        # Drop duplicate claim_ids to ensure unique index
        claim_details = claims_df.drop_duplicates(subset='claim_id').set_index('claim_id').to_dict('index')

        for assessment in assessments:
            claim_id = assessment['claim_id']
            if claim_id in claim_details:
                details = claim_details[claim_id]
                assessment.update({
                    'patient_id': str(details.get('patient_id', '')),
                    'provider_id': str(details.get('provider_id', '')),
                    'claim_amount': float(details.get('claim_amount', 0)),
                    'service_date': str(details.get('service_date', '')),
                    'claim_type': str(details.get('claim_type', '')),
                    'actual_fraud_label': bool(details.get('is_fraudulent', False)),
                    'actual_fraud_type': str(details.get('fraud_type', '')) if pd.notna(details.get('fraud_type')) else None
                })

        # Generate explanations for each assessment
        explainer = get_fraud_explainer()
        for assessment in assessments:
            try:
                explanation = explainer.generate_explanation(
                    claim_data=assessment,
                    risk_factors=assessment.get('risk_factors', []),
                    fraud_probability=assessment.get('fraud_probability', 0.0),
                    risk_level=assessment.get('risk_level', 'LOW')
                )
                assessment['explanation'] = explanation
            except Exception as e:
                # If explanation fails, continue without it
                print(f"Warning: Could not generate explanation for claim {assessment.get('claim_id')}: {e}")
                assessment['explanation'] = None

        print(f"✓ Analyzed {len(assessments)} claims")
        return assessments

    def get_fraud_statistics(self) -> Dict[str, Any]:
        """
        Get fraud detection statistics.

        Returns:
            Dictionary with fraud statistics
        """
        if self.data_loader is None:
            raise ValueError("Data not loaded")

        stats = self.data_loader.get_fraud_statistics()

        # Add model info if available
        if self.model:
            model_info = self.model.get_training_info()
            if model_info:
                stats['model_info'] = {
                    'trained_at': model_info.get('trained_at'),
                    'test_accuracy': model_info.get('metrics', {}).get('test', {}).get('accuracy'),
                    'test_f1': model_info.get('metrics', {}).get('test', {}).get('f1'),
                    'test_auc_roc': model_info.get('metrics', {}).get('test', {}).get('auc_roc'),
                }

        return stats

    def get_model_performance(self) -> Dict[str, Any]:
        """
        Get model performance metrics.

        Returns:
            Dictionary with performance metrics
        """
        if self.model is None:
            raise ValueError("Model not loaded")

        training_info = self.model.get_training_info()

        if not training_info:
            return {'error': 'No training information available'}

        return {
            'trained_at': training_info.get('trained_at'),
            'num_features': training_info.get('num_features'),
            'num_training_samples': training_info.get('num_training_samples'),
            'num_test_samples': training_info.get('num_test_samples'),
            'fraud_rate_train': training_info.get('fraud_rate_train'),
            'fraud_rate_test': training_info.get('fraud_rate_test'),
            'used_smote': training_info.get('used_smote'),
            'metrics': training_info.get('metrics')
        }

    def get_feature_importance(self, top_n: int = 20) -> List[Dict[str, Any]]:
        """
        Get feature importance from trained model.

        Args:
            top_n: Number of top features to return

        Returns:
            List of features with importance scores
        """
        if self.model is None:
            raise ValueError("Model not loaded")

        importance_df = self.model.get_feature_importance()

        return importance_df.head(top_n).to_dict('records')

    def detect_fraud_with_insights(self, limit: Optional[int] = None, claim_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Detect fraud and generate OpenAI-powered insights.

        Args:
            limit: Maximum number of claims to analyze (for all claims)
            claim_ids: Specific claim IDs to analyze

        Returns:
            Dictionary with predictions, executive_summary, insights, statistics
        """
        from app.core.openai_service import get_openai_service

        # Get fraud predictions
        if claim_ids:
            assessments = self.detect_fraud_by_claim_ids(claim_ids)
        else:
            assessments = self.detect_fraud_all_claims(limit)

        # Get statistics
        statistics = self.get_fraud_statistics()

        # Generate OpenAI insights
        try:
            openai_service = get_openai_service()

            # Generate executive summary
            print("Generating executive summary...")
            executive_summary = openai_service.generate_executive_summary(assessments, statistics)

            # Generate dynamic insights
            print("Generating dynamic insights...")
            insights = openai_service.generate_dynamic_insights(assessments)

            return {
                'predictions': assessments,
                'executive_summary': executive_summary,
                'insights': insights,
                'statistics': statistics,
                'total_analyzed': len(assessments),
                'fraud_detected': sum(1 for a in assessments if a.get('is_fraud_predicted', False))
            }
        except Exception as e:
            print(f"Warning: Could not generate AI insights: {e}")
            # Return without AI insights
            return {
                'predictions': assessments,
                'executive_summary': None,
                'insights': None,
                'statistics': statistics,
                'total_analyzed': len(assessments),
                'fraud_detected': sum(1 for a in assessments if a.get('is_fraud_predicted', False))
            }

    def is_ready(self) -> bool:
        """Check if service is ready to detect fraud."""
        return self.model is not None and self.feature_extractor is not None


# Global service instance
_fraud_service = None


def get_fraud_service() -> FraudDetectionService:
    """Get singleton fraud detection service instance."""
    global _fraud_service
    if _fraud_service is None:
        _fraud_service = FraudDetectionService()
    return _fraud_service
