import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Shield, Target, TrendingUp, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

export default function UserGuidePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-bold text-gray-900">User Guide</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comprehensive User Guide
            </span>
          </h2>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            Everything you need to know about Healthcare Insurance Fraud Detection with AI
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">How Our AI System Works</h3>
                <p className="text-blue-100 text-sm mt-0.5">Advanced machine learning powered by Random Forest algorithms</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  Data Analysis
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  The system analyzes <strong>48+ distinct features</strong> from each healthcare claim, including claim amounts,
                  service dates, diagnosis codes, procedure codes, provider patterns, patient history, and billing anomalies.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Temporal patterns and service frequency analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Cross-referencing provider and patient relationships</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Statistical deviation from normal billing patterns</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  ML Prediction
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Our <strong>Random Forest machine learning model</strong> uses ensemble learning with multiple decision trees
                  to classify claims as fraudulent or legitimate, providing probability scores and risk levels.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Fraud probability score (0-100%)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Risk categorization (Low, Medium, High, Critical)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Confidence metrics for each prediction</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                AI-Generated Insights
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                After detection, our <strong>Local Small Language Model (SLM)</strong> generates executive summaries and actionable
                insights in plain language, transforming complex ML outputs into business intelligence that decision-makers can act upon immediately.
              </p>
            </div>
          </div>
        </div>

        {/* API & Batch Processing */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">High-Frequency Analysis Capabilities</h3>
                <p className="text-purple-100 text-sm mt-0.5">One-by-one API calls or large-scale batch processing</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              Our fraud detection system is designed for <strong>enterprise-scale operations</strong>, supporting both real-time analysis
              and batch processing to fit your workflow needs.
            </p>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-200">
                <h4 className="text-base font-bold text-gray-900 mb-2.5 flex items-center">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">API</span>
                  </div>
                  Real-Time Individual Analysis
                </h4>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Process claims <strong>one by one via REST API</strong> for real-time fraud detection during claim submission or review.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Instant fraud scoring for individual claims</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Integrate into existing claim processing workflows</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Real-time risk alerts and notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-purple-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Sub-second response times</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-md border border-purple-200">
                <h4 className="text-base font-bold text-gray-900 mb-2.5 flex items-center">
                  <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">BATCH</span>
                  </div>
                  Large-Scale Batch Processing
                </h4>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Upload and analyze <strong>thousands of claims simultaneously</strong> for comprehensive fraud audits and historical analysis.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-pink-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Process 5,000+ claims in minutes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-pink-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>CSV file upload with automatic validation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-pink-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Comprehensive reports with AI-generated insights</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-pink-600 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Exportable results for compliance teams</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mt-5">
              <p className="text-xs text-gray-700 leading-relaxed">
                <strong className="text-purple-900">Enterprise-Ready:</strong> Whether you need to check a single claim before approval
                or audit your entire claims database, our system scales to meet your needs. The same advanced ML model powers both
                API and batch processing, ensuring consistent, accurate fraud detection across all workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Fraud Types Detected */}
        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg border border-red-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">5 Types of Fraud We Detect</h3>
                <p className="text-red-100 text-sm mt-0.5">Sophisticated patterns that cost the healthcare industry billions annually</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Phantom Billing */}
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Phantom Billing</h4>
                    <p className="text-xs text-red-600 font-semibold">Critical Risk</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Billing for medical services that were <strong>never actually provided</strong> to the patient. This includes
                  services on dates when the patient had no appointment or billing for impossible combinations of procedures.
                </p>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <p className="text-xs font-semibold text-red-900 mb-1.5">How We Detect It:</p>
                  <ul className="text-xs text-gray-700 space-y-0.5">
                    <li>• Cross-reference service dates with patient visit records</li>
                    <li>• Identify billing for deceased patients</li>
                    <li>• Detect impossible procedure combinations</li>
                    <li>• Flag services outside provider specialization</li>
                  </ul>
                </div>
              </div>

              {/* Upcoding */}
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Upcoding</h4>
                    <p className="text-xs text-orange-600 font-semibold">High Risk</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Billing for <strong>more expensive services</strong> than what was actually performed. This involves using
                  procedure codes for complex treatments when simpler, less costly services were provided.
                </p>
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs font-semibold text-orange-900 mb-1.5">How We Detect It:</p>
                  <ul className="text-xs text-gray-700 space-y-0.5">
                    <li>• Compare procedure codes with diagnosis severity</li>
                    <li>• Analyze patterns of high-cost code usage</li>
                    <li>• Statistical comparison with peer providers</li>
                    <li>• Flag unusual code progression over time</li>
                  </ul>
                </div>
              </div>

              {/* Unbundling */}
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🔗</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Unbundling</h4>
                    <p className="text-xs text-yellow-600 font-semibold">Medium Risk</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Separating procedures that should be <strong>billed together</strong> into multiple individual claims to
                  increase total reimbursement. This artificially inflates costs by avoiding bundled pricing.
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">How We Detect It:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Identify related procedures billed separately</li>
                    <li>• Check against standard bundled code lists</li>
                    <li>• Temporal proximity analysis of related services</li>
                    <li>• Pattern recognition across provider billing history</li>
                  </ul>
                </div>
              </div>

              {/* Duplicate Claims */}
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Duplicate Claims</h4>
                    <p className="text-xs text-blue-600 font-semibold">Medium-High Risk</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Submitting the <strong>same claim multiple times</strong> for a single service. This can be intentional fraud
                  or result from poor record-keeping, but either way leads to improper reimbursement.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">How We Detect It:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Match identical claim details across submissions</li>
                    <li>• Same patient, provider, date, and procedure</li>
                    <li>• Near-duplicate detection with minor variations</li>
                    <li>• Time-window analysis for submission patterns</li>
                  </ul>
                </div>
              </div>

              {/* Excessive Services */}
              <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Excessive Services</h4>
                    <p className="text-xs text-purple-600 font-semibold">Variable Risk</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  Billing for <strong>medically unnecessary services</strong> or an unreasonable volume of services. This includes
                  over-treatment patterns that significantly exceed medical standards.
                </p>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">How We Detect It:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Compare service frequency vs. medical norms</li>
                    <li>• Analyze patient visit patterns over time</li>
                    <li>• Statistical outlier detection for provider volume</li>
                    <li>• Inappropriate frequency for specific procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Best Practices for Maximum Accuracy</h3>
                <p className="text-green-100 text-sm mt-0.5">Get the most out of our fraud detection system</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Use Complete Data</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Ensure your CSV files include all required fields: claim IDs, patient IDs, provider IDs, service dates,
                  diagnosis codes, procedure codes, and claim amounts. Missing data reduces detection accuracy.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Review High-Risk Claims First</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Focus investigation efforts on claims flagged as CRITICAL or HIGH risk. Use the multi-select filter to view
                  multiple risk levels and prioritize based on claim amounts and fraud probability scores.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Understand Risk Factors</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Click "View Details" on any claim to see the top contributing risk factors. These explain WHY the AI flagged
                  a claim, helping you understand the model's decision-making process.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Export for Investigation</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Use the "Export PDF" feature to generate comprehensive reports for your compliance team. PDFs include
                  executive summaries, visual analytics, and key insights for documentation.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Regular Analysis</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Run fraud detection regularly on new claims batches. Early detection prevents losses and identifies
                  emerging fraud patterns before they become widespread.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">Verify AI Insights</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  AI predictions are powerful tools, not final verdicts. Always conduct human review of flagged claims and
                  use the system's insights as a starting point for deeper investigation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs Summary */}
        <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 text-center">System Capabilities at a Glance</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-1">48+</div>
              <div className="text-gray-300 text-xs">Features Analyzed<br/>Per Claim</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-1">5</div>
              <div className="text-gray-300 text-xs">Major Fraud Types<br/>Detected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-1">4</div>
              <div className="text-gray-300 text-xs">Risk Levels<br/>Categorized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-1">∞</div>
              <div className="text-gray-300 text-xs">Claims Processable<br/>in Batch</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
