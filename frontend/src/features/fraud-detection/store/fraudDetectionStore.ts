import { create } from 'zustand';
import apiClient from '../../../api/axios.config';

interface FraudRiskFactor {
  factor: string;
  value: number;
}

interface RedFlag {
  id: number;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  data_points: string[];
}

interface FraudExplanation {
  summary: string;
  red_flags: RedFlag[];
  recommendation: string;
  confidence_explanation: string;
  total_red_flags: number;
  risk_score: number;
}

interface FraudAssessment {
  claim_id: string;
  patient_id: string;
  provider_id: string;
  claim_amount: number;
  service_date: string;
  claim_type: string;
  fraud_probability: number;
  is_fraud_predicted: boolean;
  risk_level: string;
  confidence: number;
  risk_factors: FraudRiskFactor[];
  explanation?: FraudExplanation | null;

  // VALIDATION DATA ONLY - Not displayed in main UI
  // These fields are used ONLY for accuracy validation in a separate validation section
  // The ML model does NOT use these labels for making predictions
  actual_fraud_label: boolean;
  actual_fraud_type: string | null;
}

interface FraudInsight {
  title: string;
  description: string;
  impact: string;
  action: string;
}

interface FraudDetectionState {
  assessments: FraudAssessment[];
  executiveSummary: string | null;
  insights: FraudInsight[] | null;
  isDetecting: boolean;
  progress: number;
  error: string | null;

  // Actions
  runFraudDetection: (claimIds?: string[]) => Promise<void>;
  clearAssessments: () => void;
  clearError: () => void;
}

export const useFraudDetectionStore = create<FraudDetectionState>((set) => ({
  assessments: [],
  executiveSummary: null,
  insights: null,
  isDetecting: false,
  progress: 0,
  error: null,

  runFraudDetection: async (claimIds?: string[]) => {
    set({ isDetecting: true, error: null, progress: 0 });

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      set((state) => ({
        progress: Math.min(state.progress + Math.random() * 15, 95)
      }));
    }, 400);

    try {
      const payload = claimIds && claimIds.length > 0 ? { claim_ids: claimIds } : {};
      // Use the new detect-with-insights endpoint for Local SLM-powered analysis
      const response = await apiClient.post('/fraud/detect-with-insights', payload);

      clearInterval(progressInterval);
      set({
        assessments: response.data.predictions || [],
        executiveSummary: response.data.executive_summary || null,
        insights: response.data.insights || null,
        progress: 100,
        isDetecting: false
      });
    } catch (error: any) {
      clearInterval(progressInterval);
      set({
        error: error.response?.data?.detail || 'Failed to run fraud detection',
        progress: 0,
        isDetecting: false
      });
    }
  },

  clearAssessments: () => {
    set({ assessments: [], executiveSummary: null, insights: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
