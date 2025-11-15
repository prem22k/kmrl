import React from 'react';
import { X, Download, FileText, Clock, Tag, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

const DocumentModal = ({ document, isOpen, onClose }) => {
  if (!isOpen || !document) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/download/${document.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Safety': 'bg-red-100 text-red-800 border-red-300',
      'Finance': 'bg-green-100 text-green-800 border-green-300',
      'HR': 'bg-blue-100 text-blue-800 border-blue-300',
      'Engineering': 'bg-purple-100 text-purple-800 border-purple-300',
      'Reports': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Legal': 'bg-gray-100 text-gray-800 border-gray-300',
      'Internal': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'Procurement': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Regulatory': 'bg-orange-100 text-orange-800 border-orange-300',
      'Other': 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[category] || colors['Other'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-gradient-to-r from-red-500 to-pink-500',
      'Medium': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'Low': 'bg-gradient-to-r from-green-500 to-emerald-500'
    };
    return colors[priority] || colors['Low'];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{document.filename}</h2>
                    <p className="text-blue-100 text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Uploaded {formatDate(document.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 ${getCategoryColor(document.category)}`}>
                    <Tag className="inline h-4 w-4 mr-1" />
                    {document.category}
                  </span>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                    <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(document.priority)} animate-pulse`}></div>
                    <span className="text-sm font-medium">{document.priority} Priority</span>
                  </div>
                  {document.size && (
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      {Math.round(document.size / 1024)} KB
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 group"
                aria-label="Close modal"
              >
                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)] bg-gradient-to-b from-gray-50 to-white">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">File Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Size:</span> {document.size ? `${Math.round(document.size / 1024)} KB` : 'Unknown'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Type:</span> {document.filename?.split('.').pop()?.toUpperCase() || 'Unknown'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Format:</span> Document
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Processing Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Text Extraction
                </p>
                <p className="text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> AI Analysis
                </p>
                <p className="text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Categorization
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Classification</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Department:</span> {document.category}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Priority:</span> {document.priority}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Auto-Assigned</span>
                </p>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">AI Analysis Summary</h3>
            </div>
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {document.analysis || 'No analysis available'}
              </p>
            </div>
          </div>

          {/* Extracted Text */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Extracted Content</h3>
            </div>
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {document.extractedText || 'No text content available'}
              </pre>
            </div>
          </div>

          {/* Key Information */}
          {document.keyPoints && document.keyPoints.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Key Points</h3>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-6 rounded-xl shadow-sm">
                <ul className="space-y-3">
                  {document.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="inline-block w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Items */}
          {document.actionItems && document.actionItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Action Items</h3>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 rounded-xl shadow-sm">
                <ul className="space-y-3">
                  {document.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <span className="inline-block w-6 h-6 bg-red-400 text-red-900 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        !
                      </span>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-500 font-mono">
            ID: <span className="font-semibold text-gray-700">{document.id}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <Download className="w-4 h-4" />
              Download Original
            </button>
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
