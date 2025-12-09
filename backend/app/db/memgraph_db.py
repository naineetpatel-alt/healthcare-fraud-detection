"""
CSV-based data loader (Memgraph alternative for environments without Docker).
Provides in-memory graph-like operations on CSV data.
"""
import pandas as pd
import os
from typing import Dict, List, Optional, Any
import networkx as nx


class CSVDataLoader:
    """Load and query health insurance data from CSV files."""

    def __init__(self, data_dir: str = "data"):
        """
        Initialize CSV data loader.

        Args:
            data_dir: Directory containing CSV files
        """
        self.data_dir = data_dir
        self.patients_df = None
        self.providers_df = None
        self.pharmacies_df = None
        self.policies_df = None
        self.claims_df = None
        self.diagnoses_df = None
        self.procedures_df = None
        self.medications_df = None
        self.graph = None

        self.load_data()

    def load_data(self):
        """Load all CSV files into pandas DataFrames."""
        try:
            self.patients_df = pd.read_csv(f"{self.data_dir}/patients.csv")
            self.providers_df = pd.read_csv(f"{self.data_dir}/providers.csv")
            self.pharmacies_df = pd.read_csv(f"{self.data_dir}/pharmacies.csv")
            self.policies_df = pd.read_csv(f"{self.data_dir}/policies.csv")
            self.claims_df = pd.read_csv(f"{self.data_dir}/claims.csv")
            self.diagnoses_df = pd.read_csv(f"{self.data_dir}/diagnoses.csv")
            self.procedures_df = pd.read_csv(f"{self.data_dir}/procedures.csv")
            self.medications_df = pd.read_csv(f"{self.data_dir}/medications.csv")

            # Build in-memory graph for relationship queries
            self._build_graph()

            print(f"✓ Data loaded successfully from {self.data_dir}/")
            print(f"  - Patients: {len(self.patients_df):,}")
            print(f"  - Providers: {len(self.providers_df):,}")
            print(f"  - Claims: {len(self.claims_df):,}")

        except FileNotFoundError as e:
            print(f"Warning: Could not load data files: {e}")
            print("Run: python dataset/health_data_generator.py 1000 5000 0.15")

    def _build_graph(self):
        """Build NetworkX graph from relationships."""
        self.graph = nx.Graph()

        # Add nodes
        for _, patient in self.patients_df.iterrows():
            self.graph.add_node(patient['patient_id'], node_type='patient', **patient.to_dict())

        for _, provider in self.providers_df.iterrows():
            self.graph.add_node(provider['provider_id'], node_type='provider', **provider.to_dict())

        # Add edges from claims
        for _, claim in self.claims_df.iterrows():
            # Patient -> Claim relationship
            self.graph.add_edge(
                claim['patient_id'],
                claim['provider_id'],
                claim_id=claim['claim_id'],
                claim_amount=claim['claim_amount'],
                is_fraudulent=claim.get('is_fraudulent', False)
            )

    def get_patient(self, patient_id: str) -> Optional[Dict]:
        """Get patient by ID."""
        result = self.patients_df[self.patients_df['patient_id'] == patient_id]
        return result.iloc[0].to_dict() if len(result) > 0 else None

    def get_provider(self, provider_id: str) -> Optional[Dict]:
        """Get provider by ID."""
        result = self.providers_df[self.providers_df['provider_id'] == provider_id]
        return result.iloc[0].to_dict() if len(result) > 0 else None

    def get_patient_claims(self, patient_id: str) -> List[Dict]:
        """Get all claims for a patient."""
        claims = self.claims_df[self.claims_df['patient_id'] == patient_id]
        return claims.to_dict('records')

    def get_provider_claims(self, provider_id: str) -> List[Dict]:
        """Get all claims for a provider."""
        claims = self.claims_df[self.claims_df['provider_id'] == provider_id]
        return claims.to_dict('records')

    def get_claim(self, claim_id: str) -> Optional[Dict]:
        """Get claim by ID with related data."""
        result = self.claims_df[self.claims_df['claim_id'] == claim_id]
        if len(result) == 0:
            return None

        claim = result.iloc[0].to_dict()

        # Add related patient data
        patient = self.get_patient(claim['patient_id'])
        claim['patient'] = patient

        # Add related provider data
        provider = self.get_provider(claim['provider_id'])
        claim['provider'] = provider

        return claim

    def get_all_claims(self, limit: int = 100, offset: int = 0,
                      fraud_only: bool = False) -> List[Dict]:
        """Get all claims with pagination."""
        if fraud_only:
            claims = self.claims_df[self.claims_df['is_fraudulent'] == True]
        else:
            claims = self.claims_df

        return claims.iloc[offset:offset+limit].to_dict('records')

    def get_fraud_statistics(self) -> Dict[str, Any]:
        """Get fraud statistics."""
        total_claims = len(self.claims_df)
        fraud_claims = len(self.claims_df[self.claims_df['is_fraudulent'] == True])

        fraud_by_type = self.claims_df[self.claims_df['is_fraudulent'] == True]['fraud_type'].value_counts().to_dict()

        return {
            'total_claims': total_claims,
            'fraudulent_claims': fraud_claims,
            'normal_claims': total_claims - fraud_claims,
            'fraud_rate': fraud_claims / total_claims if total_claims > 0 else 0,
            'fraud_by_type': fraud_by_type
        }


# Global instance
_data_loader = None


def get_data_loader() -> CSVDataLoader:
    """Get singleton data loader instance."""
    global _data_loader
    if _data_loader is None:
        _data_loader = CSVDataLoader()
    return _data_loader
