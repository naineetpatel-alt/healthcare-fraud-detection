# Adding New Fraud Patterns - Developer Guide

## Overview
Our architecture makes adding new fraud patterns straightforward through a modular design. Here's how:

## Architecture Benefits

### 1. **Declarative Pattern Definitions**
All fraud patterns are defined in `backend/dataset/medical_codes.py` as simple Python dictionaries:

```python
FRAUD_PATTERNS = {
    "pattern_name": {
        "description": "What the fraud is",
        "indicators": ["list", "of", "detection", "signals"],
        "example": [...]  # Optional examples
    }
}
```

### 2. **Separation of Concerns**
- **Pattern Definitions** → `medical_codes.py`
- **Pattern Generation** → `health_data_generator.py`
- **Pattern Detection** → ML model features (`feature_extraction.py`)
- **Pattern Visualization** → Frontend components

### 3. **Graph-Based Detection**
Our Memgraph database naturally supports complex fraud patterns through:
- **Node relationships** (provider networks, patient connections)
- **Graph algorithms** (community detection for fraud rings)
- **Path analysis** (tracing claim relationships)

## How to Add a New Fraud Pattern (5 Steps)

### Step 1: Define Pattern in `medical_codes.py`

```python
FRAUD_PATTERNS = {
    # Existing patterns...

    # NEW PATTERN:
    "double_billing": {
        "description": "Billing multiple times for the same service",
        "indicators": [
            "duplicate_claim_same_date",
            "same_procedure_same_patient",
            "slight_variations_in_claim_details"
        ],
        "detection_methods": [
            "claim_date_proximity",
            "procedure_code_matching",
            "claim_amount_similarity"
        ],
        "severity": "high",  # low, medium, high, critical
        "typical_loss_per_incident": 1500.00
    }
}
```

### Step 2: Add Detection Logic (if needed)

For simple patterns, no code changes needed! The ML model will automatically detect based on features.

For complex patterns, add helper functions:

```python
def detect_double_billing(claims_df):
    """Detect potential double billing patterns."""
    # Group by patient, provider, procedure, date
    duplicates = claims_df.groupby([
        'patient_id',
        'provider_id',
        'procedure_code',
        'service_date'
    ]).size()

    return duplicates[duplicates > 1].index.tolist()
```

### Step 3: Add Pattern Generation in Data Generator

```python
def _generate_double_billing_fraud(self, patient, provider):
    """Generate a double billing fraud scenario."""
    # Create first claim
    claim_1 = self._create_normal_claim(patient, provider)

    # Create duplicate with slight variation
    claim_2 = claim_1.copy()
    claim_2['claim_id'] = f"CLM{random.randint(1000000, 9999999)}"
    claim_2['submission_date'] = claim_1['submission_date'] + timedelta(days=random.randint(1, 7))
    claim_2['claim_amount'] = claim_1['claim_amount'] * random.uniform(0.95, 1.05)  # Slight variation

    claim_1['is_fraudulent'] = True
    claim_1['fraud_type'] = 'double_billing'
    claim_2['is_fraudulent'] = True
    claim_2['fraud_type'] = 'double_billing'

    return [claim_1, claim_2]
```

### Step 4: Add ML Features (Optional)

Add graph-based features for detection:

```python
# In feature_extraction.py
def extract_double_billing_features(claim_id):
    """Extract features for detecting double billing."""
    query = """
    MATCH (c:CLAIM {claim_id: $claim_id})-[:SUBMITTED_BY]->(p:PATIENT)
    MATCH (c)-[:FILED_BY]->(prov:PROVIDER)
    MATCH (c)-[:INCLUDES_PROCEDURE]->(proc:PROCEDURE)

    // Find similar claims
    MATCH (other:CLAIM)-[:SUBMITTED_BY]->(p)
    MATCH (other)-[:FILED_BY]->(prov)
    MATCH (other)-[:INCLUDES_PROCEDURE]->(proc)
    WHERE other.claim_id <> c.claim_id
      AND abs(duration.between(c.service_date, other.service_date).days) <= 30

    RETURN
        count(other) as similar_claims_count,
        avg(other.claim_amount) as avg_similar_claim_amount,
        min(abs(duration.between(c.service_date, other.service_date).days)) as min_days_between
    """
    return execute_query(query, {'claim_id': claim_id})
```

### Step 5: Update Frontend Display

Add pattern to frontend fraud type labels:

```typescript
// In frontend/src/types/fraud.ts
export const FRAUD_TYPES = {
  upcoding: { label: 'Upcoding', color: 'red', icon: 'TrendingUp' },
  unbundling: { label: 'Unbundling', color: 'orange', icon: 'Split' },
  phantom_billing: { label: 'Phantom Billing', color: 'purple', icon: 'Ghost' },
  excessive_services: { label: 'Excessive Services', color: 'yellow', icon: 'Repeat' },
  double_billing: { label: 'Double Billing', color: 'pink', icon: 'Copy' },  // NEW!
};
```

## Example: Adding 12 New Patterns

Here's the complete code to add all 12 new patterns:

```python
# Add to FRAUD_PATTERNS in medical_codes.py

FRAUD_PATTERNS = {
    # ... existing patterns ...

    "double_billing": {
        "description": "Billing multiple times for the same service",
        "indicators": ["duplicate_claims", "same_date", "same_procedure"],
        "severity": "high",
        "avg_loss": 1500
    },

    "drg_creep": {
        "description": "Manipulating diagnostic codes for higher reimbursement",
        "indicators": ["diagnosis_inflation", "upcoded_drg", "complication_added"],
        "severity": "high",
        "avg_loss": 3000
    },

    "kickback_scheme": {
        "description": "Illegal referral arrangements between providers",
        "indicators": ["circular_referrals", "excessive_referrals", "same_network"],
        "severity": "critical",
        "avg_loss": 10000,
        "graph_pattern": "provider_rings"
    },

    "service_substitution": {
        "description": "Billing for different service than provided",
        "indicators": ["procedure_mismatch", "diagnosis_incompatible"],
        "severity": "medium",
        "avg_loss": 800
    },

    "credential_misuse": {
        "description": "Using another provider's credentials",
        "indicators": ["impossible_locations", "specialty_mismatch", "concurrent_claims"],
        "severity": "critical",
        "avg_loss": 5000
    },

    "identity_theft": {
        "description": "Using stolen patient information",
        "indicators": ["geographic_impossibility", "age_mismatch", "duplicate_identity"],
        "severity": "critical",
        "avg_loss": 4000
    },

    "cloning": {
        "description": "Using treatment info from one patient for another",
        "indicators": ["identical_claims", "different_patients", "same_dates"],
        "severity": "high",
        "avg_loss": 2000
    },

    "unnecessary_admissions": {
        "description": "Admitting patients who don't need hospitalization",
        "indicators": ["low_severity_diagnosis", "short_stay", "outpatient_appropriate"],
        "severity": "high",
        "avg_loss": 8000
    },

    "ping_ponging": {
        "description": "Referring patients back and forth unnecessarily",
        "indicators": ["reciprocal_referrals", "same_diagnosis", "frequent_visits"],
        "severity": "medium",
        "avg_loss": 1200,
        "graph_pattern": "bidirectional_referrals"
    },

    "family_ganging": {
        "description": "Billing all family members for service only one received",
        "indicators": ["same_address", "same_date", "identical_procedures"],
        "severity": "medium",
        "avg_loss": 600,
        "graph_pattern": "shared_address_cluster"
    },

    "los_inflation": {
        "description": "Keeping patients longer than medically necessary",
        "indicators": ["extended_stay", "low_acuity", "normal_vital_signs"],
        "severity": "high",
        "avg_loss": 5000
    },

    "equipment_fraud": {
        "description": "Billing for medical equipment never delivered",
        "indicators": ["no_delivery_proof", "equipment_not_needed", "phantom_supplier"],
        "severity": "high",
        "avg_loss": 3500
    }
}
```

## Pattern Complexity Levels

### Level 1: Simple Patterns (No Graph Needed)
- Double Billing
- Service Substitution
- Cloning

**Implementation:** Just add to `FRAUD_PATTERNS` and data generator

### Level 2: Relationship-Based (Basic Graph)
- Family Ganging
- Ping-Ponging
- Identity Theft

**Implementation:** Use graph edges (SHARES_ADDRESS, REFERRED_TO)

### Level 3: Network-Based (Advanced Graph)
- Kickback Schemes
- Provider Fraud Rings
- Organized Crime Networks

**Implementation:** Use graph algorithms (PageRank, Community Detection)

## Benefits of Our Approach

✅ **No Code Refactoring** - Add patterns without touching existing code
✅ **Automatic ML Integration** - Patterns become features automatically
✅ **Graph-Ready** - Complex patterns leverage Memgraph relationships
✅ **Type-Safe** - TypeScript ensures frontend consistency
✅ **Scalable** - Add 100 patterns without performance impact
✅ **Testable** - Each pattern can be unit tested independently

## Quick Test: Add a Pattern in 5 Minutes

1. Open `medical_codes.py`
2. Add pattern to `FRAUD_PATTERNS` dict (2 min)
3. Run data generator (1 min)
4. View in frontend dashboard (2 min)

Done! 🎉

## Advanced: Pattern Combinations

You can even detect **combined fraud patterns**:

```python
COMBINED_FRAUD_PATTERNS = {
    "organized_scheme": {
        "description": "Multiple fraud types in coordinated attack",
        "components": ["upcoding", "kickback_scheme", "phantom_billing"],
        "severity": "critical",
        "graph_signature": "dense_provider_cluster_with_high_fraud_rate"
    }
}
```

## Resources

- [FBI Health Care Fraud](https://www.fbi.gov/investigate/white-collar-crime/health-care-fraud)
- [NHCAA Fraud Statistics](https://www.nhcaa.org/tools-insights/about-health-care-fraud/the-challenge-of-health-care-fraud/)
- [Justice Department Fraud Takedown 2025](https://www.justice.gov/opa/pr/national-health-care-fraud-takedown-results-324-defendants-charged-connection-over-146)
- [Healthcare Fraud Detection Research](https://pmc.ncbi.nlm.nih.gov/articles/PMC11831774/)

---

**Bottom Line:** Our architecture is designed for extensibility. Adding patterns is as simple as adding a dictionary entry! 🚀
