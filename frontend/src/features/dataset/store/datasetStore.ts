import { create } from 'zustand';
import apiClient from '../../../api/axios.config';

interface DatasetStats {
  total_patients: number;
  total_providers: number;
  total_claims: number;
  total_fraudulent_claims: number;
  fraud_rate: number;
  total_claim_amount: number;
  fraud_amount: number;
}

interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

interface Provider {
  provider_id: string;
  provider_name: string;
  provider_type: string;
  specialty: string;
  license_number: string;
  license_state: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  years_in_practice: number;
  is_in_network: boolean;
}

interface Claim {
  claim_id: string;
  patient_id: string;
  provider_id: string;
  policy_id: string;
  claim_number: string;
  submission_date: string;
  service_date: string;
  diagnosis_code: string;
  procedure_code: string;
  claim_amount: number;
  allowed_amount: number;
  paid_amount: number;
  patient_responsibility: number;
  claim_status: string;
  claim_type: string;
  is_fraudulent: boolean;
  fraud_type: string | null;
}

interface DatasetState {
  stats: DatasetStats | null;
  patients: Patient[];
  providers: Provider[];
  claims: Claim[];

  patientsTotal: number;
  providersTotal: number;
  claimsTotal: number;

  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStats: () => Promise<void>;
  fetchPatients: (page?: number, pageSize?: number) => Promise<void>;
  fetchProviders: (page?: number, pageSize?: number) => Promise<void>;
  fetchClaims: (page?: number, pageSize?: number, fraudOnly?: boolean) => Promise<void>;
  clearError: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  stats: null,
  patients: [],
  providers: [],
  claims: [],

  patientsTotal: 0,
  providersTotal: 0,
  claimsTotal: 0,

  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/dataset/stats');
      set({ stats: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch statistics',
        isLoading: false
      });
    }
  },

  fetchPatients: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/dataset/patients', {
        params: { page, page_size: pageSize }
      });
      set({
        patients: response.data.patients,
        patientsTotal: response.data.total,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch patients',
        isLoading: false
      });
    }
  },

  fetchProviders: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/dataset/providers', {
        params: { page, page_size: pageSize }
      });
      set({
        providers: response.data.providers,
        providersTotal: response.data.total,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch providers',
        isLoading: false
      });
    }
  },

  fetchClaims: async (page = 1, pageSize = 20, fraudOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/dataset/claims', {
        params: { page, page_size: pageSize, fraud_only: fraudOnly }
      });
      set({
        claims: response.data.claims,
        claimsTotal: response.data.total,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch claims',
        isLoading: false
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
