"""
Graph-based feature extraction for fraud detection.
Extracts features from patient, provider, claim relationships using CSV data and NetworkX.
"""
import pandas as pd
import networkx as nx
from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime, timedelta
from collections import Counter
import warnings
warnings.filterwarnings('ignore')


class FraudFeatureExtractor:
    """Extract ML features from health insurance claim data."""

    def __init__(self, data_loader):
        """
        Initialize feature extractor.

        Args:
            data_loader: CSVDataLoader instance with loaded data
        """
        self.data_loader = data_loader
        self.patients_df = data_loader.patients_df
        self.providers_df = data_loader.providers_df
        self.claims_df = data_loader.claims_df
        self.graph = data_loader.graph

    def extract_all_features(self, claim_ids: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Extract all features for claims.

        Args:
            claim_ids: List of claim IDs to extract features for. If None, extract for all claims.

        Returns:
            DataFrame with features for each claim
        """
        if claim_ids is None:
            claims_subset = self.claims_df.copy()
        else:
            claims_subset = self.claims_df[self.claims_df['claim_id'].isin(claim_ids)].copy()

        print(f"Extracting features for {len(claims_subset)} claims...")

        # Extract different feature groups
        print("  - Extracting claim features...")
        claim_features = self._extract_claim_features(claims_subset)

        print("  - Extracting patient features...")
        patient_features = self._extract_patient_features(claims_subset)

        print("  - Extracting provider features...")
        provider_features = self._extract_provider_features(claims_subset)

        print("  - Extracting temporal features...")
        temporal_features = self._extract_temporal_features(claims_subset)

        print("  - Extracting graph features...")
        graph_features = self._extract_graph_features(claims_subset)

        # Combine all features
        features = pd.concat([
            claims_subset[['claim_id']].reset_index(drop=True),
            claim_features.reset_index(drop=True),
            patient_features.reset_index(drop=True),
            provider_features.reset_index(drop=True),
            temporal_features.reset_index(drop=True),
            graph_features.reset_index(drop=True)
        ], axis=1)

        print(f"✓ Extracted {len(features.columns)-1} features for {len(features)} claims")

        return features

    def _extract_claim_features(self, claims_df: pd.DataFrame) -> pd.DataFrame:
        """Extract features from claim attributes."""
        features = pd.DataFrame()

        # Basic claim amount features
        features['claim_amount'] = claims_df['claim_amount']
        features['claim_amount_log'] = np.log1p(claims_df['claim_amount'])

        # Claim type encoding
        if 'claim_type' in claims_df.columns:
            claim_type_dummies = pd.get_dummies(claims_df['claim_type'], prefix='claim_type')
            features = pd.concat([features, claim_type_dummies], axis=1)

        # Status encoding
        if 'claim_status' in claims_df.columns:
            status_dummies = pd.get_dummies(claims_df['claim_status'], prefix='status')
            features = pd.concat([features, status_dummies], axis=1)

        # Admission type encoding (if applicable)
        if 'admission_type' in claims_df.columns:
            features['is_emergency'] = (claims_df['admission_type'] == 'Emergency').astype(int)
            features['is_elective'] = (claims_df['admission_type'] == 'Elective').astype(int)

        # Length of stay features (if applicable)
        if 'length_of_stay' in claims_df.columns:
            features['length_of_stay'] = claims_df['length_of_stay'].fillna(0)
            features['has_length_of_stay'] = (claims_df['length_of_stay'] > 0).astype(int)

        return features

    def _extract_patient_features(self, claims_df: pd.DataFrame) -> pd.DataFrame:
        """Extract features about patients."""
        features = pd.DataFrame()

        # Get patient data for each claim
        patient_ids = claims_df['patient_id'].unique()

        # Calculate patient-level statistics
        patient_stats = {}
        for patient_id in patient_ids:
            patient_claims = self.claims_df[self.claims_df['patient_id'] == patient_id]

            patient_stats[patient_id] = {
                'patient_num_claims': len(patient_claims),
                'patient_total_claimed': patient_claims['claim_amount'].sum(),
                'patient_avg_claim': patient_claims['claim_amount'].mean(),
                'patient_max_claim': patient_claims['claim_amount'].max(),
                'patient_min_claim': patient_claims['claim_amount'].min(),
                'patient_std_claim': patient_claims['claim_amount'].std() if len(patient_claims) > 1 else 0,
                'patient_num_providers': patient_claims['provider_id'].nunique(),
            }

        # Map back to claims
        for col in patient_stats[patient_ids[0]].keys():
            features[col] = claims_df['patient_id'].map(lambda x: patient_stats.get(x, {}).get(col, 0))

        # Patient age (calculate from date_of_birth if available)
        if 'patient_id' in claims_df.columns:
            patient_ages = {}
            for _, patient in self.patients_df.iterrows():
                try:
                    dob = pd.to_datetime(patient['date_of_birth'])
                    age = (datetime.now() - dob).days / 365.25
                    patient_ages[patient['patient_id']] = age
                except:
                    patient_ages[patient['patient_id']] = 45  # Default age

            features['patient_age'] = claims_df['patient_id'].map(patient_ages)

        # Patient gender encoding
        patient_gender = self.patients_df.set_index('patient_id')['gender'].to_dict()
        features['patient_is_male'] = claims_df['patient_id'].map(
            lambda x: 1 if patient_gender.get(x, 'M') == 'M' else 0
        )

        return features

    def _extract_provider_features(self, claims_df: pd.DataFrame) -> pd.DataFrame:
        """Extract features about providers."""
        features = pd.DataFrame()

        # Get provider data for each claim
        provider_ids = claims_df['provider_id'].unique()

        # Calculate provider-level statistics
        provider_stats = {}
        for provider_id in provider_ids:
            provider_claims = self.claims_df[self.claims_df['provider_id'] == provider_id]

            provider_stats[provider_id] = {
                'provider_num_claims': len(provider_claims),
                'provider_total_billed': provider_claims['claim_amount'].sum(),
                'provider_avg_claim': provider_claims['claim_amount'].mean(),
                'provider_max_claim': provider_claims['claim_amount'].max(),
                'provider_std_claim': provider_claims['claim_amount'].std() if len(provider_claims) > 1 else 0,
                'provider_num_patients': provider_claims['patient_id'].nunique(),
                'provider_fraud_rate': provider_claims['is_fraudulent'].mean() if 'is_fraudulent' in provider_claims else 0,
            }

        # Map back to claims
        for col in provider_stats[provider_ids[0]].keys():
            features[col] = claims_df['provider_id'].map(lambda x: provider_stats.get(x, {}).get(col, 0))

        # Provider specialty encoding - ensure consistent columns
        provider_specialty = self.providers_df.set_index('provider_id')['specialty'].to_dict()

        # Get all possible specialties from the full provider dataset (filter out NaN)
        all_specialties = sorted([s for s in self.providers_df['specialty'].unique() if pd.notna(s)])

        # Create specialty columns for each claim
        for specialty in all_specialties:
            col_name = f'specialty_{specialty}'
            features[col_name] = claims_df['provider_id'].map(provider_specialty).apply(
                lambda x: 1 if pd.notna(x) and x == specialty else 0
            )

        return features

    def _extract_temporal_features(self, claims_df: pd.DataFrame) -> pd.DataFrame:
        """Extract temporal features from service dates."""
        features = pd.DataFrame()

        # Convert service_date to datetime (handle ISO8601 format)
        service_dates = pd.to_datetime(claims_df['service_date'], format='ISO8601')

        # Day of week features
        features['service_day_of_week'] = service_dates.dt.dayofweek
        features['is_weekend'] = (service_dates.dt.dayofweek >= 5).astype(int)

        # Month features
        features['service_month'] = service_dates.dt.month

        # Time-based features
        features['service_hour'] = service_dates.dt.hour
        features['is_night'] = ((service_dates.dt.hour < 6) | (service_dates.dt.hour > 20)).astype(int)

        # Days since first claim for each patient
        patient_first_claim = {}
        for patient_id in claims_df['patient_id'].unique():
            patient_claims = self.claims_df[self.claims_df['patient_id'] == patient_id]
            first_claim_date = pd.to_datetime(patient_claims['service_date'], format='ISO8601').min()
            patient_first_claim[patient_id] = first_claim_date

        features['days_since_first_claim'] = claims_df.apply(
            lambda row: (pd.to_datetime(row['service_date'], format='ISO8601') - patient_first_claim.get(row['patient_id'], pd.to_datetime(row['service_date'], format='ISO8601'))).days,
            axis=1
        )

        # Claim frequency (claims per day for patient)
        claim_frequency = {}
        for patient_id in claims_df['patient_id'].unique():
            patient_claims = self.claims_df[self.claims_df['patient_id'] == patient_id]
            dates = pd.to_datetime(patient_claims['service_date'], format='ISO8601')
            if len(dates) > 1:
                date_range = (dates.max() - dates.min()).days + 1
                claim_frequency[patient_id] = len(patient_claims) / max(date_range, 1)
            else:
                claim_frequency[patient_id] = 0

        features['patient_claim_frequency'] = claims_df['patient_id'].map(claim_frequency)

        return features

    def _extract_graph_features(self, claims_df: pd.DataFrame) -> pd.DataFrame:
        """Extract graph-based features using NetworkX."""
        features = pd.DataFrame()

        # Node degree features
        patient_degrees = {}
        provider_degrees = {}

        for node in self.graph.nodes():
            degree = self.graph.degree(node)
            node_type = self.graph.nodes[node].get('node_type', 'unknown')

            if node_type == 'patient':
                patient_degrees[node] = degree
            elif node_type == 'provider':
                provider_degrees[node] = degree

        features['patient_degree'] = claims_df['patient_id'].map(lambda x: patient_degrees.get(x, 0))
        features['provider_degree'] = claims_df['provider_id'].map(lambda x: provider_degrees.get(x, 0))

        # Betweenness centrality (expensive, so we'll compute for sample)
        try:
            if len(self.graph.nodes()) < 5000:
                betweenness = nx.betweenness_centrality(self.graph)
                features['patient_betweenness'] = claims_df['patient_id'].map(lambda x: betweenness.get(x, 0))
                features['provider_betweenness'] = claims_df['provider_id'].map(lambda x: betweenness.get(x, 0))
            else:
                # For large graphs, use approximation
                features['patient_betweenness'] = 0
                features['provider_betweenness'] = 0
        except:
            features['patient_betweenness'] = 0
            features['provider_betweenness'] = 0

        # Clustering coefficient
        clustering = nx.clustering(self.graph)
        features['patient_clustering'] = claims_df['patient_id'].map(lambda x: clustering.get(x, 0))
        features['provider_clustering'] = claims_df['provider_id'].map(lambda x: clustering.get(x, 0))

        # Shared neighbors between patient and provider
        shared_neighbors = []
        for _, row in claims_df.iterrows():
            try:
                patient_id = row['patient_id']
                provider_id = row['provider_id']

                if patient_id in self.graph and provider_id in self.graph:
                    patient_neighbors = set(self.graph.neighbors(patient_id))
                    provider_neighbors = set(self.graph.neighbors(provider_id))
                    shared = len(patient_neighbors & provider_neighbors)
                    shared_neighbors.append(shared)
                else:
                    shared_neighbors.append(0)
            except:
                shared_neighbors.append(0)

        features['shared_neighbors'] = shared_neighbors

        # Distance between patient and provider in graph
        distances = []
        for _, row in claims_df.iterrows():
            try:
                patient_id = row['patient_id']
                provider_id = row['provider_id']

                if patient_id in self.graph and provider_id in self.graph:
                    if self.graph.has_edge(patient_id, provider_id):
                        distances.append(1)
                    else:
                        try:
                            distance = nx.shortest_path_length(self.graph, patient_id, provider_id)
                            distances.append(distance)
                        except nx.NetworkXNoPath:
                            distances.append(999)  # No path
                else:
                    distances.append(999)
            except:
                distances.append(999)

        features['graph_distance'] = distances

        return features

    def prepare_training_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare feature matrix and labels for training.

        Returns:
            Tuple of (features_df, labels_series)
        """
        print("\n📊 Preparing training data...")

        # Extract features for all claims
        features_df = self.extract_all_features()

        # Get labels - merge to ensure alignment
        claim_ids = features_df['claim_id'].values
        labels_df = self.claims_df[self.claims_df['claim_id'].isin(claim_ids)][['claim_id', 'is_fraudulent']]

        # Merge to ensure order matches
        features_with_labels = features_df.merge(labels_df, on='claim_id', how='left')
        labels = features_with_labels['is_fraudulent']

        # Drop claim_id and is_fraudulent from features
        features_df = features_with_labels.drop(['claim_id', 'is_fraudulent'], axis=1)

        # Handle missing values
        features_df = features_df.fillna(0)

        # Handle infinite values
        features_df = features_df.replace([np.inf, -np.inf], 0)

        print(f"✓ Prepared {features_df.shape[0]} samples with {features_df.shape[1]} features")
        print(f"  - Fraudulent claims: {labels.sum()} ({labels.mean()*100:.1f}%)")
        print(f"  - Normal claims: {(~labels).sum()} ({(~labels).mean()*100:.1f}%)")

        return features_df, labels

    def get_feature_names(self) -> List[str]:
        """Get list of all feature names."""
        # Extract features for a single claim to get feature names
        sample_claim = self.claims_df.iloc[:1]
        features = self.extract_all_features([sample_claim['claim_id'].iloc[0]])
        return list(features.columns[1:])  # Exclude claim_id


def calculate_feature_importance(feature_extractor: FraudFeatureExtractor,
                                 model) -> pd.DataFrame:
    """
    Calculate feature importance from trained model.

    Args:
        feature_extractor: Trained feature extractor
        model: Trained sklearn model with feature_importances_

    Returns:
        DataFrame with feature names and importance scores
    """
    feature_names = feature_extractor.get_feature_names()

    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_

        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False)

        return importance_df
    else:
        return pd.DataFrame({'feature': feature_names, 'importance': 0})
