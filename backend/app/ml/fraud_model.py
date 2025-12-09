"""
Fraud detection ML model using Gradient Boosting.
Handles training, prediction, and model persistence.
"""
import pickle
import os
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_curve,
    f1_score,
    precision_score,
    recall_score,
    accuracy_score
)
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


class FraudDetectionModel:
    """ML model for detecting fraudulent health insurance claims."""

    def __init__(self, model_path: str = "models_storage"):
        """
        Initialize fraud detection model.

        Args:
            model_path: Directory to save/load model files
        """
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.training_metadata = {}

        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)

    def train(self, X: pd.DataFrame, y: pd.Series,
              use_smote: bool = True,
              test_size: float = 0.2,
              random_state: int = 42) -> Dict[str, Any]:
        """
        Train fraud detection model.

        Args:
            X: Feature matrix
            y: Target labels (0=normal, 1=fraud)
            use_smote: Whether to use SMOTE for handling class imbalance
            test_size: Proportion of data to use for testing
            random_state: Random seed for reproducibility

        Returns:
            Dictionary with training metrics
        """
        print("\n🎓 Training Fraud Detection Model...")
        print(f"  - Training samples: {len(X)}")
        print(f"  - Features: {X.shape[1]}")
        print(f"  - Fraud rate: {y.mean()*100:.1f}%")

        # Store feature names
        self.feature_names = list(X.columns)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )

        print(f"\n  - Train set: {len(X_train)} samples")
        print(f"  - Test set: {len(X_test)} samples")

        # Scale features
        print("\n  - Scaling features...")
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Handle class imbalance with SMOTE
        if use_smote:
            print("\n  - Applying SMOTE for class balancing...")
            fraud_count = y_train.sum()
            normal_count = len(y_train) - fraud_count

            print(f"    Before SMOTE: {normal_count} normal, {fraud_count} fraud")

            smote = SMOTE(random_state=random_state)
            X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)

            fraud_count_after = y_train_balanced.sum()
            normal_count_after = len(y_train_balanced) - fraud_count_after
            print(f"    After SMOTE: {normal_count_after} normal, {fraud_count_after} fraud")
        else:
            X_train_balanced = X_train_scaled
            y_train_balanced = y_train

        # Train Gradient Boosting model
        print("\n  - Training Gradient Boosting Classifier...")
        self.model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            min_samples_split=10,
            min_samples_leaf=4,
            subsample=0.8,
            random_state=random_state,
            verbose=0
        )

        self.model.fit(X_train_balanced, y_train_balanced)

        print("  ✓ Model training complete!")

        # Evaluate model
        print("\n📈 Evaluating model performance...")
        metrics = self._evaluate_model(X_train_scaled, y_train, X_test_scaled, y_test)

        # Store training metadata
        self.training_metadata = {
            'trained_at': datetime.now().isoformat(),
            'num_features': X.shape[1],
            'num_training_samples': len(X_train),
            'num_test_samples': len(X_test),
            'fraud_rate_train': y_train.mean(),
            'fraud_rate_test': y_test.mean(),
            'used_smote': use_smote,
            'metrics': metrics
        }

        return metrics

    def _evaluate_model(self, X_train: np.ndarray, y_train: pd.Series,
                       X_test: np.ndarray, y_test: pd.Series) -> Dict[str, Any]:
        """Evaluate model performance on train and test sets."""

        # Predictions
        y_train_pred = self.model.predict(X_train)
        y_test_pred = self.model.predict(X_test)

        y_train_proba = self.model.predict_proba(X_train)[:, 1]
        y_test_proba = self.model.predict_proba(X_test)[:, 1]

        # Calculate metrics
        metrics = {
            'train': {
                'accuracy': accuracy_score(y_train, y_train_pred),
                'precision': precision_score(y_train, y_train_pred),
                'recall': recall_score(y_train, y_train_pred),
                'f1': f1_score(y_train, y_train_pred),
                'auc_roc': roc_auc_score(y_train, y_train_proba)
            },
            'test': {
                'accuracy': accuracy_score(y_test, y_test_pred),
                'precision': precision_score(y_test, y_test_pred),
                'recall': recall_score(y_test, y_test_pred),
                'f1': f1_score(y_test, y_test_pred),
                'auc_roc': roc_auc_score(y_test, y_test_proba)
            }
        }

        # Confusion matrix
        cm = confusion_matrix(y_test, y_test_pred)
        metrics['test']['confusion_matrix'] = cm.tolist()

        # Print results
        print("\n  TRAIN SET:")
        print(f"    - Accuracy:  {metrics['train']['accuracy']:.3f}")
        print(f"    - Precision: {metrics['train']['precision']:.3f}")
        print(f"    - Recall:    {metrics['train']['recall']:.3f}")
        print(f"    - F1 Score:  {metrics['train']['f1']:.3f}")
        print(f"    - AUC-ROC:   {metrics['train']['auc_roc']:.3f}")

        print("\n  TEST SET:")
        print(f"    - Accuracy:  {metrics['test']['accuracy']:.3f}")
        print(f"    - Precision: {metrics['test']['precision']:.3f}")
        print(f"    - Recall:    {metrics['test']['recall']:.3f}")
        print(f"    - F1 Score:  {metrics['test']['f1']:.3f}")
        print(f"    - AUC-ROC:   {metrics['test']['auc_roc']:.3f}")

        print(f"\n  CONFUSION MATRIX (Test):")
        print(f"    TN: {cm[0,0]:4d}  |  FP: {cm[0,1]:4d}")
        print(f"    FN: {cm[1,0]:4d}  |  TP: {cm[1,1]:4d}")

        return metrics

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict fraud labels (0 or 1).

        Args:
            X: Feature matrix

        Returns:
            Array of predictions (0=normal, 1=fraud)
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded")

        if self.scaler is None:
            raise ValueError("Scaler not available")

        # Align features with training data
        X_aligned = self._align_features(X)

        # Scale features
        X_scaled = self.scaler.transform(X_aligned)

        # Predict
        predictions = self.model.predict(X_scaled)

        return predictions

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict fraud probabilities.

        Args:
            X: Feature matrix

        Returns:
            Array of fraud probabilities (0-1)
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded")

        if self.scaler is None:
            raise ValueError("Scaler not available")

        # Align features with training data
        X_aligned = self._align_features(X)

        # Scale features
        X_scaled = self.scaler.transform(X_aligned)

        # Predict probabilities
        probabilities = self.model.predict_proba(X_scaled)[:, 1]

        return probabilities

    def _align_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Align features to match training data.
        Adds missing columns with zeros and removes extra columns.

        Args:
            X: Feature matrix

        Returns:
            Aligned feature matrix
        """
        # Create a copy
        X_aligned = X.copy()

        # Add missing columns with zeros
        for col in self.feature_names:
            if col not in X_aligned.columns:
                X_aligned[col] = 0

        # Select only the features used in training, in the correct order
        X_aligned = X_aligned[self.feature_names]

        return X_aligned

    def get_feature_importance(self) -> pd.DataFrame:
        """
        Get feature importance scores.

        Returns:
            DataFrame with features and importance scores
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded")

        if not hasattr(self.model, 'feature_importances_'):
            raise ValueError("Model does not have feature importances")

        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)

        return importance_df

    def save(self, model_name: str = 'fraud_model') -> str:
        """
        Save trained model to disk.

        Args:
            model_name: Name for the model file (without extension)

        Returns:
            Path to saved model file
        """
        if self.model is None:
            raise ValueError("No model to save")

        model_file = os.path.join(self.model_path, f"{model_name}.pkl")

        # Save model, scaler, feature names, and metadata
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'metadata': self.training_metadata
        }

        with open(model_file, 'wb') as f:
            pickle.dump(model_data, f)

        print(f"\n💾 Model saved to: {model_file}")

        return model_file

    def load(self, model_name: str = 'fraud_model') -> bool:
        """
        Load trained model from disk.

        Args:
            model_name: Name of the model file (without extension)

        Returns:
            True if loaded successfully, False otherwise
        """
        model_file = os.path.join(self.model_path, f"{model_name}.pkl")

        if not os.path.exists(model_file):
            print(f"❌ Model file not found: {model_file}")
            return False

        try:
            with open(model_file, 'rb') as f:
                model_data = pickle.load(f)

            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.training_metadata = model_data.get('metadata', {})

            print(f"✓ Model loaded from: {model_file}")
            print(f"  - Trained at: {self.training_metadata.get('trained_at', 'Unknown')}")
            print(f"  - Features: {self.training_metadata.get('num_features', 'Unknown')}")

            if 'metrics' in self.training_metadata:
                metrics = self.training_metadata['metrics']['test']
                print(f"  - Test Accuracy: {metrics.get('accuracy', 0):.3f}")
                print(f"  - Test F1: {metrics.get('f1', 0):.3f}")
                print(f"  - Test AUC-ROC: {metrics.get('auc_roc', 0):.3f}")

            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False

    def get_training_info(self) -> Dict[str, Any]:
        """Get information about model training."""
        return self.training_metadata


class FraudRiskAssessor:
    """Assess fraud risk and provide interpretable explanations."""

    def __init__(self, model: FraudDetectionModel):
        """
        Initialize risk assessor.

        Args:
            model: Trained FraudDetectionModel
        """
        self.model = model

    def assess_claims(self, X: pd.DataFrame, claim_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Assess fraud risk for claims and provide risk factors.

        Args:
            X: Feature matrix
            claim_ids: List of claim IDs

        Returns:
            List of risk assessments for each claim
        """
        # Get predictions and probabilities
        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)

        # Get feature importance
        feature_importance = self.model.get_feature_importance()
        top_features = feature_importance.head(10)['feature'].tolist()

        assessments = []
        for i, (claim_id, pred, prob) in enumerate(zip(claim_ids, predictions, probabilities)):
            # Determine risk level
            if prob >= 0.8:
                risk_level = "CRITICAL"
            elif prob >= 0.6:
                risk_level = "HIGH"
            elif prob >= 0.4:
                risk_level = "MEDIUM"
            elif prob >= 0.2:
                risk_level = "LOW"
            else:
                risk_level = "MINIMAL"

            # Extract risk factors (top features with high values for this claim)
            risk_factors = []
            claim_features = X.iloc[i]

            for feature in top_features[:5]:
                if feature in claim_features.index:
                    value = claim_features[feature]
                    if abs(value) > 0.1:  # Only include significant features
                        risk_factors.append({
                            'factor': feature,
                            'value': float(value)
                        })

            assessment = {
                'claim_id': claim_id,
                'is_fraud_predicted': bool(pred),
                'fraud_probability': float(prob),
                'risk_level': risk_level,
                'risk_factors': risk_factors[:3],  # Top 3 risk factors
                'confidence': float(max(prob, 1-prob))  # Confidence in prediction
            }

            assessments.append(assessment)

        return assessments
