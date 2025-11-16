import React, { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import DocumentCard from './DocumentCard';
import DocumentModal from './DocumentModal';

const DocumentsList = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { documents, loading, error } = useDocuments();

  const filteredDocuments = documents.filter(doc => 
    !selectedCategory || doc.category?.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await fetch(`/api/download/${documentId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${documentId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      const response = await fetch(`/api/delete/${documentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Document will be removed from the list automatically via context refresh
        console.log('Document deleted successfully');
      } else {
        console.error('Delete failed:', await response.text());
        alert('Failed to delete document. Please try again.');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document. Please check your connection.');
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover-lift transition-all duration-300">
          <div className="flex flex-col justify-center items-center py-20 px-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg font-medium text-gray-700">Processing documents...</p>
              <p className="text-sm text-gray-500 mt-1">AI analysis in progress</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover-lift transition-all duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 lg:p-5 border-b border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-3">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Processed Documents</h2>
              <p className="text-xs lg:text-sm text-gray-600 mt-0.5">Smart categorization and AI analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-3 py-2 pr-9 text-xs lg:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
              >
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
                <option value="Procurement">Procurement</option>
                <option value="HR">HR</option>
                <option value="Legal">Legal</option>
                <option value="Safety">Safety</option>
                <option value="Regulatory">Regulatory</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs lg:text-sm font-medium text-blue-700">
                {filteredDocuments.length} doc{filteredDocuments.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="p-4 lg:p-5">
          {!loading && filteredDocuments.length === 0 && (
            <div className="text-center py-20">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <FileText className="h-16 w-16 text-blue-500" />
                </div>
                <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedCategory ? `No ${selectedCategory} Documents` : 'No Documents Yet'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {selectedCategory 
                  ? `No documents found in ${selectedCategory} category. Try selecting a different category or upload a new document.`
                  : 'Get started by uploading your first document. Our AI will automatically process and categorize it for you.'}
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-8">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-medium shadow-sm">
                  🤖 AI Powered
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-sm font-medium shadow-sm">
                  ⚡ Instant Processing
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-full text-sm font-medium shadow-sm">
                  🎯 Smart Categorization
                </div>
              </div>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Show All Documents
                </button>
              )}
            </div>
          )}
          {filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  onView={handleViewDetails}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentModal 
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DocumentsList;
