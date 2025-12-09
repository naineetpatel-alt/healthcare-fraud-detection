"""
OpenAI service for generating executive summaries, insights, and enhanced explanations.
"""
from typing import Dict, List, Any, Optional
import json
from openai import OpenAI
from app.config import settings


class OpenAIService:
    """Service for OpenAI-powered fraud analysis enhancements."""

    def __init__(self):
        """Initialize OpenAI client."""
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    def generate_executive_summary(self, fraud_results: List[Dict[str, Any]], statistics: Dict[str, Any]) -> str:
        """
        Generate an executive summary of fraud detection results.

        Args:
            fraud_results: List of fraud assessments
            statistics: Overall fraud statistics

        Returns:
            Executive summary as markdown text
        """
        # Prepare data for prompt
        total_claims = len(fraud_results)
        fraud_detected = sum(1 for r in fraud_results if r.get('is_fraud_predicted', False))
        fraud_rate = (fraud_detected / total_claims * 100) if total_claims > 0 else 0

        # Calculate risk distribution
        risk_distribution = {
            'CRITICAL': sum(1 for r in fraud_results if r.get('risk_level') == 'CRITICAL'),
            'HIGH': sum(1 for r in fraud_results if r.get('risk_level') == 'HIGH'),
            'MEDIUM': sum(1 for r in fraud_results if r.get('risk_level') == 'MEDIUM'),
            'LOW': sum(1 for r in fraud_results if r.get('risk_level') == 'LOW'),
        }

        # Calculate financial impact
        total_amount = sum(r.get('claim_amount', 0) for r in fraud_results)
        fraud_amount = sum(r.get('claim_amount', 0) for r in fraud_results if r.get('is_fraud_predicted', False))

        # Get top fraud types
        fraud_types = {}
        for result in fraud_results:
            if result.get('is_fraud_predicted') and result.get('actual_fraud_type'):
                fraud_type = result.get('actual_fraud_type', 'Unknown')
                fraud_types[fraud_type] = fraud_types.get(fraud_type, 0) + 1

        top_fraud_types = sorted(fraud_types.items(), key=lambda x: x[1], reverse=True)[:3]

        prompt = f"""Analyze these healthcare fraud detection results and generate an executive summary for health insurance executives and compliance officers.

FRAUD DETECTION RESULTS:
- Total healthcare claims analyzed: {total_claims:,}
- Potentially fraudulent claims identified: {fraud_detected:,} ({fraud_rate:.1f}%)
- Total claim amount reviewed: ${total_amount:,.2f}
- Estimated fraudulent amount: ${fraud_amount:,.2f}

RISK DISTRIBUTION:
- Critical Risk (Immediate Investigation): {risk_distribution['CRITICAL']} claims
- High Risk (Priority Review): {risk_distribution['HIGH']} claims
- Medium Risk (Standard Review): {risk_distribution['MEDIUM']} claims
- Low Risk (Monitor): {risk_distribution['LOW']} claims

TOP FRAUD PATTERNS DETECTED:
{chr(10).join(f"- {ftype}: {count} cases" for ftype, count in top_fraud_types) if top_fraud_types else "- No specific fraud patterns identified"}

Generate a professional executive summary with the following structure:

**OVERVIEW**
Brief opening statement about the scope and scale of the analysis.

**KEY FINDINGS**
- Fraud detection rate and financial exposure
- Most significant risk categories
- Primary fraud patterns (phantom billing, upcoding, unbundling, etc.)

**RISK ASSESSMENT**
Analysis of risk distribution and potential impact on plan integrity and member care.

**RECOMMENDED ACTIONS**
Specific, prioritized actions for fraud investigation team and claims processing.

Use professional healthcare language. Focus on patient safety, compliance, and financial protection. Keep it clear, concise, and actionable."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a healthcare fraud analysis expert who creates executive summaries for health insurance executives and compliance officers. Your summaries are clear, professional, and action-oriented, focusing on patient safety and financial integrity."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating executive summary: {e}")
            # Fallback to template summary
            return self._fallback_summary(total_claims, fraud_detected, fraud_rate, fraud_amount, total_amount, risk_distribution)

    def generate_dynamic_insights(self, fraud_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate dynamic insights based on fraud patterns.

        Args:
            fraud_results: List of fraud assessments

        Returns:
            List of insights with title, description, impact, action
        """
        # Analyze patterns for prompt
        fraud_cases = [r for r in fraud_results if r.get('is_fraud_predicted', False)]

        if not fraud_cases:
            return [{
                'title': 'No Fraud Detected',
                'description': 'All analyzed claims appear legitimate based on current patterns.',
                'impact': 'Low',
                'action': 'Continue monitoring for emerging patterns.'
            }]

        # Extract patterns
        high_risk_count = sum(1 for r in fraud_cases if r.get('risk_level') in ['CRITICAL', 'HIGH'])
        avg_fraud_amount = sum(r.get('claim_amount', 0) for r in fraud_cases) / len(fraud_cases) if fraud_cases else 0

        # Top risk factors
        all_risk_factors = {}
        for result in fraud_cases:
            for rf in result.get('risk_factors', [])[:2]:  # Top 2 per case
                factor = rf.get('factor', '')
                if factor:
                    all_risk_factors[factor] = all_risk_factors.get(factor, 0) + 1

        top_risk_factors = sorted(all_risk_factors.items(), key=lambda x: x[1], reverse=True)[:5]

        prompt = f"""Based on healthcare fraud detection results, generate 3-5 key insights as actionable data points.

HEALTHCARE FRAUD ANALYSIS:
- Total potentially fraudulent claims: {len(fraud_cases)}
- High/Critical risk claims requiring immediate review: {high_risk_count}
- Average fraudulent claim amount: ${avg_fraud_amount:,.2f}

TOP RISK FACTORS IDENTIFIED ACROSS CASES:
{chr(10).join(f"- {factor}: {count} occurrences" for factor, count in top_risk_factors) if top_risk_factors else "- None identified"}

For each insight (3-5 total), provide as JSON focused on healthcare fraud patterns:
{{
    "title": "Concise, professional title (5-8 words)",
    "description": "Clear description highlighting healthcare fraud implications (1-2 sentences)",
    "impact": "High|Medium|Low",
    "action": "Specific recommended action for Special Investigations Unit"
}}

Focus on healthcare-specific fraud patterns like phantom billing, upcoding, unbundling, duplicate billing, and medical necessity issues. Return as a JSON array."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a healthcare fraud analyst who generates actionable insights for Special Investigations Units. Respond only with valid JSON array."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            content = response.choices[0].message.content.strip()
            # Extract JSON if wrapped in markdown
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:].strip()

            insights = json.loads(content)
            return insights if isinstance(insights, list) else [insights]
        except Exception as e:
            print(f"Error generating insights: {e}")
            # Fallback insights
            return self._fallback_insights(len(fraud_cases), high_risk_count, top_risk_factors)

    def enhance_fraud_explanation(
        self,
        template_explanation: Dict[str, Any],
        claim_data: Dict[str, Any],
        risk_factors: List[Dict[str, Any]]
    ) -> str:
        """
        Enhance template fraud explanation with natural language.

        Args:
            template_explanation: Template-generated explanation
            claim_data: Claim details
            risk_factors: List of risk factors

        Returns:
            Enhanced explanation text
        """
        # Extract key data
        summary = template_explanation.get('summary', '')
        red_flags = template_explanation.get('red_flags', [])
        recommendation = template_explanation.get('recommendation', '')

        prompt = f"""Take this technical healthcare fraud explanation and rewrite it for health insurance executives and compliance officers:

TECHNICAL EXPLANATION:
{summary}

CLAIM DETAILS:
- Claim ID: {claim_data.get('claim_id', 'N/A')}
- Claim Amount: ${claim_data.get('claim_amount', 0):,.2f}
- Diagnosis Code: {claim_data.get('diagnosis', 'N/A')}
- Procedure Code: {claim_data.get('procedure', 'N/A')}
- Fraud Probability: {claim_data.get('fraud_probability', 0) * 100:.1f}%
- Risk Level: {claim_data.get('risk_level', 'Unknown')}

RED FLAGS IDENTIFIED ({len(red_flags)}):
{chr(10).join(f"- {flag.get('description', '')}" for flag in red_flags[:3])}

RECOMMENDATION:
{recommendation}

Rewrite this explanation focusing on:
- Healthcare-specific context (medical necessity, billing codes, provider patterns)
- Clear explanation suitable for insurance executives (under 150 words)
- Compliance and fraud implications
- Specific to this claim's clinical and billing data
- Actionable next steps for Special Investigations Unit

Emphasize financial impact, patient safety implications, compliance risks, and investigation priority."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a healthcare fraud analyst who explains complex healthcare fraud cases to insurance executives and compliance officers in clear, professional language."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error enhancing explanation: {e}")
            # Return original summary as fallback
            return summary

    def _fallback_summary(
        self,
        total_claims: int,
        fraud_detected: int,
        fraud_rate: float,
        fraud_amount: float,
        total_amount: float,
        risk_distribution: Dict[str, int]
    ) -> str:
        """Generate fallback summary when AI fails."""
        return f"""**OVERVIEW**

Our healthcare fraud detection system has completed analysis of {total_claims:,} medical claims, identifying {fraud_detected:,} potentially fraudulent cases ({fraud_rate:.1f}% fraud rate). The estimated fraudulent amount totals ${fraud_amount:,.2f} against ${total_amount:,.2f} in total claim volume.

**KEY FINDINGS**

Risk assessment has categorized {risk_distribution['CRITICAL']} claims as critical priority requiring immediate investigation by the Special Investigations Unit, {risk_distribution['HIGH']} claims as high-priority review cases, {risk_distribution['MEDIUM']} claims for standard review protocols, and {risk_distribution['LOW']} claims for routine monitoring. The concentration of critical and high-risk cases indicates patterns warranting immediate attention to protect plan integrity and ensure compliance with healthcare regulations.

**RISK ASSESSMENT**

The identified fraud patterns present significant exposure across multiple risk dimensions including financial loss, compliance violations, and potential impact on member care quality. Critical-risk cases demonstrate multiple fraud indicators requiring urgent action to prevent further fraudulent activity and protect plan assets.

**RECOMMENDED ACTIONS**

1. Immediately refer all {risk_distribution['CRITICAL']} critical-risk claims to Special Investigations Unit for comprehensive fraud investigation
2. Hold {risk_distribution['HIGH']} high-risk claims for enhanced documentation review and provider verification before processing
3. Implement enhanced monitoring protocols for medium-risk claims through standard Special Investigations Unit channels
4. Update provider risk profiles based on detected patterns to strengthen prospective fraud prevention

This analysis provides actionable intelligence to protect plan financial integrity and ensure compliance with healthcare fraud prevention requirements."""

    def _fallback_insights(
        self,
        fraud_count: int,
        high_risk_count: int,
        top_risk_factors: List[tuple]
    ) -> List[Dict[str, Any]]:
        """Generate fallback insights when OpenAI fails."""
        insights = [
            {
                'title': 'Fraud Detection Rate Analysis',
                'description': f'Detected {fraud_count} fraudulent claims with {high_risk_count} requiring immediate attention.',
                'impact': 'High' if high_risk_count > 5 else 'Medium',
                'action': 'Prioritize investigation of high and critical risk cases.'
            }
        ]

        if top_risk_factors and len(top_risk_factors) > 0:
            top_factor = top_risk_factors[0]
            insights.append({
                'title': f'Top Risk Factor: {top_factor[0].replace("_", " ").title()}',
                'description': f'This risk factor appeared in {top_factor[1]} fraud cases, indicating a significant pattern.',
                'impact': 'High',
                'action': f'Investigate all cases with elevated {top_factor[0].replace("_", " ")} values.'
            })

        insights.append({
            'title': 'Enhanced Monitoring Recommended',
            'description': 'Continue monitoring for emerging fraud patterns and update detection models regularly.',
            'impact': 'Medium',
            'action': 'Schedule quarterly review of fraud detection accuracy and patterns.'
        })

        return insights


# Singleton instance
_openai_service = None


def get_openai_service() -> OpenAIService:
    """Get singleton OpenAI service instance."""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
