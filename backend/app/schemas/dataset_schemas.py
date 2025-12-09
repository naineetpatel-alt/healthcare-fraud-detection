"""
Pydantic schemas for dataset viewing API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class PatientResponse(BaseModel):
    """Patient information."""
    patient_id: str = Field(..., description="Unique patient identifier")
    first_name: str = Field(..., description="Patient first name")
    last_name: str = Field(..., description="Patient last name")
    date_of_birth: str = Field(..., description="Date of birth")
    gender: str = Field(..., description="Patient gender")
    address: str = Field(..., description="Patient address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")
    zip_code: str = Field(..., description="ZIP code")

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "PAT000123",
                "first_name": "John",
                "last_name": "Doe",
                "date_of_birth": "1985-03-15",
                "gender": "M",
                "address": "123 Main St",
                "city": "Boston",
                "state": "MA",
                "zip_code": "02101"
            }
        }


class ProviderResponse(BaseModel):
    """Healthcare provider information."""
    provider_id: str = Field(..., description="Unique provider identifier")
    provider_name: str = Field(..., description="Provider name")
    provider_type: str = Field(..., description="Provider type")
    specialty: str = Field(..., description="Medical specialty")
    license_number: str = Field(..., description="License number")
    license_state: str = Field(..., description="License state")
    address: str = Field(..., description="Provider address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")
    zip_code: str = Field(..., description="ZIP code")
    phone: str = Field(..., description="Phone number")
    years_in_practice: int = Field(..., description="Years in practice")
    is_in_network: bool = Field(..., description="Whether provider is in network")

    class Config:
        json_schema_extra = {
            "example": {
                "provider_id": "PRV000456",
                "provider_name": "Dr. Jane Smith MD",
                "provider_type": "Individual",
                "specialty": "Cardiology",
                "license_number": "MA-12345",
                "license_state": "MA",
                "address": "456 Medical Center Dr",
                "city": "Boston",
                "state": "MA",
                "zip_code": "02115",
                "phone": "(555) 123-4567",
                "years_in_practice": 15,
                "is_in_network": True
            }
        }


class ClaimResponse(BaseModel):
    """Health insurance claim information."""
    claim_id: str = Field(..., description="Unique claim identifier")
    patient_id: str = Field(..., description="Patient ID")
    provider_id: str = Field(..., description="Provider ID")
    policy_id: str = Field(..., description="Policy ID")
    claim_number: str = Field(..., description="Claim number")
    submission_date: str = Field(..., description="Date claim was submitted")
    service_date: str = Field(..., description="Date of service")
    diagnosis_code: str = Field(..., description="ICD-10 diagnosis code")
    procedure_code: str = Field(..., description="CPT procedure code")
    claim_amount: float = Field(..., description="Claim amount")
    allowed_amount: float = Field(..., description="Allowed amount")
    paid_amount: float = Field(..., description="Paid amount")
    patient_responsibility: float = Field(..., description="Patient responsibility")
    claim_status: str = Field(..., description="Claim status")
    claim_type: str = Field(..., description="Type of claim")
    is_fraudulent: bool = Field(..., description="Whether claim is fraudulent")
    fraud_type: Optional[str] = Field(None, description="Type of fraud if applicable")

    class Config:
        json_schema_extra = {
            "example": {
                "claim_id": "CLM123456",
                "patient_id": "PAT000123",
                "provider_id": "PRV000456",
                "policy_id": "POL000789",
                "claim_number": "CN123456789",
                "submission_date": "2024-01-15",
                "service_date": "2024-01-10",
                "diagnosis_code": "I10",
                "procedure_code": "99213",
                "claim_amount": 250.00,
                "allowed_amount": 200.00,
                "paid_amount": 180.00,
                "patient_responsibility": 50.00,
                "claim_status": "Approved",
                "claim_type": "outpatient",
                "is_fraudulent": False,
                "fraud_type": None
            }
        }


class PaginatedPatientsResponse(BaseModel):
    """Paginated list of patients."""
    total: int = Field(..., description="Total number of patients")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    patients: List[PatientResponse] = Field(..., description="List of patients")


class PaginatedProvidersResponse(BaseModel):
    """Paginated list of providers."""
    total: int = Field(..., description="Total number of providers")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    providers: List[ProviderResponse] = Field(..., description="List of providers")


class PaginatedClaimsResponse(BaseModel):
    """Paginated list of claims."""
    total: int = Field(..., description="Total number of claims")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    claims: List[ClaimResponse] = Field(..., description="List of claims")


class DatasetStatsResponse(BaseModel):
    """Dataset statistics."""
    total_patients: int = Field(..., description="Total number of patients")
    total_providers: int = Field(..., description="Total number of providers")
    total_claims: int = Field(..., description="Total number of claims")
    total_fraudulent_claims: int = Field(..., description="Number of fraudulent claims")
    fraud_rate: float = Field(..., description="Fraud rate (0-1)")
    total_claim_amount: float = Field(..., description="Total claim amount")
    fraud_amount: float = Field(..., description="Total fraudulent claim amount")

    class Config:
        json_schema_extra = {
            "example": {
                "total_patients": 1000,
                "total_providers": 100,
                "total_claims": 5000,
                "total_fraudulent_claims": 750,
                "fraud_rate": 0.15,
                "total_claim_amount": 2500000.00,
                "fraud_amount": 375000.00
            }
        }


class CSVFieldSchema(BaseModel):
    """Schema for a single CSV field."""
    field_name: str = Field(..., description="Column name")
    data_type: str = Field(..., description="Expected data type")
    required: bool = Field(..., description="Whether field is required")
    description: str = Field(..., description="Field description")
    example: str = Field(..., description="Example value")


class DatasetSchemaResponse(BaseModel):
    """Dataset CSV schema documentation."""
    patients: List[CSVFieldSchema] = Field(..., description="Patient CSV schema")
    providers: List[CSVFieldSchema] = Field(..., description="Provider CSV schema")
    claims: List[CSVFieldSchema] = Field(..., description="Claims CSV schema")
    policies: List[CSVFieldSchema] = Field(..., description="Policies CSV schema")
    diagnoses: List[CSVFieldSchema] = Field(..., description="Diagnoses CSV schema")
    procedures: List[CSVFieldSchema] = Field(..., description="Procedures CSV schema")
    medications: List[CSVFieldSchema] = Field(..., description="Medications CSV schema")
    pharmacies: List[CSVFieldSchema] = Field(..., description="Pharmacies CSV schema")


class UploadResponse(BaseModel):
    """Response after dataset upload."""
    success: bool = Field(..., description="Whether upload was successful")
    message: str = Field(..., description="Status message")
    files_uploaded: List[str] = Field(..., description="List of uploaded files")
    total_patients: int = Field(0, description="Total patients loaded")
    total_providers: int = Field(0, description="Total providers loaded")
    total_claims: int = Field(0, description="Total claims loaded")


class SampleLoadResponse(BaseModel):
    """Response after loading sample dataset."""
    success: bool = Field(..., description="Whether sample was loaded successfully")
    message: str = Field(..., description="Status message")
    total_patients: int = Field(..., description="Total patients in sample")
    total_providers: int = Field(..., description="Total providers in sample")
    total_claims: int = Field(..., description="Total claims in sample")
