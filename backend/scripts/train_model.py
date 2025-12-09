#!/usr/bin/env python3
"""
Train fraud detection ML model.
Loads data, extracts features, trains model, and saves it.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db.memgraph_db import get_data_loader
from app.ml.feature_extraction import FraudFeatureExtractor
from app.ml.fraud_model import FraudDetectionModel
import warnings
warnings.filterwarnings('ignore')


def main():
    """Main training pipeline."""
    print("=" * 80)
    print("🚀 FRAUD DETECTION MODEL TRAINING PIPELINE")
    print("=" * 80)

    # Step 1: Load data
    print("\n📂 Step 1: Loading data from CSV files...")
    try:
        data_loader = get_data_loader()
        print(f"  ✓ Loaded {len(data_loader.claims_df)} claims")
        print(f"  ✓ Loaded {len(data_loader.patients_df)} patients")
        print(f"  ✓ Loaded {len(data_loader.providers_df)} providers")
    except Exception as e:
        print(f"  ❌ Error loading data: {e}")
        print("\n  Please generate data first:")
        print("  python dataset/health_data_generator.py 1000 5000 0.15")
        return

    # Step 2: Extract features
    print("\n🔬 Step 2: Extracting features...")
    try:
        feature_extractor = FraudFeatureExtractor(data_loader)
        X, y = feature_extractor.prepare_training_data()
        print(f"  ✓ Extracted {X.shape[1]} features from {X.shape[0]} claims")
    except Exception as e:
        print(f"  ❌ Error extracting features: {e}")
        import traceback
        traceback.print_exc()
        return

    # Step 3: Train model
    print("\n🎓 Step 3: Training fraud detection model...")
    try:
        model = FraudDetectionModel(model_path="../models_storage")

        metrics = model.train(
            X=X,
            y=y,
            use_smote=True,
            test_size=0.2,
            random_state=42
        )

        print("\n  ✓ Model training complete!")

    except Exception as e:
        print(f"  ❌ Error training model: {e}")
        import traceback
        traceback.print_exc()
        return

    # Step 4: Save model
    print("\n💾 Step 4: Saving model...")
    try:
        model_path = model.save('fraud_model')
        print(f"  ✓ Model saved successfully!")
    except Exception as e:
        print(f"  ❌ Error saving model: {e}")
        return

    # Step 5: Display feature importance
    print("\n📊 Step 5: Top 15 Most Important Features:")
    try:
        importance_df = model.get_feature_importance()
        print("\n" + "=" * 60)
        print(f"{'Feature':<40} {'Importance':>15}")
        print("=" * 60)

        for idx, row in importance_df.head(15).iterrows():
            print(f"{row['feature']:<40} {row['importance']:>15.4f}")

        print("=" * 60)
    except Exception as e:
        print(f"  ❌ Error displaying feature importance: {e}")

    # Summary
    print("\n" + "=" * 80)
    print("✅ TRAINING COMPLETE!")
    print("=" * 80)
    print("\n📈 Model Performance Summary:")
    print(f"  - Test Accuracy:  {metrics['test']['accuracy']:.3f}")
    print(f"  - Test Precision: {metrics['test']['precision']:.3f}")
    print(f"  - Test Recall:    {metrics['test']['recall']:.3f}")
    print(f"  - Test F1 Score:  {metrics['test']['f1']:.3f}")
    print(f"  - Test AUC-ROC:   {metrics['test']['auc_roc']:.3f}")

    print("\n🎯 Model Goals:")
    goals = {
        'Precision > 0.80': '✓' if metrics['test']['precision'] > 0.80 else '✗',
        'Recall > 0.70': '✓' if metrics['test']['recall'] > 0.70 else '✗',
        'F1-Score > 0.75': '✓' if metrics['test']['f1'] > 0.75 else '✗',
        'AUC-ROC > 0.90': '✓' if metrics['test']['auc_roc'] > 0.90 else '✗'
    }

    for goal, status in goals.items():
        print(f"  {status} {goal}")

    print("\n💡 Next Steps:")
    print("  1. Test the model with: python scripts/test_fraud_patterns.py")
    print("  2. Start the API server: uvicorn app.main:app --reload")
    print("  3. Use API endpoints to detect fraud in claims")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
