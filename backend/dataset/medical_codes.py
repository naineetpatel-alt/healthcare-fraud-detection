"""
Medical reference data including ICD-10 diagnosis codes, CPT procedure codes,
NDC medication codes, and medical specialties.
"""

# ICD-10 Diagnosis Codes (International Classification of Diseases, 10th Revision)
ICD10_CODES = {
    # Diabetes
    "E11.9": {"name": "Type 2 diabetes mellitus without complications", "severity": "Chronic", "category": "Endocrine"},
    "E11.65": {"name": "Type 2 diabetes mellitus with hyperglycemia", "severity": "Moderate", "category": "Endocrine"},
    "E10.9": {"name": "Type 1 diabetes mellitus without complications", "severity": "Chronic", "category": "Endocrine"},

    # Hypertension
    "I10": {"name": "Essential (primary) hypertension", "severity": "Chronic", "category": "Cardiovascular"},
    "I11.0": {"name": "Hypertensive heart disease with heart failure", "severity": "Severe", "category": "Cardiovascular"},

    # Respiratory
    "J44.9": {"name": "Chronic obstructive pulmonary disease, unspecified", "severity": "Moderate", "category": "Respiratory"},
    "J45.909": {"name": "Unspecified asthma, uncomplicated", "severity": "Mild", "category": "Respiratory"},
    "J18.9": {"name": "Pneumonia, unspecified organism", "severity": "Moderate", "category": "Respiratory"},

    # Pain
    "M54.5": {"name": "Low back pain", "severity": "Mild", "category": "Musculoskeletal"},
    "M25.511": {"name": "Pain in right shoulder", "severity": "Mild", "category": "Musculoskeletal"},
    "R51": {"name": "Headache", "severity": "Mild", "category": "Symptoms"},

    # Cardiovascular
    "I21.9": {"name": "Acute myocardial infarction, unspecified", "severity": "Severe", "category": "Cardiovascular"},
    "I50.9": {"name": "Heart failure, unspecified", "severity": "Severe", "category": "Cardiovascular"},
    "I63.9": {"name": "Cerebral infarction, unspecified", "severity": "Severe", "category": "Cardiovascular"},

    # Cancer
    "C50.911": {"name": "Malignant neoplasm of unspecified site of right female breast", "severity": "Severe", "category": "Oncology"},
    "C34.90": {"name": "Malignant neoplasm of unspecified part of unspecified bronchus or lung", "severity": "Severe", "category": "Oncology"},

    # Mental Health
    "F32.9": {"name": "Major depressive disorder, single episode, unspecified", "severity": "Moderate", "category": "Mental Health"},
    "F41.9": {"name": "Anxiety disorder, unspecified", "severity": "Mild", "category": "Mental Health"},

    # Routine Care
    "Z00.00": {"name": "Encounter for general adult medical examination without abnormal findings", "severity": "Preventive", "category": "Routine"},
    "Z23": {"name": "Encounter for immunization", "severity": "Preventive", "category": "Routine"},

    # Injuries
    "S82.001A": {"name": "Unspecified fracture of right patella, initial encounter", "severity": "Moderate", "category": "Injury"},
    "S06.0X0A": {"name": "Concussion without loss of consciousness, initial encounter", "severity": "Moderate", "category": "Injury"},

    # Digestive
    "K21.9": {"name": "Gastro-esophageal reflux disease without esophagitis", "severity": "Mild", "category": "Digestive"},
    "K80.20": {"name": "Calculus of gallbladder without cholecystitis", "severity": "Moderate", "category": "Digestive"},
}

# CPT Codes (Current Procedural Terminology)
CPT_CODES = {
    # Office Visits
    "99213": {"name": "Office visit, established patient, low to moderate complexity", "cost_low": 75, "cost_high": 150, "complexity": 2, "category": "Evaluation"},
    "99214": {"name": "Office visit, established patient, moderate to high complexity", "cost_low": 120, "cost_high": 250, "complexity": 3, "category": "Evaluation"},
    "99215": {"name": "Office visit, established patient, high complexity", "cost_low": 180, "cost_high": 350, "complexity": 4, "category": "Evaluation"},
    "99203": {"name": "Office visit, new patient, low to moderate complexity", "cost_low": 100, "cost_high": 200, "complexity": 2, "category": "Evaluation"},
    "99204": {"name": "Office visit, new patient, moderate to high complexity", "cost_low": 150, "cost_high": 300, "complexity": 3, "category": "Evaluation"},

    # Emergency
    "99281": {"name": "Emergency department visit, low complexity", "cost_low": 150, "cost_high": 300, "complexity": 2, "category": "Emergency"},
    "99283": {"name": "Emergency department visit, moderate complexity", "cost_low": 300, "cost_high": 600, "complexity": 3, "category": "Emergency"},
    "99285": {"name": "Emergency department visit, high complexity", "cost_low": 800, "cost_high": 2000, "complexity": 5, "category": "Emergency"},

    # Diagnostic Tests
    "70450": {"name": "CT scan, head/brain, without contrast", "cost_low": 400, "cost_high": 1200, "complexity": 3, "category": "Radiology"},
    "70553": {"name": "MRI brain with and without contrast", "cost_low": 800, "cost_high": 2500, "complexity": 4, "category": "Radiology"},
    "93000": {"name": "Electrocardiogram (EKG), complete", "cost_low": 50, "cost_high": 150, "complexity": 1, "category": "Diagnostic"},
    "93015": {"name": "Cardiovascular stress test", "cost_low": 200, "cost_high": 500, "complexity": 3, "category": "Diagnostic"},

    # Laboratory
    "80053": {"name": "Comprehensive metabolic panel", "cost_low": 30, "cost_high": 100, "complexity": 1, "category": "Laboratory"},
    "85025": {"name": "Complete blood count with differential", "cost_low": 20, "cost_high": 60, "complexity": 1, "category": "Laboratory"},

    # Surgeries
    "29881": {"name": "Arthroscopy, knee, surgical", "cost_low": 2000, "cost_high": 5000, "complexity": 4, "category": "Surgery"},
    "47562": {"name": "Laparoscopic cholecystectomy", "cost_low": 5000, "cost_high": 15000, "complexity": 5, "category": "Surgery"},
    "27447": {"name": "Total knee arthroplasty", "cost_low": 15000, "cost_high": 45000, "complexity": 5, "category": "Surgery"},

    # Physical Therapy
    "97110": {"name": "Therapeutic exercises", "cost_low": 50, "cost_high": 150, "complexity": 1, "category": "Therapy"},
    "97140": {"name": "Manual therapy techniques", "cost_low": 60, "cost_high": 180, "complexity": 2, "category": "Therapy"},

    # Injections
    "20610": {"name": "Arthrocentesis, major joint", "cost_low": 150, "cost_high": 400, "complexity": 2, "category": "Procedure"},
    "96372": {"name": "Therapeutic injection, subcutaneous or intramuscular", "cost_low": 25, "cost_high": 75, "complexity": 1, "category": "Procedure"},

    # Colonoscopy
    "45378": {"name": "Colonoscopy, diagnostic", "cost_low": 800, "cost_high": 3000, "complexity": 4, "category": "Procedure"},
    "45380": {"name": "Colonoscopy with biopsy", "cost_low": 1000, "cost_high": 3500, "complexity": 4, "category": "Procedure"},
}

# NDC Codes (National Drug Code) for medications
NDC_CODES = {
    # Diabetes medications
    "00002-7510-01": {"name": "Metformin 500mg", "generic": True, "cost": 15, "controlled": False, "class": "Antidiabetic"},
    "00002-8215-01": {"name": "Insulin Glargine", "generic": False, "cost": 300, "controlled": False, "class": "Insulin"},

    # Cardiovascular
    "00071-0157-23": {"name": "Lisinopril 10mg", "generic": True, "cost": 10, "controlled": False, "class": "ACE Inhibitor"},
    "00071-0222-23": {"name": "Atorvastatin 20mg", "generic": True, "cost": 12, "controlled": False, "class": "Statin"},

    # Pain medication (controlled)
    "00054-0093-13": {"name": "Oxycodone 5mg", "generic": True, "cost": 45, "controlled": True, "class": "Opioid"},
    "00406-0489-01": {"name": "Hydrocodone-Acetaminophen 5-325mg", "generic": True, "cost": 40, "controlled": True, "class": "Opioid"},

    # Antibiotics
    "00093-2264-01": {"name": "Amoxicillin 500mg", "generic": True, "cost": 20, "controlled": False, "class": "Antibiotic"},
    "50090-3067-00": {"name": "Azithromycin 250mg", "generic": True, "cost": 25, "controlled": False, "class": "Antibiotic"},

    # Asthma/COPD
    "00173-0682-20": {"name": "Albuterol Inhaler", "generic": True, "cost": 35, "controlled": False, "class": "Bronchodilator"},
    "00054-3188-58": {"name": "Fluticasone Inhaler", "generic": False, "cost": 150, "controlled": False, "class": "Corticosteroid"},

    # Mental Health
    "00093-7169-56": {"name": "Sertraline 50mg", "generic": True, "cost": 15, "controlled": False, "class": "SSRI"},
    "00378-1805-93": {"name": "Alprazolam 0.5mg", "generic": True, "cost": 20, "controlled": True, "class": "Benzodiazepine"},
}

# Medical Specialties with typical procedures
SPECIALTIES = {
    "Family Medicine": {
        "common_diagnoses": ["I10", "E11.9", "M54.5", "Z00.00", "J45.909"],
        "common_procedures": ["99213", "99214", "85025", "80053"],
        "avg_claim_amount": 150,
    },
    "Cardiology": {
        "common_diagnoses": ["I10", "I50.9", "I21.9", "I63.9"],
        "common_procedures": ["93000", "93015", "99214", "99215"],
        "avg_claim_amount": 400,
    },
    "Orthopedic Surgery": {
        "common_diagnoses": ["M54.5", "M25.511", "S82.001A"],
        "common_procedures": ["29881", "27447", "20610", "99214"],
        "avg_claim_amount": 1200,
    },
    "Emergency Medicine": {
        "common_diagnoses": ["S06.0X0A", "S82.001A", "J18.9", "I21.9"],
        "common_procedures": ["99283", "99285", "70450", "99281"],
        "avg_claim_amount": 800,
    },
    "Radiology": {
        "common_diagnoses": ["M54.5", "R51", "S06.0X0A"],
        "common_procedures": ["70450", "70553"],
        "avg_claim_amount": 600,
    },
    "Internal Medicine": {
        "common_diagnoses": ["I10", "E11.9", "F32.9", "K21.9"],
        "common_procedures": ["99214", "99215", "85025", "80053"],
        "avg_claim_amount": 200,
    },
    "Oncology": {
        "common_diagnoses": ["C50.911", "C34.90"],
        "common_procedures": ["99215", "96372", "70553"],
        "avg_claim_amount": 2000,
    },
    "Physical Therapy": {
        "common_diagnoses": ["M54.5", "M25.511", "S82.001A"],
        "common_procedures": ["97110", "97140"],
        "avg_claim_amount": 120,
    },
}

# Provider types
PROVIDER_TYPES = [
    "Hospital - General Acute Care",
    "Hospital - Specialty",
    "Physician - Primary Care",
    "Physician - Specialist",
    "Clinic - Urgent Care",
    "Clinic - Outpatient",
    "Pharmacy - Retail",
    "Laboratory",
    "Imaging Center",
    "Physical Therapy Center",
]

# Health insurance policy types
POLICY_TYPES = [
    "HMO",  # Health Maintenance Organization
    "PPO",  # Preferred Provider Organization
    "EPO",  # Exclusive Provider Organization
    "POS",  # Point of Service
    "Medicare",
    "Medicaid",
]

# Fraud patterns for detection
FRAUD_PATTERNS = {
    # Original 4 patterns
    "upcoding": {
        "description": "Billing for more expensive services than provided",
        "example": [
            {"diagnosis": "Z00.00", "billed_procedure": "99215", "appropriate_procedure": "99213"},
            {"diagnosis": "M54.5", "billed_procedure": "99285", "appropriate_procedure": "99213"},
        ],
        "severity": "high",
        "avg_loss": 2500,
        "detection_difficulty": "medium"
    },
    "unbundling": {
        "description": "Billing separately for services that should be bundled",
        "example": [
            {"bundled_code": "45380", "unbundled_codes": ["45378", "88305"]},
        ],
        "severity": "high",
        "avg_loss": 1800,
        "detection_difficulty": "medium"
    },
    "phantom_billing": {
        "description": "Billing for services never rendered",
        "indicators": ["patient_deceased", "no_provider_relationship", "impossible_date"],
        "severity": "critical",
        "avg_loss": 4000,
        "detection_difficulty": "easy"
    },
    "excessive_services": {
        "description": "Performing unnecessary procedures",
        "indicators": ["frequency_too_high", "not_medically_necessary", "duplicate_tests"],
        "severity": "high",
        "avg_loss": 3000,
        "detection_difficulty": "hard"
    },

    # NEW: 12 Additional Patterns (2025 Research-Based)
    "double_billing": {
        "description": "Billing multiple times for the same service",
        "indicators": ["duplicate_claims", "same_date", "same_procedure", "slight_variations"],
        "severity": "high",
        "avg_loss": 1500,
        "detection_difficulty": "easy",
        "graph_pattern": None
    },

    "drg_creep": {
        "description": "Manipulating diagnostic codes for higher DRG reimbursement",
        "indicators": ["diagnosis_inflation", "upcoded_drg", "complication_added", "severity_exaggerated"],
        "severity": "high",
        "avg_loss": 3000,
        "detection_difficulty": "medium",
        "graph_pattern": None
    },

    "kickback_scheme": {
        "description": "Illegal referral arrangements between providers for financial gain",
        "indicators": ["circular_referrals", "excessive_referrals", "same_network", "financial_relationships"],
        "severity": "critical",
        "avg_loss": 10000,
        "detection_difficulty": "hard",
        "graph_pattern": "provider_rings"
    },

    "service_substitution": {
        "description": "Billing for different service than actually provided",
        "indicators": ["procedure_mismatch", "diagnosis_incompatible", "equipment_mismatch"],
        "severity": "medium",
        "avg_loss": 800,
        "detection_difficulty": "medium",
        "graph_pattern": None
    },

    "credential_misuse": {
        "description": "Using another provider's credentials to bill services",
        "indicators": ["impossible_locations", "specialty_mismatch", "concurrent_claims", "geographic_impossibility"],
        "severity": "critical",
        "avg_loss": 5000,
        "detection_difficulty": "medium",
        "graph_pattern": None
    },

    "identity_theft": {
        "description": "Using stolen patient information for fraudulent claims",
        "indicators": ["geographic_impossibility", "age_mismatch", "duplicate_identity", "inconsistent_history"],
        "severity": "critical",
        "avg_loss": 4000,
        "detection_difficulty": "medium",
        "graph_pattern": "identity_clusters"
    },

    "cloning": {
        "description": "Using treatment information from one patient for another",
        "indicators": ["identical_claims", "different_patients", "same_dates", "same_diagnosis_procedures"],
        "severity": "high",
        "avg_loss": 2000,
        "detection_difficulty": "easy",
        "graph_pattern": None
    },

    "unnecessary_admissions": {
        "description": "Admitting patients who don't require hospitalization",
        "indicators": ["low_severity_diagnosis", "short_stay", "outpatient_appropriate", "immediate_discharge"],
        "severity": "high",
        "avg_loss": 8000,
        "detection_difficulty": "hard",
        "graph_pattern": None
    },

    "ping_ponging": {
        "description": "Referring patients back and forth between providers unnecessarily",
        "indicators": ["reciprocal_referrals", "same_diagnosis", "frequent_visits", "no_improvement"],
        "severity": "medium",
        "avg_loss": 1200,
        "detection_difficulty": "medium",
        "graph_pattern": "bidirectional_referrals"
    },

    "family_ganging": {
        "description": "Billing all family members for service only one received",
        "indicators": ["same_address", "same_date", "identical_procedures", "household_cluster"],
        "severity": "medium",
        "avg_loss": 600,
        "detection_difficulty": "easy",
        "graph_pattern": "shared_address_cluster"
    },

    "los_inflation": {
        "description": "Keeping patients hospitalized longer than medically necessary",
        "indicators": ["extended_stay", "low_acuity", "normal_vital_signs", "discharge_delays"],
        "severity": "high",
        "avg_loss": 5000,
        "detection_difficulty": "hard",
        "graph_pattern": None
    },

    "equipment_fraud": {
        "description": "Billing for medical equipment never delivered or not needed",
        "indicators": ["no_delivery_proof", "equipment_not_needed", "phantom_supplier", "excessive_quantity"],
        "severity": "high",
        "avg_loss": 3500,
        "detection_difficulty": "medium",
        "graph_pattern": "supplier_networks"
    },
}

# Diagnosis-Procedure appropriateness mappings
APPROPRIATE_COMBINATIONS = {
    # Diabetes
    "E11.9": ["99213", "99214", "80053", "85025"],
    "E11.65": ["99214", "99215", "80053", "85025"],

    # Hypertension
    "I10": ["99213", "99214", "93000", "80053"],

    # Back pain
    "M54.5": ["99213", "99214", "97110", "97140", "20610"],

    # Heart attack
    "I21.9": ["99285", "99215", "93000", "93015", "70450"],

    # Routine checkup
    "Z00.00": ["99213", "99203", "80053", "85025"],
}


def is_appropriate_combination(diagnosis_code: str, procedure_code: str) -> bool:
    """
    Check if a diagnosis-procedure combination is medically appropriate.

    Args:
        diagnosis_code: ICD-10 diagnosis code
        procedure_code: CPT procedure code

    Returns:
        True if combination is appropriate, False otherwise
    """
    if diagnosis_code in APPROPRIATE_COMBINATIONS:
        return procedure_code in APPROPRIATE_COMBINATIONS[diagnosis_code]
    return True  # Unknown combinations default to appropriate


def get_typical_cost(procedure_code: str) -> tuple:
    """
    Get the typical cost range for a procedure.

    Args:
        procedure_code: CPT procedure code

    Returns:
        Tuple of (low, high) cost range, or (0, 0) if not found
    """
    if procedure_code in CPT_CODES:
        return (CPT_CODES[procedure_code]["cost_low"], CPT_CODES[procedure_code]["cost_high"])
    return (0, 0)
