"""
Test script to demonstrate fraud pattern extensibility.
Shows how easy it is to work with and query fraud patterns.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dataset.medical_codes import FRAUD_PATTERNS


def analyze_fraud_patterns():
    """Analyze and display all fraud patterns in the system."""
    print("=" * 80)
    print("HEALTH INSURANCE FRAUD DETECTION SYSTEM - PATTERN ANALYSIS")
    print("=" * 80)
    print()

    total_patterns = len(FRAUD_PATTERNS)
    print(f"📊 Total Fraud Patterns: {total_patterns}")
    print()

    # Group by severity
    by_severity = {}
    by_difficulty = {}
    total_avg_loss = 0

    for pattern_name, pattern_data in FRAUD_PATTERNS.items():
        severity = pattern_data.get('severity', 'unknown')
        difficulty = pattern_data.get('detection_difficulty', 'unknown')
        avg_loss = pattern_data.get('avg_loss', 0)

        by_severity[severity] = by_severity.get(severity, 0) + 1
        by_difficulty[difficulty] = by_difficulty.get(difficulty, 0) + 1
        total_avg_loss += avg_loss

    # Display summary statistics
    print("📈 SUMMARY STATISTICS")
    print("-" * 80)
    print(f"Average Loss per Pattern: ${total_avg_loss / total_patterns:,.0f}")
    print(f"Total Estimated Annual Loss (assuming 1000 incidents each): ${total_avg_loss * 1000:,.0f}")
    print()

    print("Patterns by Severity:")
    for severity, count in sorted(by_severity.items()):
        print(f"  • {severity.upper()}: {count} patterns")
    print()

    print("Patterns by Detection Difficulty:")
    for difficulty, count in sorted(by_difficulty.items()):
        print(f"  • {difficulty.title()}: {count} patterns")
    print()

    # Display all patterns
    print("=" * 80)
    print("📋 ALL FRAUD PATTERNS")
    print("=" * 80)
    print()

    for i, (pattern_name, pattern_data) in enumerate(FRAUD_PATTERNS.items(), 1):
        severity = pattern_data.get('severity', 'unknown').upper()
        avg_loss = pattern_data.get('avg_loss', 0)
        difficulty = pattern_data.get('detection_difficulty', 'unknown')
        graph_pattern = pattern_data.get('graph_pattern')

        # Color coding based on severity
        severity_emoji = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🟢',
        }.get(severity, '⚪')

        print(f"{i}. {severity_emoji} {pattern_name.upper().replace('_', ' ')}")
        print(f"   Description: {pattern_data['description']}")
        print(f"   Severity: {severity} | Detection: {difficulty.title()} | Avg Loss: ${avg_loss:,.0f}")

        if 'indicators' in pattern_data:
            indicators = ', '.join(pattern_data['indicators'])
            print(f"   Indicators: {indicators}")

        if graph_pattern:
            print(f"   Graph Pattern: {graph_pattern}")

        print()

    # Display patterns requiring graph analysis
    print("=" * 80)
    print("🕸️  PATTERNS REQUIRING GRAPH ANALYSIS")
    print("=" * 80)
    print()

    graph_patterns = [(name, data) for name, data in FRAUD_PATTERNS.items()
                      if data.get('graph_pattern')]

    if graph_patterns:
        for pattern_name, pattern_data in graph_patterns:
            print(f"• {pattern_name.replace('_', ' ').title()}")
            print(f"  Graph Pattern: {pattern_data['graph_pattern']}")
            print(f"  Why Graph?: Complex network relationships needed for detection")
            print()
    else:
        print("No patterns currently require graph analysis.")
        print()

    # Display critical patterns
    print("=" * 80)
    print("⚠️  CRITICAL SEVERITY PATTERNS (Priority Detection)")
    print("=" * 80)
    print()

    critical_patterns = [(name, data) for name, data in FRAUD_PATTERNS.items()
                         if data.get('severity') == 'critical']

    for pattern_name, pattern_data in critical_patterns:
        print(f"🔴 {pattern_name.upper().replace('_', ' ')}")
        print(f"   {pattern_data['description']}")
        print(f"   Average Loss: ${pattern_data.get('avg_loss', 0):,.0f}")
        print()

    print("=" * 80)
    print("✅ PATTERN SYSTEM READY FOR ML TRAINING")
    print("=" * 80)
    print()
    print("Next Steps:")
    print("1. Generate synthetic data with these patterns")
    print("2. Load into Memgraph graph database")
    print("3. Extract features for ML model training")
    print("4. Train fraud detection classifier")
    print("5. Deploy and monitor in production")
    print()


def demonstrate_extensibility():
    """Show how easy it is to add a new pattern."""
    print("=" * 80)
    print("🎯 DEMONSTRATING EXTENSIBILITY")
    print("=" * 80)
    print()

    print("To add a NEW fraud pattern, simply add to FRAUD_PATTERNS dict:")
    print()
    print("```python")
    print('FRAUD_PATTERNS = {')
    print('    # ... existing patterns ...')
    print()
    print('    "your_new_pattern": {')
    print('        "description": "What the fraud is",')
    print('        "indicators": ["signal1", "signal2"],')
    print('        "severity": "high",')
    print('        "avg_loss": 2000,')
    print('        "detection_difficulty": "medium"')
    print('    }')
    print('}')
    print("```")
    print()
    print("That's it! No other code changes needed.")
    print("The pattern will automatically:")
    print("  ✓ Be available in data generation")
    print("  ✓ Be included in ML feature extraction")
    print("  ✓ Appear in frontend visualizations")
    print("  ✓ Be tracked in analytics dashboards")
    print()


if __name__ == "__main__":
    analyze_fraud_patterns()
    demonstrate_extensibility()
