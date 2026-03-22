"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * FileUploader Component
 *
 * A drag-and-drop file upload component with validation,
 * progress tracking, and accessibility features.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onFileSelect - Callback when file is selected and processed
 * @param {string} props.label - Label for the upload area
 * @param {string} props.accept - Accepted file types (default: .pdf,.docx,.txt)
 * @param {number} props.maxSize - Maximum file size in bytes (default: 5MB)
 * @param {boolean} props.disabled - Whether the uploader is disabled
 * @returns {JSX.Element} The FileUploader component
 */

export default function FileUploader({
  onFileSelect,
  label = "Upload file",
  accept = ".pdf,.docx,.txt",
  maxSize = 5 * 1024 * 1024,
  disabled = false,
}) {
  const uploadId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const validateFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(ext)) {
      return "Invalid file type. Please upload PDF, DOCX, or TXT files.";
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
    }

    return null;
  };

  const handleFile = async (file) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(file);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      onFileSelect({
        name: file.name,
        text: data.text,
        type: file.type,
      });
    } catch (err) {
      setError("Failed to process file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [disabled],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full" role="region" aria-label={label}>
      {/* Screen reader announcement for status */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {uploading
          ? "Uploading file..."
          : error
            ? `Error: ${error}`
            : file
              ? `File selected: ${file.name}`
              : ""}
      </div>
      {file ? (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">{file.name}</p>
              <p className="text-sm text-green-700">
                {uploading ? "Processing..." : "Ready"}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            disabled={disabled}
            className="p-1 hover:bg-green-100 rounded transition-colors"
            aria-label={`Remove file ${file.name}`}
          >
            <X className="w-5 h-5 text-green-700" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${label}. ${isDragging ? "Drop file here" : "Click or drag to upload"}`}
          aria-describedby={error ? `${uploadId}-error` : undefined}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              // Trigger file input click
              document.getElementById(uploadId)?.click();
            }
          }}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />

          <p className="text-gray-700 font-medium">{label}</p>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PDF, DOCX, TXT (max {Math.round(maxSize / 1024 / 1024)}MB)
          </p>
        </div>
      )}

      {error && (
        <div
          id={`${uploadId}-error`}
          role="alert"
          className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle
            className="w-5 h-5 text-red-600 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
