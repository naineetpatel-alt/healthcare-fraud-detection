"""
Health Insurance Data Generator with Fraud Patterns

Generates realistic synthetic health insurance data including:
- Patients with demographics and medical history
- Healthcare providers (doctors, hospitals, clinics, pharmacies)
- Health insurance policies (HMO, PPO, Medicare, Medicaid)
- Medical claims with procedures, diagnoses, and medications
- Deliberate fraud patterns for ML training

Usage:
    python health_data_generator.py <num_patients> <num_claims> [fraud_rate]

Example:
    python health_data_generator.py 10000 50000 0.15
    # Generates 10,000 patients, 50,000 claims with 15% fraud rate
"""

import random
import sys
import os
from datetime import datetime, timedelta
from faker import Faker
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
import json

# Import medical reference data
from medical_codes import (
    ICD10_CODES,
    CPT_CODES,
    NDC_CODES,
    SPECIALTIES,
    PROVIDER_TYPES,
    POLICY_TYPES,
    FRAUD_PATTERNS,
    is_appropriate_combination,
    get_typical_cost,
)
from provider_data import (
    generate_npi_number,
    generate_license_number,
    generate_provider_name,
)

# Initialize Faker
fake = Faker()
random.seed(42)  # For reproducibility
np.random.seed(42)


class HealthInsuranceDataGenerator:
    """
    Comprehensive health insurance data generator with fraud patterns.
    """

    def __init__(
        self,
        num_patients: int = 10000,
        num_claims: int = 50000,
        fraud_rate: float = 0.15,
        start_date: str = "2023-01-01",
        end_date: str = "2024-12-31"
    ):
        """
        Initialize the data generator.

        Args:
            num_patients: Number of patients to generate
            num_claims: Number of claims to generate
            fraud_rate: Percentage of claims that should be fraudulent (0.0 to 1.0)
            start_date: Start date for claim generation
            end_date: End date for claim generation
        """
        self.num_patients = num_patients
        self.num_claims = num_claims
        self.fraud_rate = fraud_rate
        self.start_date = datetime.strptime(start_date, "%Y-%m-%d")
        self.end_date = datetime.strptime(end_date, "%Y-%m-%d")

        # Calculate derived numbers
        self.num_providers = max(int(num_patients * 0.05), 100)  # 5% of patients, min 100
        self.num_pharmacies = max(int(num_patients * 0.01), 50)  # 1% of patients, min 50
        self.num_policies = int(num_patients * 1.2)  # Some patients have multiple policies

        # Storage for generated data
        self.patients = []
        self.providers = []
        self.pharmacies = []
        self.policies = []
        self.claims = []
        self.procedures = []
        self.diagnoses = []
        self.medications = []

        # Fraud tracking
        self.fraud_claim_ids = set()
        self.fraud_patterns_used = {pattern: 0 for pattern in FRAUD_PATTERNS.keys()}

        print(f"\n🏥 Health Insurance Data Generator Initialized")
        print(f"   Patients: {self.num_patients:,}")
        print(f"   Providers: {self.num_providers:,}")
        print(f"   Policies: {self.num_policies:,}")
        print(f"   Claims: {self.num_claims:,}")
        print(f"   Fraud Rate: {self.fraud_rate * 100:.1f}%")
        print(f"   Expected Fraudulent Claims: {int(self.num_claims * self.fraud_rate):,}")
        print()

    def generate_all_data(self):
        """Generate all data entities."""
        print("=" * 80)
        print("GENERATING HEALTH INSURANCE DATA")
        print("=" * 80)
        print()

        # Step 1: Generate reference data
        print("📚 Step 1/8: Generating reference data (diagnoses, procedures, medications)...")
        self._generate_reference_data()

        # Step 2: Generate patients
        print("👥 Step 2/8: Generating patients...")
        self.patients = self._generate_patients()

        # Step 3: Generate providers
        print("🏥 Step 3/8: Generating healthcare providers...")
        self.providers = self._generate_providers()

        # Step 4: Generate pharmacies
        print("💊 Step 4/8: Generating pharmacies...")
        self.pharmacies = self._generate_pharmacies()

        # Step 5: Generate policies
        print("📋 Step 5/8: Generating insurance policies...")
        self.policies = self._generate_policies()

        # Step 6: Generate normal claims
        num_normal_claims = int(self.num_claims * (1 - self.fraud_rate))
        print(f"✅ Step 6/8: Generating {num_normal_claims:,} normal claims...")
        normal_claims = self._generate_normal_claims(num_normal_claims)

        # Step 7: Generate fraudulent claims
        num_fraud_claims = self.num_claims - num_normal_claims
        print(f"🚨 Step 7/8: Generating {num_fraud_claims:,} fraudulent claims...")
        fraud_claims = self._generate_fraudulent_claims(num_fraud_claims)

        # Combine claims
        self.claims = normal_claims + fraud_claims
        random.shuffle(self.claims)  # Mix normal and fraud claims

        # Step 8: Generate statistics
        print("📊 Step 8/8: Calculating statistics...")
        self._print_statistics()

        print()
        print("=" * 80)
        print("✅ DATA GENERATION COMPLETE")
        print("=" * 80)
        print()

    def _generate_reference_data(self):
        """Generate reference data for diagnoses, procedures, and medications."""
        # Convert ICD-10 codes to list format
        for code, data in ICD10_CODES.items():
            self.diagnoses.append({
                'diagnosis_id': f"DX_{code.replace('.', '_')}",
                'icd_10_code': code,
                'diagnosis_name': data['name'],
                'severity': data['severity'],
                'category': data['category']
            })

        # Convert CPT codes to list format
        for code, data in CPT_CODES.items():
            self.procedures.append({
                'procedure_id': f"PROC_{code}",
                'cpt_code': code,
                'procedure_name': data['name'],
                'cost_low': data['cost_low'],
                'cost_high': data['cost_high'],
                'complexity': data['complexity'],
                'category': data['category']
            })

        # Convert NDC codes to list format
        for code, data in NDC_CODES.items():
            self.medications.append({
                'medication_id': f"MED_{code.replace('-', '_')}",
                'ndc_code': code,
                'drug_name': data['name'],
                'generic': data['generic'],
                'cost': data['cost'],
                'controlled': data['controlled'],
                'drug_class': data['class']
            })

        print(f"   ✓ {len(self.diagnoses)} diagnoses")
        print(f"   ✓ {len(self.procedures)} procedures")
        print(f"   ✓ {len(self.medications)} medications")

    def _generate_patients(self) -> List[Dict]:
        """Generate patient records with demographics."""
        patients = []

        for i in range(self.num_patients):
            # Determine if phantom patient (for fraud)
            is_phantom = random.random() < 0.005  # 0.5% phantom patients
            is_deceased = random.random() < 0.02  # 2% deceased

            # Generate demographics
            gender = random.choice(['M', 'F', 'Other'])
            birth_date = fake.date_of_birth(minimum_age=0, maximum_age=90)
            age = (datetime.now().date() - birth_date).days // 365

            # Generate address (some will share for family ganging fraud)
            if random.random() < 0.1:  # 10% share addresses (families)
                if patients:
                    # Share address with previous patient
                    prev_patient = random.choice(patients[-10:])  # From last 10
                    address = prev_patient['address']
                    city = prev_patient['city']
                    state = prev_patient['state']
                    zip_code = prev_patient['zip_code']
                else:
                    address = fake.street_address()
                    city = fake.city()
                    state = fake.state_abbr()
                    zip_code = fake.zipcode()
            else:
                address = fake.street_address()
                city = fake.city()
                state = fake.state_abbr()
                zip_code = fake.zipcode()

            # Generate chronic conditions based on age
            chronic_conditions = self._generate_chronic_conditions(age)

            patient = {
                'patient_id': f"PAT{i:06d}",
                'first_name': fake.first_name_male() if gender == 'M' else fake.first_name_female(),
                'last_name': fake.last_name(),
                'date_of_birth': birth_date.isoformat(),
                'age': age,
                'gender': gender,
                'address': address,
                'city': city,
                'state': state,
                'zip_code': zip_code,
                'phone': fake.phone_number(),
                'email': fake.email() if not is_phantom else None,
                'ssn_hash': fake.sha256(),
                'registration_date': fake.date_between(start_date='-5y', end_date='today').isoformat(),
                'is_deceased': is_deceased,
                'date_of_death': fake.date_between(start_date='-2y', end_date='today').isoformat() if is_deceased else None,
                'chronic_conditions': chronic_conditions,
                'is_phantom': is_phantom
            }

            patients.append(patient)

        print(f"   ✓ Generated {len(patients):,} patients")
        print(f"     • {sum(1 for p in patients if p['is_deceased'])} deceased")
        print(f"     • {sum(1 for p in patients if p['is_phantom'])} phantom patients")

        return patients

    def _generate_chronic_conditions(self, age: int) -> List[str]:
        """Generate realistic chronic conditions based on age."""
        conditions = []

        # Older patients more likely to have conditions
        if age > 65:
            if random.random() < 0.4:
                conditions.append('hypertension')
            if random.random() < 0.3:
                conditions.append('diabetes')
            if random.random() < 0.2:
                conditions.append('heart_disease')
        elif age > 45:
            if random.random() < 0.2:
                conditions.append('hypertension')
            if random.random() < 0.15:
                conditions.append('diabetes')
        elif age > 25:
            if random.random() < 0.05:
                conditions.append('asthma')

        return conditions

    def _generate_providers(self) -> List[Dict]:
        """Generate healthcare provider records."""
        providers = []

        # Distribute provider types
        type_distribution = {
            "Physician - Primary Care": 0.3,
            "Physician - Specialist": 0.25,
            "Hospital - General Acute Care": 0.15,
            "Clinic - Urgent Care": 0.15,
            "Clinic - Outpatient": 0.10,
            "Laboratory": 0.03,
            "Imaging Center": 0.02,
        }

        for i in range(self.num_providers):
            # Select provider type
            provider_type = np.random.choice(
                list(type_distribution.keys()),
                p=list(type_distribution.values())
            )

            # Select specialty for physicians
            if "Physician" in provider_type:
                specialty = random.choice(list(SPECIALTIES.keys()))
            else:
                specialty = None

            # Determine if fraudulent provider
            has_fraud_history = random.random() < 0.03  # 3% with fraud history
            is_phantom = random.random() < 0.005  # 0.5% phantom providers

            provider = {
                'provider_id': generate_npi_number(),
                'provider_name': generate_provider_name(provider_type),
                'provider_type': provider_type,
                'specialty': specialty,
                'address': fake.street_address(),
                'city': fake.city(),
                'state': fake.state_abbr(),
                'zip_code': fake.zipcode(),
                'phone': fake.phone_number(),
                'license_number': generate_license_number(),
                'license_state': fake.state_abbr(),
                'years_in_practice': random.randint(1, 40),
                'is_in_network': random.random() < 0.8,  # 80% in-network
                'fraud_history': has_fraud_history,
                'is_phantom': is_phantom
            }

            providers.append(provider)

        print(f"   ✓ Generated {len(providers):,} providers")
        print(f"     • {sum(1 for p in providers if p['fraud_history'])} with fraud history")
        print(f"     • {sum(1 for p in providers if p['is_phantom'])} phantom providers")

        return providers

    def _generate_pharmacies(self) -> List[Dict]:
        """Generate pharmacy records."""
        pharmacies = []

        chains = ["CVS Pharmacy", "Walgreens", "Rite Aid", "Independent Pharmacy"]

        for i in range(self.num_pharmacies):
            chain_name = random.choice(chains)

            pharmacy = {
                'pharmacy_id': f"PHARM{i:05d}",
                'pharmacy_name': f"{fake.city()} {chain_name}",
                'chain_name': chain_name,
                'address': fake.street_address(),
                'city': fake.city(),
                'state': fake.state_abbr(),
                'zip_code': fake.zipcode(),
                'phone': fake.phone_number(),
                'license_number': f"PHRM{random.randint(100000, 999999)}"
            }

            pharmacies.append(pharmacy)

        print(f"   ✓ Generated {len(pharmacies):,} pharmacies")

        return pharmacies

    def _generate_policies(self) -> List[Dict]:
        """Generate insurance policy records."""
        policies = []

        for i in range(self.num_policies):
            # Assign to random patient
            patient = random.choice(self.patients)

            # Policy dates
            start_date = fake.date_between(start_date='-3y', end_date='today')
            end_date = start_date + timedelta(days=365)  # 1-year policy

            policy = {
                'policy_id': f"POL{i:07d}",
                'patient_id': patient['patient_id'],
                'policy_number': f"{random.randint(100000000, 999999999)}",
                'policy_type': random.choice(POLICY_TYPES),
                'insurance_company': random.choice([
                    "Blue Cross Blue Shield",
                    "UnitedHealthcare",
                    "Aetna",
                    "Cigna",
                    "Humana",
                    "Medicare",
                    "Medicaid"
                ]),
                'coverage_start': start_date.isoformat(),
                'coverage_end': end_date.isoformat(),
                'premium_monthly': round(random.uniform(200, 1500), 2),
                'deductible': random.choice([500, 1000, 2000, 5000, 10000]),
                'out_of_pocket_max': random.choice([5000, 7500, 10000, 15000]),
                'copay': random.choice([10, 20, 30, 50]),
                'status': 'Active' if end_date > datetime.now().date() else 'Expired'
            }

            policies.append(policy)

        print(f"   ✓ Generated {len(policies):,} policies")

        return policies

    def _generate_normal_claims(self, num_claims: int) -> List[Dict]:
        """Generate normal (non-fraudulent) claims."""
        claims = []

        for _ in range(num_claims):
            claim = self._create_normal_claim()
            claims.append(claim)

        print(f"   ✓ Generated {len(claims):,} normal claims")

        return claims

    def _create_normal_claim(self) -> Dict:
        """Create a single normal claim with medically appropriate data."""
        # Select random patient with active policy
        patient = random.choice(self.patients)
        active_policies = [p for p in self.policies if p['patient_id'] == patient['patient_id']
                          and p['status'] == 'Active']

        if not active_policies:
            # Assign a new policy if none exists
            policy = random.choice(self.policies)
        else:
            policy = random.choice(active_policies)

        # Select provider
        provider = random.choice(self.providers)

        # Select appropriate diagnosis and procedure based on provider specialty
        if provider['specialty'] and provider['specialty'] in SPECIALTIES:
            specialty_data = SPECIALTIES[provider['specialty']]
            diagnosis_code = random.choice(specialty_data['common_diagnoses'])
            procedure_code = random.choice(specialty_data['common_procedures'])
        else:
            # Random diagnosis and procedure
            diagnosis_code = random.choice(list(ICD10_CODES.keys()))
            procedure_code = random.choice(list(CPT_CODES.keys()))

        # Generate claim dates
        service_date = fake.date_between(start_date=self.start_date, end_date=self.end_date)
        submission_date = service_date + timedelta(days=random.randint(1, 30))

        # Calculate claim amount based on procedure
        cost_low, cost_high = get_typical_cost(procedure_code)
        claim_amount = round(random.uniform(cost_low, cost_high), 2)
        allowed_amount = round(claim_amount * random.uniform(0.7, 0.95), 2)
        paid_amount = round(allowed_amount * random.uniform(0.8, 1.0), 2)

        claim = {
            'claim_id': f"CLM{random.randint(1000000, 9999999)}",
            'patient_id': patient['patient_id'],
            'policy_id': policy['policy_id'],
            'provider_id': provider['provider_id'],
            'claim_number': f"CN{random.randint(100000000, 999999999)}",
            'submission_date': submission_date.isoformat(),
            'service_date': service_date.isoformat(),
            'diagnosis_code': diagnosis_code,
            'procedure_code': procedure_code,
            'claim_amount': claim_amount,
            'allowed_amount': allowed_amount,
            'paid_amount': paid_amount,
            'patient_responsibility': round(claim_amount - paid_amount, 2),
            'claim_status': random.choice(['Approved', 'Approved', 'Approved', 'Pending', 'Denied']),
            'claim_type': random.choice(['inpatient', 'outpatient', 'pharmacy', 'emergency']),
            'is_fraudulent': False,
            'fraud_type': None
        }

        return claim

    def _generate_fraudulent_claims(self, num_fraud_claims: int) -> List[Dict]:
        """Generate fraudulent claims across all 16 fraud patterns."""
        fraud_claims = []

        # Distribute fraud across all 16 patterns
        fraud_patterns_list = list(FRAUD_PATTERNS.keys())
        claims_per_pattern = num_fraud_claims // len(fraud_patterns_list)

        for pattern_name in fraud_patterns_list:
            pattern_claims = claims_per_pattern
            if pattern_name == fraud_patterns_list[-1]:  # Last pattern gets remainder
                pattern_claims = num_fraud_claims - len(fraud_claims)

            print(f"      • Generating {pattern_claims} {pattern_name} claims...")

            for _ in range(pattern_claims):
                claim = self._generate_fraud_claim(pattern_name)
                if claim:
                    fraud_claims.append(claim)
                    self.fraud_patterns_used[pattern_name] += 1

        print(f"   ✓ Generated {len(fraud_claims):,} fraudulent claims across {len(fraud_patterns_list)} patterns")

        return fraud_claims

    def _generate_fraud_claim(self, pattern_name: str) -> Optional[Dict]:
        """Generate a fraudulent claim based on specific pattern."""
        # Dispatch to specific fraud generation method
        fraud_methods = {
            'upcoding': self._fraud_upcoding,
            'unbundling': self._fraud_unbundling,
            'phantom_billing': self._fraud_phantom_billing,
            'excessive_services': self._fraud_excessive_services,
            'double_billing': self._fraud_double_billing,
            'drg_creep': self._fraud_drg_creep,
            'kickback_scheme': self._fraud_kickback_scheme,
            'service_substitution': self._fraud_service_substitution,
            'credential_misuse': self._fraud_credential_misuse,
            'identity_theft': self._fraud_identity_theft,
            'cloning': self._fraud_cloning,
            'unnecessary_admissions': self._fraud_unnecessary_admissions,
            'ping_ponging': self._fraud_ping_ponging,
            'family_ganging': self._fraud_family_ganging,
            'los_inflation': self._fraud_los_inflation,
            'equipment_fraud': self._fraud_equipment_fraud,
        }

        if pattern_name in fraud_methods:
            return fraud_methods[pattern_name]()
        else:
            # Fallback to generic fraud
            return self._create_normal_claim()

    def _fraud_upcoding(self) -> Dict:
        """Generate upcoding fraud: billing expensive procedure for simple diagnosis."""
        claim = self._create_normal_claim()

        # Replace with simple diagnosis but expensive procedure
        claim['diagnosis_code'] = 'Z00.00'  # Routine checkup
        claim['procedure_code'] = '99285'  # High-complexity emergency visit

        # Inflate cost
        cost_low, cost_high = get_typical_cost(claim['procedure_code'])
        claim['claim_amount'] = round(cost_high * random.uniform(1.2, 1.5), 2)

        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'upcoding'

        return claim

    def _fraud_unbundling(self) -> Dict:
        """Generate unbundling fraud: billing separately for bundled services."""
        claim = self._create_normal_claim()

        # Should bill 45380 (colonoscopy with biopsy) but unbundled to 45378 + 88305
        claim['procedure_code'] = '45378'  # Colonoscopy without biopsy
        claim['diagnosis_code'] = 'K80.20'  # Gallbladder issue

        # Add note about unbundling
        claim['fraud_details'] = "Unbundled from 45380"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'unbundling'

        return claim

    def _fraud_phantom_billing(self) -> Dict:
        """Generate phantom billing: claims for deceased patients."""
        # Select deceased patient
        deceased_patients = [p for p in self.patients if p['is_deceased']]
        if not deceased_patients:
            # Fallback to phantom provider
            return self._create_normal_claim()

        patient = random.choice(deceased_patients)
        claim = self._create_normal_claim()

        # Service date after death
        death_date = datetime.fromisoformat(patient['date_of_death'])
        claim['service_date'] = (death_date + timedelta(days=random.randint(10, 365))).isoformat()
        claim['patient_id'] = patient['patient_id']

        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'phantom_billing'

        return claim

    def _fraud_excessive_services(self) -> Dict:
        """Generate excessive services fraud: unnecessary repeated procedures."""
        claim = self._create_normal_claim()

        # Mark as part of excessive series
        claim['fraud_details'] = f"Part of excessive series ({random.randint(5, 20)} similar claims in 30 days)"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'excessive_services'

        return claim

    def _fraud_double_billing(self) -> Dict:
        """Generate double billing: same service billed multiple times."""
        claim = self._create_normal_claim()

        # Slight variation in amount
        claim['claim_amount'] = round(claim['claim_amount'] * random.uniform(0.95, 1.05), 2)
        claim['fraud_details'] = "Duplicate of another claim with slight variation"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'double_billing'

        return claim

    def _fraud_drg_creep(self) -> Dict:
        """Generate DRG creep: inflated diagnosis codes."""
        claim = self._create_normal_claim()

        # Replace with more severe diagnosis
        claim['diagnosis_code'] = 'I11.0'  # Hypertensive heart disease with heart failure
        # But procedure doesn't match severity
        claim['procedure_code'] = '99213'  # Simple office visit

        claim['fraud_details'] = "Diagnosis inflated for higher reimbursement"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'drg_creep'

        return claim

    def _fraud_kickback_scheme(self) -> Dict:
        """Generate kickback scheme: inappropriate referrals."""
        claim = self._create_normal_claim()

        claim['fraud_details'] = "Part of kickback referral network"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'kickback_scheme'

        return claim

    def _fraud_service_substitution(self) -> Dict:
        """Generate service substitution: billing for different service."""
        claim = self._create_normal_claim()

        # Billed procedure doesn't match diagnosis
        claim['diagnosis_code'] = 'M54.5'  # Back pain
        claim['procedure_code'] = '70450'  # Brain CT scan (inappropriate)

        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'service_substitution'

        return claim

    def _fraud_credential_misuse(self) -> Dict:
        """Generate credential misuse: using another provider's credentials."""
        claim = self._create_normal_claim()

        claim['fraud_details'] = "Provider credentials potentially misused"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'credential_misuse'

        return claim

    def _fraud_identity_theft(self) -> Dict:
        """Generate identity theft: stolen patient information."""
        claim = self._create_normal_claim()

        # Service in distant location
        claim['fraud_details'] = "Service location geographically impossible for patient"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'identity_theft'

        return claim

    def _fraud_cloning(self) -> Dict:
        """Generate cloning: copying treatment from one patient to another."""
        claim = self._create_normal_claim()

        claim['fraud_details'] = "Cloned from another patient's treatment"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'cloning'

        return claim

    def _fraud_unnecessary_admissions(self) -> Dict:
        """Generate unnecessary admissions: admitting patients unnecessarily."""
        claim = self._create_normal_claim()

        # Low severity diagnosis but hospital admission
        claim['diagnosis_code'] = 'Z00.00'  # Routine checkup
        claim['claim_type'] = 'inpatient'
        claim['claim_amount'] = round(random.uniform(5000, 15000), 2)

        claim['fraud_details'] = "Unnecessary hospital admission for outpatient condition"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'unnecessary_admissions'

        return claim

    def _fraud_ping_ponging(self) -> Dict:
        """Generate ping-ponging: unnecessary back-and-forth referrals."""
        claim = self._create_normal_claim()

        claim['fraud_details'] = "Part of ping-pong referral pattern"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'ping_ponging'

        return claim

    def _fraud_family_ganging(self) -> Dict:
        """Generate family ganging: billing all family members."""
        claim = self._create_normal_claim()

        # Select patient with shared address
        shared_address_patients = [
            p for p in self.patients
            if any(p2['address'] == p['address'] and p2['patient_id'] != p['patient_id']
                  for p2 in self.patients)
        ]

        if shared_address_patients:
            patient = random.choice(shared_address_patients)
            claim['patient_id'] = patient['patient_id']

        claim['fraud_details'] = "Billed to multiple family members for single service"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'family_ganging'

        return claim

    def _fraud_los_inflation(self) -> Dict:
        """Generate LOS inflation: extending hospital stays."""
        claim = self._create_normal_claim()

        claim['claim_type'] = 'inpatient'
        claim['claim_amount'] = round(random.uniform(10000, 30000), 2)
        claim['fraud_details'] = "Hospital stay extended beyond medical necessity"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'los_inflation'

        return claim

    def _fraud_equipment_fraud(self) -> Dict:
        """Generate equipment fraud: billing for undelivered equipment."""
        claim = self._create_normal_claim()

        claim['procedure_code'] = '97110'  # Equipment/therapy
        claim['claim_amount'] = round(random.uniform(2000, 8000), 2)
        claim['fraud_details'] = "Medical equipment billed but not delivered"
        claim['is_fraudulent'] = True
        claim['fraud_type'] = 'equipment_fraud'

        return claim

    def _print_statistics(self):
        """Print generation statistics."""
        total_claims = len(self.claims)
        fraud_claims = sum(1 for c in self.claims if c['is_fraudulent'])

        print()
        print("   📊 GENERATION STATISTICS")
        print("   " + "-" * 76)
        print(f"   Total Claims: {total_claims:,}")
        print(f"   Fraudulent Claims: {fraud_claims:,} ({fraud_claims/total_claims*100:.1f}%)")
        print(f"   Normal Claims: {total_claims - fraud_claims:,}")
        print()
        print("   Fraud Patterns Distribution:")
        for pattern, count in sorted(self.fraud_patterns_used.items(), key=lambda x: x[1], reverse=True):
            if count > 0:
                pct = (count / fraud_claims * 100) if fraud_claims > 0 else 0
                print(f"      • {pattern:25s}: {count:5,} ({pct:4.1f}%)")

    def save_to_csv(self, output_dir: str = "data"):
        """Save all generated data to CSV files."""
        os.makedirs(output_dir, exist_ok=True)

        print()
        print(f"💾 Saving data to {output_dir}/...")

        # Save patients
        pd.DataFrame(self.patients).to_csv(f"{output_dir}/patients.csv", index=False)
        print(f"   ✓ patients.csv ({len(self.patients):,} records)")

        # Save providers
        pd.DataFrame(self.providers).to_csv(f"{output_dir}/providers.csv", index=False)
        print(f"   ✓ providers.csv ({len(self.providers):,} records)")

        # Save pharmacies
        pd.DataFrame(self.pharmacies).to_csv(f"{output_dir}/pharmacies.csv", index=False)
        print(f"   ✓ pharmacies.csv ({len(self.pharmacies):,} records)")

        # Save policies
        pd.DataFrame(self.policies).to_csv(f"{output_dir}/policies.csv", index=False)
        print(f"   ✓ policies.csv ({len(self.policies):,} records)")

        # Save claims
        pd.DataFrame(self.claims).to_csv(f"{output_dir}/claims.csv", index=False)
        print(f"   ✓ claims.csv ({len(self.claims):,} records)")

        # Save reference data
        pd.DataFrame(self.diagnoses).to_csv(f"{output_dir}/diagnoses.csv", index=False)
        pd.DataFrame(self.procedures).to_csv(f"{output_dir}/procedures.csv", index=False)
        pd.DataFrame(self.medications).to_csv(f"{output_dir}/medications.csv", index=False)

        print(f"   ✓ diagnoses.csv ({len(self.diagnoses)} records)")
        print(f"   ✓ procedures.csv ({len(self.procedures)} records)")
        print(f"   ✓ medications.csv ({len(self.medications)} records)")

        # Save metadata
        metadata = {
            'generation_date': datetime.now().isoformat(),
            'num_patients': self.num_patients,
            'num_providers': self.num_providers,
            'num_claims': len(self.claims),
            'fraud_rate': self.fraud_rate,
            'fraud_patterns_used': self.fraud_patterns_used
        }

        with open(f"{output_dir}/metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"   ✓ metadata.json")
        print()
        print(f"✅ All data saved to {output_dir}/")


def main():
    """Main entry point for data generation."""
    # Parse command line arguments
    if len(sys.argv) < 3:
        print("Usage: python health_data_generator.py <num_patients> <num_claims> [fraud_rate]")
        print()
        print("Example:")
        print("  python health_data_generator.py 10000 50000 0.15")
        print("  (Generates 10,000 patients, 50,000 claims with 15% fraud rate)")
        sys.exit(1)

    num_patients = int(sys.argv[1])
    num_claims = int(sys.argv[2])
    fraud_rate = float(sys.argv[3]) if len(sys.argv) > 3 else 0.15

    # Create generator
    generator = HealthInsuranceDataGenerator(
        num_patients=num_patients,
        num_claims=num_claims,
        fraud_rate=fraud_rate
    )

    # Generate all data
    generator.generate_all_data()

    # Save to CSV
    generator.save_to_csv()

    print()
    print("=" * 80)
    print("🎉 HEALTH INSURANCE DATA GENERATION COMPLETE!")
    print("=" * 80)
    print()
    print("Next steps:")
    print("1. Load data into Memgraph: python scripts/load_health_dataset.py")
    print("2. Train ML model: python scripts/train_model.py")
    print("3. Start fraud detection: python -m app.main")
    print()


if __name__ == "__main__":
    main()
