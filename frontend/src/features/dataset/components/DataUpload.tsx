import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../../api/axios.config';

export default function DataUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        toast.error('Only CSV files are supported');
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 50MB limit');
        toast.error('File is too large. Maximum size is 50MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('claims', file);

    // Simulate progress (since we don't have actual upload progress from axios)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await apiClient.post('/dataset/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      toast.success(`Successfully uploaded ${file.name}!`);

      // Show stats if available
      if (response.data) {
        const data = response.data;
        toast.success(
          `Loaded ${data.total_claims || 0} claims, ${data.total_patients || 0} patients, ${data.total_providers || 0} providers`,
          { duration: 5000 }
        );
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      const errorMessage = err.response?.data?.detail || 'Failed to upload file';
      setError(errorMessage);
      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Simulate file input change
      const fakeEvent = {
        target: {
          files: [droppedFile],
        },
      } as any;
      handleFileChange(fakeEvent);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const clearFile = () => {
    setFile(null);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Dataset</h3>
        <p className="text-sm text-gray-600">
          Upload your insurance claims data in CSV format for fraud analysis
        </p>
      </div>

      {/* Drag and Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          file
            ? 'border-green-400 bg-green-50'
            : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />

        {!file ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Click to upload
            </label>
            <span className="text-gray-600"> or drag and drop</span>
            <p className="text-xs text-gray-500 mt-2">CSV files only, up to 50MB</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              {uploadSuccess ? (
                <CheckCircle className="h-12 w-12 text-green-600" />
              ) : error ? (
                <AlertCircle className="h-12 w-12 text-red-600" />
              ) : (
                <FileText className="h-12 w-12 text-gray-600" />
              )}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium text-gray-900">{file.name}</span>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-gray-600"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-100 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !uploadSuccess && (
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload and Process
              </>
            )}
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Upload Successful!</h4>
              <p className="text-sm text-green-700">
                Your dataset has been uploaded and is ready for fraud detection analysis.
                Go to the "Fraud Detection" tab to run the analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Format Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          CSV Format Requirements
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p className="font-medium">Your CSV file should include these columns:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code className="bg-blue-100 px-1 rounded">claim_id</code> - Unique identifier for the claim</li>
            <li><code className="bg-blue-100 px-1 rounded">patient_id</code> - Patient identifier</li>
            <li><code className="bg-blue-100 px-1 rounded">provider_id</code> - Healthcare provider identifier</li>
            <li><code className="bg-blue-100 px-1 rounded">claim_amount</code> - Claim amount in dollars</li>
            <li><code className="bg-blue-100 px-1 rounded">service_date</code> - Date of service (YYYY-MM-DD)</li>
            <li><code className="bg-blue-100 px-1 rounded">diagnosis</code> - Diagnosis code or description</li>
            <li><code className="bg-blue-100 px-1 rounded">procedure</code> - Procedure code or description</li>
          </ul>
          <p className="mt-3 text-xs text-blue-700">
            Optional: Include <code className="bg-blue-100 px-1 rounded">actual_fraud_label</code> (true/false)
            to measure detection accuracy against known fraud cases.
          </p>
        </div>
      </div>
    </div>
  );
}
