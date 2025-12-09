"""
Healthcare provider data generation utilities.
"""
import random
from faker import Faker

fake = Faker()


def generate_npi_number() -> str:
    """
    Generate a fake NPI (National Provider Identifier) number.

    Returns:
        10-digit NPI number as string
    """
    return ''.join([str(random.randint(0, 9)) for _ in range(10)])


def generate_license_number() -> str:
    """
    Generate a fake medical license number.

    Returns:
        License number string
    """
    prefix = random.choice(['MD', 'DO', 'NP', 'PA'])
    number = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    return f"{prefix}{number}"


HOSPITAL_NAMES = [
    "General Hospital",
    "Medical Center",
    "Community Hospital",
    "Regional Medical Center",
    "University Hospital",
    "Memorial Hospital",
    "Children's Hospital",
    "Veterans Hospital",
    "County Hospital",
    "City Medical Center",
]

CLINIC_NAMES = [
    "Family Health Clinic",
    "Urgent Care Center",
    "Walk-In Clinic",
    "Community Health Center",
    "Primary Care Associates",
    "Medical Group",
    "Health Center",
    "Wellness Clinic",
]

PHARMACY_CHAINS = [
    "CVS Pharmacy",
    "Walgreens",
    "Rite Aid",
    "Walmart Pharmacy",
    "Target Pharmacy",
    "Kroger Pharmacy",
    "Independent Pharmacy",
]


def generate_provider_name(provider_type: str) -> str:
    """
    Generate a realistic provider name based on type.

    Args:
        provider_type: Type of provider

    Returns:
        Provider name string
    """
    if "Hospital" in provider_type:
        city = fake.city()
        return f"{city} {random.choice(HOSPITAL_NAMES)}"
    elif "Clinic" in provider_type:
        return f"{fake.city()} {random.choice(CLINIC_NAMES)}"
    elif "Pharmacy" in provider_type:
        chain = random.choice(PHARMACY_CHAINS)
        if chain == "Independent Pharmacy":
            return f"{fake.last_name()}'s Pharmacy"
        return chain
    elif "Physician" in provider_type:
        return f"Dr. {fake.name()}"
    else:
        return f"{fake.company()} {provider_type}"
