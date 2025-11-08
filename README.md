# KMRL Smart Document Automation

> 🚇 AI-powered document processing system for Kochi Metro Rail Limited (KMRL) that automates OCR, categorization, and intelligent analysis of documents.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Supported File Types](#-supported-file-types)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

KMRL Smart Document Automation is a full-stack web application designed to streamline document management for government organizations. The system leverages AI and OCR technologies to:

- **Extract text** from images, PDFs, Word documents, and text files
- **Analyze content** using Google's Gemini AI API for intelligent summarization
- **Auto-categorize** documents by department (Engineering, Finance, HR, Safety, etc.)
- **Assign priorities** based on content analysis (High, Medium, Low)
- **Store securely** in Azure Blob Storage
- **Display beautifully** in a modern React dashboard with real-time updates

Built for the **Smart India Hackathon 2025**, this MVP demonstrates how automation can reduce manual document processing time by up to 80%.

---

## ✨ Features

### Core Capabilities

✅ **Multi-Format OCR Processing**
- Tesseract.js for image OCR (supports English + Malayalam)
- pdf-parse for PDF text extraction
- Mammoth for DOCX document processing
- Direct text file reading

✅ **AI-Powered Analysis**
- Google Gemini API integration for content summarization
- Intelligent categorization using keyword matching + AI
- Automatic priority detection based on urgency indicators
- Structured JSON output for consistent data handling

✅ **Smart Categorization**
- 8 predefined categories: Engineering, Finance, Procurement, HR, Legal, Safety, Regulatory, Other
- Hybrid approach: AI analysis + rule-based keyword validation
- Department-specific routing and notifications

✅ **Modern React Dashboard**
- Drag-and-drop file upload interface
- Real-time processing status updates
- Filterable document list by category
- Detailed document view with full metadata
- Responsive design with Tailwind CSS
- Smooth animations and transitions

✅ **Cloud Integration**
- Azure Blob Storage support for file persistence
- Fallback to local storage for development/demo
- Configurable storage containers

✅ **Console Notifications**
- Real-time upload notifications with emoji indicators
- Department-specific routing messages
- Priority-based alerts

---

## 🏗 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** (v18+) | Server runtime |
| **Express.js** (v5.1) | Web framework |
| **Tesseract.js** (v6.0) | OCR engine for image text extraction |
| **pdf-parse** (v1.1) | PDF text extraction |
| **Mammoth** (v1.10) | DOCX document processing |
| **Multer** (v2.0) | File upload handling |
| **Azure Blob Storage SDK** | Cloud file storage |
| **Google Gemini API** | AI-powered content analysis |
| **dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React** (v18.3) | UI framework |
| **Tailwind CSS** (v3.4) | Utility-first styling |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Modern icon library |
| **React Context API** | State management |

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm
- Azure Storage account (optional, for cloud storage)
- Google Gemini API key (for AI analysis)

### Step 1: Clone the Repository

```bash
git clone https://github.com/prem22k/kmrl.git
cd kmrl
```

### Step 2: Backend Setup

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials (see Configuration section)
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Return to root
cd ..
```

---

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Azure Storage (Optional - for production)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=yourkey;EndpointSuffix=core.windows.net
AZURE_CONTAINER_NAME=documents

# Google Gemini API (Required for AI analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
NODE_ENV=development
```

### Getting API Keys

1. **Gemini API Key**: 
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy and paste into `.env`

2. **Azure Storage** (Optional):
   - Create an Azure Storage account
   - Navigate to "Access Keys" in Azure Portal
   - Copy the connection string

---

## 💻 Usage

### Development Mode

**Terminal 1 - Backend Server:**
```bash
# From root directory
npm start
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend Dev Server:**
```bash
# From root directory
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

The frontend will automatically proxy API requests to `http://localhost:5000`.

### Production Mode

```bash
# Build the React frontend
cd frontend
npm run build
cd ..

# Set environment to production
export NODE_ENV=production

# Start the server (serves both API and built frontend)
npm start
# Application runs on http://localhost:5000
```

### Demo Workflow

1. **Open** http://localhost:3000 (dev) or http://localhost:5000 (production)
2. **Upload** a document (image, PDF, DOCX, or TXT)
3. **Watch** as the system:
   - Extracts text using OCR
   - Analyzes content with Gemini AI
   - Categorizes by department
   - Assigns priority level
4. **View** the processed document in the dashboard
5. **Filter** documents by category
6. **Click** on a document to view full details

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### `POST /api/process-file`
Upload and process a document.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `document` (file)

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid-v4-string",
    "filename": "safety_circular.jpg",
    "category": "Safety",
    "priority": "High",
    "analysis": "Document summary from AI...",
    "extractedText": "Full extracted text...",
    "uploadedAt": "2025-11-09T10:30:00.000Z",
    "size": 245678
  }
}
```

#### `GET /api/documents`
Retrieve all processed documents.

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid-v4-string",
      "filename": "invoice.pdf",
      "category": "Finance",
      "priority": "Medium",
      "analysis": "Document summary...",
      "uploadedAt": "2025-11-09T10:30:00.000Z",
      "extractedText": "Full text...",
      "size": 123456
    }
  ]
}
```

#### `GET /api/download/:id`
Download the original file by document ID.

**Response:**
- Content-Type: `application/octet-stream`
- File stream

---

## 📁 Project Structure

```
kmrl/
├── server.js                    # Express server entry point
├── package.json                 # Backend dependencies
├── .env                         # Environment variables (not committed)
├── eng.traineddata              # Tesseract OCR language data
│
├── controllers/                 # Request handlers
│   └── fileController.js        # File upload, download, retrieval logic
│
├── routes/                      # API route definitions
│   └── fileRoutes.js            # /api/process-file, /api/documents
│
├── middlewares/                 # Custom middleware
│   └── uploadMiddleware.js     # Multer config for file uploads
│
├── services/                    # Core business logic
│   ├── ocrService.js           # OCR + text extraction (Tesseract, pdf-parse, mammoth)
│   ├── categorizeService.js    # AI + rule-based categorization
│   ├── azureService.js         # Azure Blob Storage integration
│   └── notificationService.js  # Console notifications
│
├── utils/                       # Utility functions
│   └── azureConfig.js          # Azure client configuration
│
├── uploads/                     # Temporary file storage (auto-created)
│
└── frontend/                    # React application
    ├── package.json             # Frontend dependencies
    ├── tailwind.config.js       # Tailwind CSS configuration
    ├── postcss.config.js        # PostCSS configuration
    ├── public/
    │   └── index.html           # HTML template
    └── src/
        ├── index.js             # React entry point
        ├── App.js               # Main app component
        ├── index.css            # Global styles + Tailwind imports
        ├── components/          # React components
        │   ├── Header.jsx       # App header with branding
        │   ├── UploadSection.jsx    # File upload UI
        │   ├── UploadArea.js        # Drag-drop upload component
        │   ├── DocumentsList.jsx    # Document grid display
        │   ├── DocumentCard.js      # Individual document card
        │   └── DocumentModal.jsx    # Full document detail view
        └── context/
            └── DocumentContext.js   # Global state for documents
```

---

## 📋 Supported File Types

| Format | Extension | Processing Method | Status |
|--------|-----------|-------------------|--------|
| **Images** | `.jpg`, `.jpeg`, `.png` | Tesseract.js OCR (English + Malayalam) | ✅ Full Support |
| **Word Docs** | `.docx` | Mammoth text extraction | ✅ Full Support |
| **Text Files** | `.txt` | Direct file read | ✅ Full Support |
| **PDFs** | `.pdf` | pdf-parse library | ⚠️ Basic Support |

---

## 🚨 Troubleshooting

### Common Issues

**1. Upload Fails / "File processing failed"**
- ✅ Check that `uploads/` directory exists (auto-created on start)
- ✅ Verify file size is under server limits
- ✅ Check console for specific error messages

**2. OCR Not Working / No Text Extracted**
- ✅ Ensure `eng.traineddata` is in root directory
- ✅ For Malayalam OCR, add `mal.traineddata`
- ✅ Check image quality (low-res images may fail)

**3. AI Analysis Fails / Generic Summaries**
- ✅ Verify `GEMINI_API_KEY` in `.env` file
- ✅ Check API key quota limits
- ✅ Review console logs for API error responses

**4. Azure Upload Fails (Development)**
- ✅ This is expected behavior - Azure is optional
- ✅ Files are stored locally in `uploads/` directory
- ✅ To enable Azure: Add valid connection string to `.env`

**5. Frontend Not Loading**
- ✅ Run `cd frontend && npm install` again
- ✅ Check port 3000 is not in use
- ✅ Verify backend is running on port 5000

**6. Proxy Errors in Development**
- ✅ Ensure backend is running first
- ✅ Check `proxy` setting in `frontend/package.json`
- ✅ Try clearing React dev server cache

### Debug Mode

Enable verbose logging:
```bash
# Backend
DEBUG=* npm start

# Frontend
REACT_APP_DEBUG=true npm start
```

---

## 🔒 Security Notes

- **API Keys**: Never commit `.env` file to version control
- **File Uploads**: Multer validates file types; consider adding virus scanning in production
- **Azure Storage**: Use managed identities and RBAC in production
- **CORS**: Configure CORS headers for production deployment
- **Rate Limiting**: Add rate limiting middleware for production API

---

## 🚀 Future Enhancements

- [ ] Enhanced PDF processing with table extraction
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Email/Slack notifications
- [ ] User authentication and role-based access
- [ ] Advanced search and filtering
- [ ] Analytics dashboard with charts
- [ ] Integration with KMRL's existing systems (Maximo, SharePoint)
- [ ] Mobile app for document capture

---

## 👥 Team

Built for **Smart India Hackathon 2025** - Smart Document Automation for KMRL

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please read `CONTRIBUTING.md` for guidelines.

---

## 📞 Support

For issues and questions:
- **GitHub Issues**: [github.com/prem22k/kmrl/issues](https://github.com/prem22k/kmrl/issues)

---

