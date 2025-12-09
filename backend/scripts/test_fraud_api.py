#!/usr/bin/env python3
"""
Test fraud detection API endpoints.
"""
import requests
import json


BASE_URL = "http://localhost:8001/api/v1"


def login():
    """Login and get access token."""
    print("\n🔐 Logging in...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "username": "testuser",
            "password": "password123"
        }
    )

    if response.status_code == 200:
        data = response.json()
        print("✓ Login successful")
        return data['access_token']
    elif response.status_code == 404:
        # User doesn't exist, register first
        print("  User not found, registering...")
        register_response = requests.post(
            f"{BASE_URL}/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "password123"
            }
        )

        if register_response.status_code == 201:
            print("✓ Registration successful, logging in...")
            return login()
        else:
            print(f"❌ Registration failed: {register_response.text}")
            return None
    else:
        print(f"❌ Login failed: {response.text}")
        return None


def test_fraud_health(token):
    """Test fraud detection health endpoint."""
    print("\n🏥 Testing fraud detection health...")
    response = requests.get(
        f"{BASE_URL}/fraud/health",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Health check successful")
        print(f"  Status: {data['status']}")
        print(f"  Model loaded: {data['model_loaded']}")
        print(f"  Message: {data['message']}")
        return data['model_loaded']
    else:
        print(f"❌ Health check failed: {response.text}")
        return False


def test_fraud_statistics(token):
    """Test fraud statistics endpoint."""
    print("\n📊 Testing fraud statistics...")
    response = requests.get(
        f"{BASE_URL}/fraud/statistics",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Statistics retrieved")
        print(f"  Total claims: {data['total_claims']}")
        print(f"  Fraudulent claims: {data['fraudulent_claims']}")
        print(f"  Fraud rate: {data['fraud_rate']*100:.1f}%")
        print(f"  Fraud by type: {len(data['fraud_by_type'])} types")
        return True
    else:
        print(f"❌ Statistics failed: {response.text}")
        return False


def test_model_performance(token):
    """Test model performance endpoint."""
    print("\n📈 Testing model performance...")
    response = requests.get(
        f"{BASE_URL}/fraud/model/performance",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Model performance retrieved")
        print(f"  Trained at: {data['trained_at']}")
        print(f"  Features: {data['num_features']}")
        print(f"  Test accuracy: {data['metrics']['test']['accuracy']:.3f}")
        print(f"  Test F1: {data['metrics']['test']['f1']:.3f}")
        return True
    else:
        print(f"❌ Model performance failed: {response.text}")
        return False


def test_feature_importance(token):
    """Test feature importance endpoint."""
    print("\n🔍 Testing feature importance...")
    response = requests.get(
        f"{BASE_URL}/fraud/model/feature-importance?top_n=10",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Feature importance retrieved")
        print(f"\n  Top 10 Features:")
        for i, feature in enumerate(data['features'][:10], 1):
            print(f"  {i:2d}. {feature['feature']:<40} {feature['importance']:>.4f}")
        return True
    else:
        print(f"❌ Feature importance failed: {response.text}")
        return False


def test_fraud_detection(token):
    """Test fraud detection endpoint."""
    print("\n🔬 Testing fraud detection (analyzing 50 claims)...")
    response = requests.post(
        f"{BASE_URL}/fraud/detect",
        json={"limit": 50},
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Fraud detection complete")
        print(f"  Total analyzed: {data['total_analyzed']}")
        print(f"  Fraud detected: {data['fraud_detected']}")
        print(f"  Fraud rate: {data['fraud_rate']*100:.1f}%")

        # Show some high-risk predictions
        high_risk = [p for p in data['predictions'] if p['risk_level'] in ['HIGH', 'CRITICAL']]
        if high_risk:
            print(f"\n  High-risk claims found: {len(high_risk)}")
            print(f"\n  Sample high-risk predictions:")
            for pred in high_risk[:3]:
                print(f"    - Claim {pred['claim_id']}")
                print(f"      Risk: {pred['risk_level']} ({pred['fraud_probability']*100:.1f}%)")
                print(f"      Amount: ${pred['claim_amount']:.2f}")
                if pred['actual_fraud_label']:
                    print(f"      ✓ Actually fraudulent ({pred['actual_fraud_type']})")
                else:
                    print(f"      ✗ Actually normal (false positive)")

        return True
    else:
        print(f"❌ Fraud detection failed: {response.text}")
        return False


def main():
    """Main test function."""
    print("=" * 80)
    print("🧪 FRAUD DETECTION API TEST SUITE")
    print("=" * 80)

    # Login
    token = login()
    if not token:
        print("\n❌ Could not authenticate. Exiting.")
        return

    # Run tests
    tests_passed = 0
    tests_total = 5

    if test_fraud_health(token):
        tests_passed += 1

    if test_fraud_statistics(token):
        tests_passed += 1

    if test_model_performance(token):
        tests_passed += 1

    if test_feature_importance(token):
        tests_passed += 1

    if test_fraud_detection(token):
        tests_passed += 1

    # Summary
    print("\n" + "=" * 80)
    print(f"📋 TEST SUMMARY: {tests_passed}/{tests_total} tests passed")
    print("=" * 80)

    if tests_passed == tests_total:
        print("\n✅ All tests passed!")
    else:
        print(f"\n⚠ Some tests failed: {tests_total - tests_passed} failures")


if __name__ == "__main__":
    main()
