"""
Dataset viewing API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from typing import Optional, List
from app.schemas.dataset_schemas import (
    PaginatedPatientsResponse,
    PaginatedProvidersResponse,
    PaginatedClaimsResponse,
    PatientResponse,
    ProviderResponse,
    ClaimResponse,
    DatasetStatsResponse,
    DatasetSchemaResponse,
    CSVFieldSchema,
    UploadResponse,
    SampleLoadResponse
)
from app.db.memgraph_db import get_data_loader
from app.dependencies import get_current_user
from app.models.auth_models import User
import pandas as pd
import os
import shutil
import zipfile
from io import BytesIO


router = APIRouter()


@router.get("/stats", response_model=DatasetStatsResponse, status_code=status.HTTP_200_OK)
def get_dataset_statistics(current_user: User = Depends(get_current_user)):
    """
    Get overall dataset statistics.

    Returns statistics including:
    - Total patients, providers, claims
    - Fraud rate and amounts
    - Dataset summary metrics
    """
    try:
        data_loader = get_data_loader()

        total_patients = len(data_loader.patients_df)
        total_providers = len(data_loader.providers_df)
        total_claims = len(data_loader.claims_df)

        fraudulent_claims = data_loader.claims_df['is_fraudulent'].sum()
        fraud_rate = fraudulent_claims / total_claims if total_claims > 0 else 0

        total_claim_amount = data_loader.claims_df['claim_amount'].sum()
        fraud_amount = data_loader.claims_df[data_loader.claims_df['is_fraudulent'] == True]['claim_amount'].sum()

        return DatasetStatsResponse(
            total_patients=int(total_patients),
            total_providers=int(total_providers),
            total_claims=int(total_claims),
            total_fraudulent_claims=int(fraudulent_claims),
            fraud_rate=float(fraud_rate),
            total_claim_amount=float(total_claim_amount),
            fraud_amount=float(fraud_amount)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting dataset statistics: {str(e)}"
        )


@router.get("/patients", response_model=PaginatedPatientsResponse, status_code=status.HTTP_200_OK)
def get_patients(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or ID"),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated list of patients.

    - **page**: Page number (starting from 1)
    - **page_size**: Number of items per page (max 100)
    - **search**: Optional search term for filtering patients
    """
    try:
        data_loader = get_data_loader()
        patients_df = data_loader.patients_df.copy()

        # Apply search filter
        if search:
            search_lower = search.lower()
            patients_df = patients_df[
                patients_df['patient_id'].str.lower().str.contains(search_lower, na=False) |
                patients_df['first_name'].str.lower().str.contains(search_lower, na=False) |
                patients_df['last_name'].str.lower().str.contains(search_lower, na=False)
            ]

        total = len(patients_df)

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        patients_page = patients_df.iloc[start:end]

        # Convert to response model - convert types
        patients = []
        for _, row in patients_page.iterrows():
            patient_dict = row.to_dict()
            # Convert int fields to strings
            for field in ['patient_id', 'zip_code']:
                if field in patient_dict:
                    patient_dict[field] = str(patient_dict[field])
            patients.append(PatientResponse(**patient_dict))

        return PaginatedPatientsResponse(
            total=total,
            page=page,
            page_size=page_size,
            patients=patients
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting patients: {str(e)}"
        )


@router.get("/providers", response_model=PaginatedProvidersResponse, status_code=status.HTTP_200_OK)
def get_providers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated list of healthcare providers.

    - **page**: Page number (starting from 1)
    - **page_size**: Number of items per page (max 100)
    - **specialty**: Optional filter by medical specialty
    """
    try:
        data_loader = get_data_loader()
        providers_df = data_loader.providers_df.copy()

        # Apply specialty filter
        if specialty:
            providers_df = providers_df[providers_df['specialty'].str.lower() == specialty.lower()]

        total = len(providers_df)

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        providers_page = providers_df.iloc[start:end]

        # Convert to response model - convert types
        providers = []
        for _, row in providers_page.iterrows():
            provider_dict = row.to_dict()
            # Convert int fields to strings
            for field in ['provider_id', 'zip_code', 'license_number', 'phone']:
                if field in provider_dict:
                    provider_dict[field] = str(provider_dict[field])
            # Handle NaN values for string fields
            for field in ['specialty', 'provider_type', 'provider_name', 'license_state', 'address', 'city', 'state']:
                if field in provider_dict and pd.isna(provider_dict[field]):
                    provider_dict[field] = ""
            providers.append(ProviderResponse(**provider_dict))

        return PaginatedProvidersResponse(
            total=total,
            page=page,
            page_size=page_size,
            providers=providers
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting providers: {str(e)}"
        )


@router.get("/claims", response_model=PaginatedClaimsResponse, status_code=status.HTTP_200_OK)
def get_claims(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
    provider_id: Optional[str] = Query(None, description="Filter by provider ID"),
    fraud_only: bool = Query(False, description="Show only fraudulent claims"),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated list of claims.

    - **page**: Page number (starting from 1)
    - **page_size**: Number of items per page (max 100)
    - **patient_id**: Optional filter by patient
    - **provider_id**: Optional filter by provider
    - **fraud_only**: If true, show only fraudulent claims
    """
    try:
        data_loader = get_data_loader()
        claims_df = data_loader.claims_df.copy()

        # Apply filters
        if patient_id:
            claims_df = claims_df[claims_df['patient_id'] == patient_id]

        if provider_id:
            claims_df = claims_df[claims_df['provider_id'] == provider_id]

        if fraud_only:
            claims_df = claims_df[claims_df['is_fraudulent'] == True]

        total = len(claims_df)

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        claims_page = claims_df.iloc[start:end]

        # Convert to response model - handle NaN values and types
        claims = []
        for _, row in claims_page.iterrows():
            claim_dict = row.to_dict()
            # Convert NaN to None for optional fields
            if pd.isna(claim_dict.get('fraud_type')):
                claim_dict['fraud_type'] = None
            # Convert int/float fields to strings where needed
            for field in ['patient_id', 'provider_id', 'policy_id', 'claim_number', 'diagnosis_code', 'procedure_code']:
                if field in claim_dict:
                    claim_dict[field] = str(claim_dict[field])
            claims.append(ClaimResponse(**claim_dict))

        return PaginatedClaimsResponse(
            total=total,
            page=page,
            page_size=page_size,
            claims=claims
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting claims: {str(e)}"
        )


@router.get("/patients/{patient_id}", response_model=PatientResponse, status_code=status.HTTP_200_OK)
def get_patient_by_id(
    patient_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific patient by ID.

    - **patient_id**: Unique patient identifier
    """
    try:
        data_loader = get_data_loader()
        patient = data_loader.get_patient(patient_id)

        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient {patient_id} not found"
            )

        # Convert int fields to strings
        for field in ['patient_id', 'zip_code']:
            if field in patient:
                patient[field] = str(patient[field])

        return PatientResponse(**patient)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting patient: {str(e)}"
        )


@router.get("/providers/{provider_id}", response_model=ProviderResponse, status_code=status.HTTP_200_OK)
def get_provider_by_id(
    provider_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific provider by ID.

    - **provider_id**: Unique provider identifier
    """
    try:
        data_loader = get_data_loader()
        provider = data_loader.get_provider(provider_id)

        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provider {provider_id} not found"
            )

        # Convert int fields to strings
        for field in ['provider_id', 'zip_code', 'license_number', 'phone']:
            if field in provider:
                provider[field] = str(provider[field])

        # Handle NaN values for string fields
        for field in ['specialty', 'provider_type', 'provider_name', 'license_state', 'address', 'city', 'state']:
            if field in provider and pd.isna(provider[field]):
                provider[field] = ""

        return ProviderResponse(**provider)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting provider: {str(e)}"
        )


@router.get("/claims/{claim_id}", response_model=ClaimResponse, status_code=status.HTTP_200_OK)
def get_claim_by_id(
    claim_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific claim by ID.

    - **claim_id**: Unique claim identifier
    """
    try:
        data_loader = get_data_loader()
        claim = data_loader.get_claim(claim_id)

        if not claim:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Claim {claim_id} not found"
            )

        # Handle NaN values
        if pd.isna(claim.get('fraud_type')):
            claim['fraud_type'] = None

        # Extract just the claim data (without nested patient/provider)
        claim_data = {k: v for k, v in claim.items() if k not in ['patient', 'provider']}

        # Convert int/float fields to strings
        for field in ['patient_id', 'provider_id', 'policy_id', 'claim_number', 'diagnosis_code', 'procedure_code']:
            if field in claim_data:
                claim_data[field] = str(claim_data[field])

        return ClaimResponse(**claim_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting claim: {str(e)}"
        )


@router.get("/schema", response_model=DatasetSchemaResponse, status_code=status.HTTP_200_OK)
def get_dataset_schema(current_user: User = Depends(get_current_user)):
    """
    Get expected CSV schema documentation for dataset upload.

    Returns the required fields, data types, and examples for all CSV files
    that can be uploaded to the system.
    """
    try:
        schema = DatasetSchemaResponse(
            patients=[
                CSVFieldSchema(field_name="patient_id", data_type="string", required=True, description="Unique patient identifier", example="PAT000123"),
                CSVFieldSchema(field_name="first_name", data_type="string", required=True, description="Patient first name", example="John"),
                CSVFieldSchema(field_name="last_name", data_type="string", required=True, description="Patient last name", example="Doe"),
                CSVFieldSchema(field_name="date_of_birth", data_type="date", required=True, description="Date of birth (YYYY-MM-DD)", example="1985-03-15"),
                CSVFieldSchema(field_name="gender", data_type="string", required=True, description="Gender (M/F/Other)", example="M"),
                CSVFieldSchema(field_name="address", data_type="string", required=True, description="Street address", example="123 Main St"),
                CSVFieldSchema(field_name="city", data_type="string", required=True, description="City", example="Boston"),
                CSVFieldSchema(field_name="state", data_type="string", required=True, description="State code", example="MA"),
                CSVFieldSchema(field_name="zip_code", data_type="string", required=True, description="ZIP code", example="02101"),
            ],
            providers=[
                CSVFieldSchema(field_name="provider_id", data_type="string", required=True, description="Unique provider identifier", example="PRV000456"),
                CSVFieldSchema(field_name="provider_name", data_type="string", required=True, description="Provider name", example="Dr. Jane Smith MD"),
                CSVFieldSchema(field_name="provider_type", data_type="string", required=True, description="Provider type", example="Individual"),
                CSVFieldSchema(field_name="specialty", data_type="string", required=True, description="Medical specialty", example="Cardiology"),
                CSVFieldSchema(field_name="license_number", data_type="string", required=True, description="License number", example="MA-12345"),
                CSVFieldSchema(field_name="license_state", data_type="string", required=True, description="License state", example="MA"),
                CSVFieldSchema(field_name="address", data_type="string", required=True, description="Provider address", example="456 Medical Center Dr"),
                CSVFieldSchema(field_name="city", data_type="string", required=True, description="City", example="Boston"),
                CSVFieldSchema(field_name="state", data_type="string", required=True, description="State", example="MA"),
                CSVFieldSchema(field_name="zip_code", data_type="string", required=True, description="ZIP code", example="02115"),
                CSVFieldSchema(field_name="phone", data_type="string", required=True, description="Phone number", example="5551234567"),
                CSVFieldSchema(field_name="years_in_practice", data_type="integer", required=True, description="Years in practice", example="15"),
                CSVFieldSchema(field_name="is_in_network", data_type="boolean", required=True, description="In network status", example="true"),
            ],
            claims=[
                CSVFieldSchema(field_name="claim_id", data_type="string", required=True, description="Unique claim identifier", example="CLM123456"),
                CSVFieldSchema(field_name="patient_id", data_type="string", required=True, description="Patient ID", example="PAT000123"),
                CSVFieldSchema(field_name="provider_id", data_type="string", required=True, description="Provider ID", example="PRV000456"),
                CSVFieldSchema(field_name="policy_id", data_type="string", required=True, description="Policy ID", example="POL000789"),
                CSVFieldSchema(field_name="claim_number", data_type="string", required=True, description="Claim number", example="CN123456789"),
                CSVFieldSchema(field_name="submission_date", data_type="date", required=True, description="Submission date (YYYY-MM-DD)", example="2024-01-15"),
                CSVFieldSchema(field_name="service_date", data_type="date", required=True, description="Service date (YYYY-MM-DD)", example="2024-01-10"),
                CSVFieldSchema(field_name="diagnosis_code", data_type="string", required=True, description="ICD-10 diagnosis code", example="I10"),
                CSVFieldSchema(field_name="procedure_code", data_type="string", required=True, description="CPT procedure code", example="99213"),
                CSVFieldSchema(field_name="claim_amount", data_type="float", required=True, description="Claim amount", example="250.00"),
                CSVFieldSchema(field_name="allowed_amount", data_type="float", required=True, description="Allowed amount", example="200.00"),
                CSVFieldSchema(field_name="paid_amount", data_type="float", required=True, description="Paid amount", example="180.00"),
                CSVFieldSchema(field_name="patient_responsibility", data_type="float", required=True, description="Patient responsibility", example="50.00"),
                CSVFieldSchema(field_name="claim_status", data_type="string", required=True, description="Claim status", example="Approved"),
                CSVFieldSchema(field_name="claim_type", data_type="string", required=True, description="Claim type", example="outpatient"),
                CSVFieldSchema(field_name="is_fraudulent", data_type="boolean", required=True, description="Fraud label", example="false"),
                CSVFieldSchema(field_name="fraud_type", data_type="string", required=False, description="Fraud type if applicable", example="upcoding"),
            ],
            policies=[
                CSVFieldSchema(field_name="policy_id", data_type="string", required=True, description="Unique policy identifier", example="POL000789"),
                CSVFieldSchema(field_name="patient_id", data_type="string", required=True, description="Patient ID", example="PAT000123"),
                CSVFieldSchema(field_name="policy_number", data_type="string", required=True, description="Policy number", example="POL-2024-123456"),
                CSVFieldSchema(field_name="plan_type", data_type="string", required=True, description="Plan type", example="PPO"),
                CSVFieldSchema(field_name="coverage_start_date", data_type="date", required=True, description="Coverage start date", example="2024-01-01"),
                CSVFieldSchema(field_name="coverage_end_date", data_type="date", required=True, description="Coverage end date", example="2024-12-31"),
                CSVFieldSchema(field_name="premium", data_type="float", required=True, description="Monthly premium", example="450.00"),
                CSVFieldSchema(field_name="deductible", data_type="float", required=True, description="Annual deductible", example="1500.00"),
                CSVFieldSchema(field_name="out_of_pocket_max", data_type="float", required=True, description="Out of pocket maximum", example="6000.00"),
            ],
            diagnoses=[
                CSVFieldSchema(field_name="diagnosis_code", data_type="string", required=True, description="ICD-10 code", example="I10"),
                CSVFieldSchema(field_name="diagnosis_description", data_type="string", required=True, description="Diagnosis description", example="Essential hypertension"),
                CSVFieldSchema(field_name="category", data_type="string", required=True, description="Diagnosis category", example="Cardiovascular"),
            ],
            procedures=[
                CSVFieldSchema(field_name="procedure_code", data_type="string", required=True, description="CPT code", example="99213"),
                CSVFieldSchema(field_name="procedure_description", data_type="string", required=True, description="Procedure description", example="Office visit, established patient"),
                CSVFieldSchema(field_name="category", data_type="string", required=True, description="Procedure category", example="Evaluation and Management"),
            ],
            medications=[
                CSVFieldSchema(field_name="medication_id", data_type="string", required=True, description="Medication identifier", example="MED00123"),
                CSVFieldSchema(field_name="medication_name", data_type="string", required=True, description="Medication name", example="Lisinopril"),
                CSVFieldSchema(field_name="dosage", data_type="string", required=True, description="Dosage", example="10mg"),
                CSVFieldSchema(field_name="category", data_type="string", required=True, description="Medication category", example="ACE Inhibitor"),
            ],
            pharmacies=[
                CSVFieldSchema(field_name="pharmacy_id", data_type="string", required=True, description="Pharmacy identifier", example="PHA00123"),
                CSVFieldSchema(field_name="pharmacy_name", data_type="string", required=True, description="Pharmacy name", example="CVS Pharmacy"),
                CSVFieldSchema(field_name="address", data_type="string", required=True, description="Address", example="789 Main St"),
                CSVFieldSchema(field_name="city", data_type="string", required=True, description="City", example="Boston"),
                CSVFieldSchema(field_name="state", data_type="string", required=True, description="State", example="MA"),
                CSVFieldSchema(field_name="zip_code", data_type="string", required=True, description="ZIP code", example="02101"),
            ]
        )
        return schema
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting schema: {str(e)}"
        )


@router.get("/sample/download", status_code=status.HTTP_200_OK)
def download_sample_dataset(current_user: User = Depends(get_current_user)):
    """
    Download sample dataset as a ZIP file containing all CSV files.

    Returns a ZIP file with sample data that can be used as a template
    for uploading custom datasets.
    """
    try:
        data_dir = "data"

        # Create in-memory ZIP file
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add all CSV files to ZIP
            csv_files = [
                'patients.csv', 'providers.csv', 'claims.csv',
                'policies.csv', 'diagnoses.csv', 'procedures.csv',
                'medications.csv', 'pharmacies.csv'
            ]

            for csv_file in csv_files:
                file_path = os.path.join(data_dir, csv_file)
                if os.path.exists(file_path):
                    zip_file.write(file_path, arcname=csv_file)

        zip_buffer.seek(0)

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=sample_fraud_dataset.zip"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error downloading sample dataset: {str(e)}"
        )


@router.post("/sample/load", response_model=SampleLoadResponse, status_code=status.HTTP_200_OK)
def load_sample_dataset(current_user: User = Depends(get_current_user)):
    """
    Load sample dataset into the system.

    This reloads the default sample dataset from the data/ directory,
    useful for resetting to sample data or after uploading custom data.
    """
    try:
        # Reload data from the default data directory
        data_loader = get_data_loader()
        data_loader.load_data()

        return SampleLoadResponse(
            success=True,
            message="Sample dataset loaded successfully",
            total_patients=len(data_loader.patients_df),
            total_providers=len(data_loader.providers_df),
            total_claims=len(data_loader.claims_df)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading sample dataset: {str(e)}"
        )


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_200_OK)
async def upload_dataset(
    patients: Optional[UploadFile] = File(None),
    providers: Optional[UploadFile] = File(None),
    claims: Optional[UploadFile] = File(None),
    policies: Optional[UploadFile] = File(None),
    diagnoses: Optional[UploadFile] = File(None),
    procedures: Optional[UploadFile] = File(None),
    medications: Optional[UploadFile] = File(None),
    pharmacies: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload custom dataset CSV files.

    Upload one or more CSV files to replace the current dataset.
    Files should match the schema returned by the /schema endpoint.

    - **patients**: patients.csv file
    - **providers**: providers.csv file
    - **claims**: claims.csv file (required)
    - **policies**: policies.csv file
    - **diagnoses**: diagnoses.csv file
    - **procedures**: procedures.csv file
    - **medications**: medications.csv file
    - **pharmacies**: pharmacies.csv file
    """
    try:
        data_dir = "data"
        uploaded_files = []

        # Create backup directory
        backup_dir = f"{data_dir}_backup"
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        shutil.copytree(data_dir, backup_dir)

        # Map of file uploads
        file_map = {
            'patients.csv': patients,
            'providers.csv': providers,
            'claims.csv': claims,
            'policies.csv': policies,
            'diagnoses.csv': diagnoses,
            'procedures.csv': procedures,
            'medications.csv': medications,
            'pharmacies.csv': pharmacies,
        }

        # Validate and save uploaded files
        for filename, upload_file in file_map.items():
            if upload_file is not None:
                # Validate CSV
                try:
                    contents = await upload_file.read()
                    df = pd.read_csv(BytesIO(contents))

                    # Save to data directory
                    file_path = os.path.join(data_dir, filename)
                    with open(file_path, 'wb') as f:
                        f.write(contents)

                    uploaded_files.append(filename)
                except Exception as e:
                    # Restore from backup on error
                    shutil.rmtree(data_dir)
                    shutil.copytree(backup_dir, data_dir)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid CSV file {filename}: {str(e)}"
                    )

        if not uploaded_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files uploaded"
            )

        # Reload data
        try:
            data_loader = get_data_loader()
            data_loader.load_data()

            return UploadResponse(
                success=True,
                message=f"Successfully uploaded {len(uploaded_files)} file(s)",
                files_uploaded=uploaded_files,
                total_patients=len(data_loader.patients_df) if data_loader.patients_df is not None else 0,
                total_providers=len(data_loader.providers_df) if data_loader.providers_df is not None else 0,
                total_claims=len(data_loader.claims_df) if data_loader.claims_df is not None else 0
            )
        except Exception as e:
            # Restore from backup on error
            shutil.rmtree(data_dir)
            shutil.copytree(backup_dir, data_dir)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error loading uploaded data: {str(e)}"
            )
        finally:
            # Clean up backup
            if os.path.exists(backup_dir):
                shutil.rmtree(backup_dir)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading dataset: {str(e)}"
        )
