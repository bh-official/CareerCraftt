"use client";

import { useState, useEffect } from "react";
import { Edit3, Save, RefreshCw, Copy, Check } from "lucide-react";

export default function CoverLetterEditor({
  initialContent,
  onSave,
  sessionId,
}) {
  const [content, setContent] = useState(initialContent || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(content);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatLetter = (text) => {
    if (!text) return [];

    const paragraphs = text.split("\n\n").filter((p) => p.trim());
    return paragraphs;
  };

  const paragraphs = formatLetter(content);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">Cover Letter</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {content.length} characters • ~{Math.ceil(content.length / 200)} min
            read
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 sm:h-96 p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="Write your cover letter here..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            {paragraphs.length > 0 ? (
              <div className="space-y-4">
                {paragraphs.map((para, index) => (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base"
                  >
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">
                No cover letter generated yet. Run analysis to generate one.
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {isEditing && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
