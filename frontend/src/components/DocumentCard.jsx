/**
 * Optimized Document Card Component with React.memo
 * Prevents unnecessary re-renders
 */

import React, { memo, useCallback } from 'react';
import { FileText, Download, Eye, Clock, Trash2 } from 'lucide-react';

const DocumentCard = memo(function DocumentCard({ document, onView, onDownload, onDelete }) {
  // Category color mapping
  const categoryColors = {
    Engineering: 'bg-purple-100 text-purple-700 border-purple-200',
    Finance: 'bg-green-100 text-green-700 border-green-200',
    Procurement: 'bg-blue-100 text-blue-700 border-blue-200',
    HR: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Legal: 'bg-gray-100 text-gray-700 border-gray-200',
    Safety: 'bg-red-100 text-red-700 border-red-200',
    Regulatory: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Other: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  // Priority colors and icons
  const priorityConfig = {
    High: { color: 'text-red-600', icon: '🔴', label: 'High Priority' },
    Medium: { color: 'text-yellow-600', icon: '🟡', label: 'Medium Priority' },
    Low: { color: 'text-green-600', icon: '🟢', label: 'Low Priority' }
  };

  const priority = priorityConfig[document.priority] || priorityConfig.Low;
  const categoryColor = categoryColors[document.category] || categoryColors.Other;

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  }, []);

  // Truncate text
  const truncate = useCallback((text, length = 150) => {
    if (!text) return 'No analysis available';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }, []);

  const handleView = useCallback(() => {
    onView(document);
  }, [document, onView]);

  const handleDownload = useCallback((e) => {
    e.stopPropagation();
    onDownload(document.id);
  }, [document.id, onDownload]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${document.filename}"?`)) {
      onDelete(document.id);
    }
  }, [document.id, document.filename, onDelete]);

  return (
    <article
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden"
      onClick={handleView}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${document.filename}`}
      onKeyPress={(e) => e.key === 'Enter' && handleView()}
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
          <FileText className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 
            className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors text-sm mb-0.5" 
            title={document.filename}
          >
            {document.filename}
          </h3>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs text-gray-500 truncate" aria-label={`Uploaded at ${formatDate(document.uploadedAt)}`}>
              {formatDate(document.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Category and Priority Badges */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span 
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColor} truncate max-w-[100px]`}
          aria-label={`Category: ${document.category}`}
          title={document.category}
        >
          {document.category}
        </span>
        <span 
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color} bg-white border border-current flex items-center gap-0.5 flex-shrink-0`}
          aria-label={priority.label}
        >
          <span aria-hidden="true" className="text-[10px]">{priority.icon}</span> 
          <span className="text-xs">{document.priority}</span>
        </span>
        <span className="text-xs text-gray-500 ml-auto flex-shrink-0" aria-label={`File size: ${formatFileSize(document.size)}`}>
          {formatFileSize(document.size)}
        </span>
      </div>

      {/* Analysis Preview */}
      <div className="mb-3 overflow-hidden">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2" aria-label="Document analysis">
          {truncate(document.analysis, 100)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100">
        <button
          onClick={handleView}
          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium text-xs shadow-sm hover:shadow-md whitespace-nowrap"
          aria-label="View document details"
        >
          <Eye className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>View</span>
        </button>
        <button
          onClick={handleDownload}
          className="px-2.5 py-1.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-all duration-300 font-medium text-xs flex-shrink-0"
          aria-label="Download document"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          onClick={handleDelete}
          className="px-2.5 py-1.5 bg-white border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all duration-300 font-medium text-xs flex-shrink-0"
          aria-label="Delete document"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.document.id === nextProps.document.id &&
    prevProps.document.uploadedAt === nextProps.document.uploadedAt &&
    prevProps.onView === nextProps.onView &&
    prevProps.onDownload === nextProps.onDownload &&
    prevProps.onDelete === nextProps.onDelete
  );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
