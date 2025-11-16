import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DocumentContext = createContext();

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents');
      const newDocuments = response.data.documents.map(document => ({
        id: document.id,
        filename: document.filename,
        category: document.category,
        priority: document.priority,
        analysis: document.analysis,
        extractedText: document.extractedText,
        size: document.size,
        uploadedAt: document.uploadedAt
      }));
      setDocuments(newDocuments);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      setLoading(true);
      const response = await axios.post('/api/process-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh documents list after successful upload
      await fetchDocuments();
      return response.data;
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      await axios.delete(`/api/delete/${documentId}`);
      
      // Immediately remove from local state for instant feedback
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
      
      // Also refresh from server to ensure sync
      await fetchDocuments();
      
      return { success: true };
    } catch (err) {
      console.error('Delete error:', err);
      throw new Error(err.response?.data?.message || 'Delete failed');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const value = {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    setError
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};
