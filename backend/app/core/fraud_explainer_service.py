"""
Fraud explanation service for generating human-readable explanations of fraud detections.
"""
from typing import Dict, List, Any, Optional
from enum import Enum


class RedFlagSeverity(str, Enum):
    """Severity levels for red flags."""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class FraudExplainerTemplate:
    """Template-based fraud explanation generator."""

    # Feature name mappings to human-readable descriptions
    FEATURE_DESCRIPTIONS = {
        # Amount-related
        'claim_amount': "Claim amount",
        'claim_to_typical_cost_ratio': "Claim amount vs typical cost",
        'avg_claim_amount': "Average claim amount for this provider",

        # Provider-related
        'provider_fraud_rate': "Provider's historical fraud rate",
        'provider_claims_per_day': "Provider's daily claim volume",
        'provider_weekend_claim_percentage': "Provider's weekend claim rate",
        'provider_denial_rate': "Provider's claim denial rate",
        'provider_pagerank': "Provider network influence score",
        'provider_referral_reciprocity': "Provider circular referral indicator",

        # Patient-related
        'patient_claim_frequency': "Patient's claim submission frequency",
        'patient_num_providers': "Number of providers patient has visited",
        'patient_geographic_spread': "Geographic spread of patient's providers",
        'patient_avg_claim_amount': "Patient's average claim amount",
        'patient_provider_shopping': "Provider shopping behavior indicator",

        # Relationship-related
        'shared_address_score': "Suspicious address sharing score",
        'fraud_ring_membership': "Fraud network membership indicator",
        'community_fraud_rate': "Fraud rate in provider's network",

        # Timing-related
        'days_since_policy_start': "Days since policy activation",
        'claim_submission_hour': "Time of day claim was submitted",

        # Network-related
        'betweenness_centrality': "Network centrality score",
        'clustering_coefficient': "Network clustering indicator",
    }

    # Threshold-based explanation templates
    EXPLANATION_TEMPLATES = {
        'claim_to_typical_cost_ratio': {
            'threshold': 2.0,
            'description': "Claim amount is {value:.1f}x higher than typical for this procedure",
            'severity': RedFlagSeverity.HIGH,
            'category': 'Amount Anomaly'
        },
        'provider_fraud_rate': {
            'threshold': 0.15,
            'description': "Provider has a {percent:.1f}% historical fraud rate",
            'severity': RedFlagSeverity.CRITICAL,
            'category': 'Provider Pattern'
        },
        'provider_weekend_claim_percentage': {
            'threshold': 0.30,
            'description': "{percent:.1f}% of provider's claims are submitted on weekends",
            'severity': RedFlagSeverity.MEDIUM,
            'category': 'Provider Pattern'
        },
        'patient_provider_shopping': {
            'threshold': 3.0,
            'description': "Patient visited {value:.0f} different providers in short period",
            'severity': RedFlagSeverity.HIGH,
            'category': 'Patient Behavior'
        },
        'provider_claims_per_day': {
            'threshold': 20.0,
            'description': "Provider submits {value:.0f} claims per day (unusually high volume)",
            'severity': RedFlagSeverity.MEDIUM,
            'category': 'Provider Pattern'
        },
        'shared_address_score': {
            'threshold': 0.5,
            'description': "Suspicious address sharing detected between entities",
            'severity': RedFlagSeverity.HIGH,
            'category': 'Relationship Pattern'
        },
        'fraud_ring_membership': {
            'threshold': 0.5,
            'description': "Provider is part of a suspected fraud network",
            'severity': RedFlagSeverity.CRITICAL,
            'category': 'Relationship Pattern'
        },
        'provider_referral_reciprocity': {
            'threshold': 0.6,
            'description': "Circular referral pattern detected (referral kickback indicator)",
            'severity': RedFlagSeverity.HIGH,
            'category': 'Relationship Pattern'
        },
        'days_since_policy_start': {
            'threshold': -30,  # Less than 30 days (negative threshold means "less than")
            'description': "Claim filed only {value:.0f} days after policy activation",
            'severity': RedFlagSeverity.MEDIUM,
            'category': 'Timing Issue'
        },
        'patient_claim_frequency': {
            'threshold': 10.0,
            'description': "Patient has submitted {value:.0f} claims in past 30 days",
            'severity': RedFlagSeverity.MEDIUM,
            'category': 'Patient Behavior'
        }
    }

    def generate_explanation(
        self,
        claim_data: Dict[str, Any],
        risk_factors: List[Dict[str, Any]],
        fraud_probability: float,
        risk_level: str
    ) -> Dict[str, Any]:
        """
        Generate human-readable explanation for fraud detection.

        Args:
            claim_data: Claim details (amount, patient_id, provider_id, etc.)
            risk_factors: List of risk factors with factor name and value
            fraud_probability: Fraud probability score (0-1)
            risk_level: Risk level (CRITICAL, HIGH, MEDIUM, LOW, MINIMAL)

        Returns:
            Dictionary with explanation details
        """
        # Generate red flags from risk factors
        red_flags = self._generate_red_flags(risk_factors)

        # Generate summary based on risk level
        summary = self._generate_summary(risk_level, fraud_probability, len(red_flags))

        # Generate recommendation
        recommendation = self._generate_recommendation(risk_level, red_flags)

        # Generate confidence explanation
        confidence_explanation = self._generate_confidence_explanation(fraud_probability)

        return {
            'summary': summary,
            'red_flags': red_flags,
            'recommendation': recommendation,
            'confidence_explanation': confidence_explanation,
            'total_red_flags': len(red_flags),
            'risk_score': fraud_probability
        }

    def _generate_red_flags(self, risk_factors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate red flags from risk factors."""
        red_flags = []

        for i, factor in enumerate(risk_factors, 1):
            factor_name = factor.get('factor', '')
            factor_value = factor.get('value', 0)

            # Check if we have a template for this factor
            if factor_name in self.EXPLANATION_TEMPLATES:
                template = self.EXPLANATION_TEMPLATES[factor_name]
                threshold = template['threshold']

                # Check threshold (handle negative thresholds for "less than" conditions)
                should_flag = (
                    (threshold >= 0 and factor_value >= threshold) or
                    (threshold < 0 and factor_value <= abs(threshold))
                )

                if should_flag:
                    # Format description with actual values
                    description = template['description'].format(
                        value=factor_value,
                        percent=factor_value * 100
                    )

                    red_flags.append({
                        'id': i,
                        'category': template['category'],
                        'severity': template['severity'],
                        'description': description,
                        'data_points': [
                            f"{self.FEATURE_DESCRIPTIONS.get(factor_name, factor_name)}: {factor_value:.2f}"
                        ]
                    })
            else:
                # Generic red flag for unmapped features
                if abs(factor_value) > 1.0:  # Only flag significant values
                    red_flags.append({
                        'id': i,
                        'category': 'Data Anomaly',
                        'severity': RedFlagSeverity.LOW,
                        'description': f"Unusual {self.FEATURE_DESCRIPTIONS.get(factor_name, factor_name)} detected",
                        'data_points': [
                            f"{self.FEATURE_DESCRIPTIONS.get(factor_name, factor_name)}: {factor_value:.2f}"
                        ]
                    })

        return red_flags

    def _generate_summary(self, risk_level: str, fraud_probability: float, num_red_flags: int) -> str:
        """Generate executive summary based on risk level."""
        if risk_level in ["CRITICAL", "HIGH"]:
            return f"This claim shows strong indicators of fraud with a {fraud_probability*100:.1f}% probability. {num_red_flags} significant red flags were identified that warrant immediate investigation."
        elif risk_level == "MEDIUM":
            return f"This claim exhibits some suspicious patterns with a {fraud_probability*100:.1f}% fraud probability. {num_red_flags} potential red flags suggest this claim should be reviewed before payment."
        elif risk_level == "LOW":
            return f"This claim shows minor anomalies with a {fraud_probability*100:.1f}% fraud probability. While {num_red_flags} flags were detected, they may have legitimate explanations."
        else:
            return f"This claim appears normal with a low {fraud_probability*100:.1f}% fraud probability. Detected patterns fall within acceptable ranges."

    def _generate_recommendation(self, risk_level: str, red_flags: List[Dict[str, Any]]) -> str:
        """Generate recommendation based on risk level and red flags."""
        if risk_level == "CRITICAL":
            return "IMMEDIATE ACTION REQUIRED: Escalate to fraud investigation team. Do not process payment until thorough investigation is complete. Consider referring to law enforcement if fraud is confirmed."
        elif risk_level == "HIGH":
            return "Hold payment and initiate detailed review. Request additional documentation from provider and patient. Conduct interview with provider if needed. Approve only after verification."
        elif risk_level == "MEDIUM":
            return "Flag for manual review before processing. Request supporting documentation. Compare with similar claims from this provider. Approve with enhanced monitoring."
        elif risk_level == "LOW":
            return "Process with standard review procedures. Add to provider monitoring queue for pattern analysis. No immediate action required."
        else:
            return "Approve for standard processing. No additional review required."

    def _generate_confidence_explanation(self, fraud_probability: float) -> str:
        """Generate explanation of confidence level."""
        if fraud_probability >= 0.9:
            return "Extremely high confidence - Multiple strong fraud indicators align with known fraud patterns."
        elif fraud_probability >= 0.75:
            return "High confidence - Several significant fraud indicators detected across multiple categories."
        elif fraud_probability >= 0.5:
            return "Moderate confidence - Some fraud indicators present, but not conclusive without additional review."
        elif fraud_probability >= 0.25:
            return "Low confidence - Minor anomalies detected, but could be explained by legitimate circumstances."
        else:
            return "Very low confidence - Claim patterns appear normal and consistent with legitimate claims."


# Singleton instance
_explainer = None


def get_fraud_explainer() -> FraudExplainerTemplate:
    """Get singleton fraud explainer instance."""
    global _explainer
    if _explainer is None:
        _explainer = FraudExplainerTemplate()
    return _explainer
