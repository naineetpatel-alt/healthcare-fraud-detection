#!/usr/bin/env python3
"""
Test dataset viewing API endpoints.
"""
import requests
import json


BASE_URL = "http://localhost:8001/api/v1"


def login():
    """Login and get access token."""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": "testuser", "password": "password123"}
    )
    if response.status_code == 200:
        return response.json()['access_token']
    return None


def main():
    print("=" * 80)
    print("🧪 DATASET API TEST SUITE")
    print("=" * 80)

    token = login()
    if not token:
        print("❌ Login failed")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # Test 1: Dataset stats
    print("\n📊 Test 1: Dataset Statistics")
    response = requests.get(f"{BASE_URL}/dataset/stats", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print("✓ Stats retrieved")
        print(f"  - Total Patients: {stats['total_patients']}")
        print(f"  - Total Providers: {stats['total_providers']}")
        print(f"  - Total Claims: {stats['total_claims']}")
        print(f"  - Fraudulent Claims: {stats['total_fraudulent_claims']}")
        print(f"  - Fraud Rate: {stats['fraud_rate']*100:.1f}%")
    else:
        print(f"❌ Failed: {response.text}")

    # Test 2: Get patients
    print("\n👥 Test 2: Get Patients (page 1, 5 items)")
    response = requests.get(
        f"{BASE_URL}/dataset/patients?page=1&page_size=5",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Retrieved {len(data['patients'])} patients (total: {data['total']})")
        for patient in data['patients'][:2]:
            print(f"  - {patient['patient_id']}: {patient['first_name']} {patient['last_name']}")
    else:
        print(f"❌ Failed: {response.text}")

    # Test 3: Get providers
    print("\n🏥 Test 3: Get Providers (page 1, 5 items)")
    response = requests.get(
        f"{BASE_URL}/dataset/providers?page=1&page_size=5",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Retrieved {len(data['providers'])} providers (total: {data['total']})")
        for provider in data['providers'][:2]:
            print(f"  - {provider['provider_id']}: {provider['provider_name']} ({provider['specialty']})")
    else:
        print(f"❌ Failed: {response.text}")

    # Test 4: Get claims
    print("\n📄 Test 4: Get Claims (page 1, 5 items)")
    response = requests.get(
        f"{BASE_URL}/dataset/claims?page=1&page_size=5",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Retrieved {len(data['claims'])} claims (total: {data['total']})")
        for claim in data['claims'][:2]:
            fraud_label = "FRAUD" if claim['is_fraudulent'] else "OK"
            print(f"  - {claim['claim_id']}: ${claim['claim_amount']:.2f} [{fraud_label}]")
    else:
        print(f"❌ Failed: {response.text}")

    # Test 5: Get fraud claims only
    print("\n🚨 Test 5: Get Fraudulent Claims Only (first 3)")
    response = requests.get(
        f"{BASE_URL}/dataset/claims?fraud_only=true&page_size=3",
        headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Retrieved {len(data['claims'])} fraud claims (total: {data['total']})")
        for claim in data['claims']:
            print(f"  - {claim['claim_id']}: ${claim['claim_amount']:.2f} - {claim['fraud_type']}")
    else:
        print(f"❌ Failed: {response.text}")

    # Test 6: Get specific patient
    print("\n👤 Test 6: Get Specific Patient")
    response = requests.get(
        f"{BASE_URL}/dataset/patients/PAT000001",
        headers=headers
    )
    if response.status_code == 200:
        patient = response.json()
        print(f"✓ Retrieved patient: {patient['first_name']} {patient['last_name']}")
        print(f"  - Gender: {patient['gender']}")
        print(f"  - City: {patient['city']}, {patient['state']}")
    elif response.status_code == 404:
        print("  Patient PAT000001 not found (expected)")
    else:
        print(f"❌ Failed: {response.text}")

    print("\n" + "=" * 80)
    print("✅ All dataset API tests completed!")
    print("=" * 80)


if __name__ == "__main__":
    main()
