# Project Overview

KMRL Smart Document Automation is a full-stack web application built for Kochi Metro Rail Limited (KMRL) to automate document processing workflows. The system combines OCR technology (Tesseract.js), AI-powered analysis (Google Gemini API), and intelligent categorization to transform manual document handling into an automated, intelligent system. The application features a modern React frontend with Tailwind CSS styling, drag-and-drop file uploads, real-time processing status, and animated UI components. It processes images, PDFs, Word documents, and text files, extracting text content, generating AI summaries, auto-categorizing by department (Engineering, Finance, HR, Safety, etc.), and assigning priority levels (High/Medium/Low) based on content analysis. Built for the Smart India Hackathon 2025, this MVP demonstrates an 80% reduction in manual processing time through automation.

---

# Repo Structure

```
kmrl/
├── server.js                    # Express server entry point & routing config
├── package.json                 # Backend dependencies (Express, Tesseract, etc.)
├── eng.traineddata              # Tesseract OCR English language data
├── mvp_roadmap.MD              # Hackathon MVP planning document
├── README.md                    # Original project documentation
│
├── controllers/
│   └── fileController.js        # Request handlers for upload, list, download
│
├── routes/
│   └── fileRoutes.js            # API route definitions (/api/process-file, etc.)
│
├── middlewares/
│   └── uploadMiddleware.js      # Multer configuration for file uploads
│
├── services/                    # Core business logic layer
│   ├── ocrService.js            # OCR & text extraction (Tesseract, pdf-parse, mammoth)
│   ├── categorizeService.js     # AI categorization + keyword validation
│   ├── azureService.js          # Azure Blob Storage integration (optional)
│   └── notificationService.js   # Console notifications with emoji indicators
│
├── utils/
│   └── azureConfig.js           # Azure BlobServiceClient configuration
│
├── uploads/                     # Temporary file storage (auto-created)
│
└── frontend/                    # React SPA
    ├── package.json             # Frontend dependencies (React, Tailwind, Axios)
    ├── tailwind.config.js       # Tailwind color/theme customization
    ├── postcss.config.js        # PostCSS configuration for Tailwind
    ├── public/
    │   └── index.html           # HTML template with root div
    └── src/
        ├── index.js             # React entry point (ReactDOM.render)
        ├── App.js               # Main app component with layout
        ├── index.css            # Tailwind imports + custom animations
        ├── components/
        │   ├── Header.jsx       # App header with gradient title
        │   ├── UploadSection.jsx    # File upload UI with drag-drop
        │   ├── UploadArea.js        # Drag-drop zone component
        │   ├── DocumentsList.jsx    # Document grid with filtering
        │   ├── DocumentCard.js      # Individual document card
        │   └── DocumentModal.jsx    # Full document detail modal
        ├── context/
        │   └── DocumentContext.js   # Global state (documents, upload, fetch)
        ├── hooks/               # Custom React hooks (if any)
        ├── styles/              # Additional styling files (if any)
        └── utils/               # Frontend utility functions (if any)
```

---

# How to Run (dev / build / preview)

## Development Mode

**Backend (Terminal 1):**
```bash
# From root directory
npm install
npm start
# Server starts at http://localhost:5000
# API available at http://localhost:5000/api
```

**Frontend (Terminal 2):**
```bash
# From root directory
cd frontend
npm install
npm start
# Dev server starts at http://localhost:3000
# Proxies API requests to backend via proxy setting
```

**Important Scripts (Backend `package.json`):**
- `npm start` → Runs `node server.js` (production mode if NODE_ENV=production)
- `npm run dev` → Runs `node server.js` (development mode)

**Important Scripts (Frontend `package.json`):**
- `npm start` → Runs `react-scripts start` (dev server on port 3000)
- `npm run build` → Creates optimized production build in `frontend/build`
- `npm test` → Runs Jest test suite
- `npm run eject` → Ejects from Create React App

## Production Mode

```bash
# Build React frontend
cd frontend
npm run build
cd ..

# Set environment variable
export NODE_ENV=production

# Start unified server
npm start
# Serves both API and static React build at http://localhost:5000
```

**Port Numbers:**
- Backend: `5000` (hardcoded in `server.js`)
- Frontend Dev: `3000` (default from react-scripts)

---

# Main Tech Stack & Dependencies

## Backend Technologies
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v5.1) - Web framework for API routing
- **Tesseract.js** (v6.0) - OCR engine for image text extraction (supports English + Malayalam)
- **pdf-parse** (v1.1) - PDF text extraction library
- **Mammoth** (v1.10) - DOCX document text extraction
- **Multer** (v2.0) - Multipart form-data handling for file uploads
- **@azure/storage-blob** (v12.28) - Azure Blob Storage SDK
- **dotenv** (v17.2) - Environment variable management
- **uuid** (v12.0) - UUID generation for document IDs
- **node-fetch** (v3.3) - HTTP client for Gemini API calls

## Frontend Technologies
- **React** (v18.3) - UI library for component-based architecture
- **Tailwind CSS** (v3.4) - Utility-first CSS framework for styling
- **Axios** - HTTP client for API communication with backend
- **Lucide React** (v0.263) - Modern icon library (Upload, FileText, CheckCircle, etc.)
- **React Scripts** (v5.0) - Build tooling from Create React App
- **PostCSS** (v8.5) - CSS processing for Tailwind
- **Autoprefixer** (v10.4) - Automatic vendor prefixing

## Key Animation & Styling Libraries
- **Tailwind CSS** - Gradient backgrounds, hover effects, transitions
- **Custom CSS Animations** - `@keyframes` for pulse, fade-in, scale-in, slide-up effects (defined in `index.css`)
- **Lucide Icons** - Animated icon components with Tailwind transitions

---

# Entry Points & Routing

## Backend Entry Point
**File:** `server.js`

Main Express server initialization:
- Loads environment variables via `dotenv.config()`
- Configures middleware: `express.json()`, `express.urlencoded()`
- Mounts API routes at `/api` prefix via `fileRoutes.js`
- In production mode (`NODE_ENV=production`):
  - Serves static React build from `frontend/build`
  - Handles all non-API routes with `index.html` for client-side routing
- In development mode:
  - Returns JSON response at `/` with API info
  - React dev server runs separately on port 3000
- Listens on port `5000`

## Frontend Entry Point
**File:** `frontend/src/index.js`

React application bootstrap:
- Imports `React`, `ReactDOM`, `App` component
- Imports global styles from `index.css`
- Renders `<App />` component into `#root` div
- Uses `ReactDOM.createRoot()` for React 18 concurrent features

## API Routes
**File:** `routes/fileRoutes.js`

Defined routes:
- `POST /api/process-file` → `processFile` controller (with `uploadMiddleware`)
- `GET /api/documents` → `getDocuments` controller
- `GET /api/download/:id` → `downloadFile` controller

No frontend routing library used (single-page app without React Router).

---

# Visual / Motion Layers

## No Galaxy Background Implementation
This project **does not** implement a galaxy/particle background or three.js canvas. The visual design uses:
- **Gradient backgrounds** via Tailwind CSS (`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50`)
- **Floating background elements** in `App.js`:
  - Three `<div>` elements with blur filters and `mix-blend-multiply`
  - CSS classes: `animate-blob`, `animation-delay-2000`, `animation-delay-4000`
  - Creates subtle animated blob effects in background
- **No WebGL or Three.js** - purely CSS-based animations

## Animation System

### Custom CSS Animations (in `frontend/src/index.css`)
- **`@keyframes pulse`**: 0%→100% opacity 1, 50% opacity 0.5 (used for loading states)
- Additional animations likely defined inline via Tailwind:
  - `.animate-fade-in` - Fade in entrance
  - `.animate-scale-in` - Scale up entrance
  - `.animate-slide-up` - Slide from bottom
  - `.animate-spin` - Continuous rotation (loading spinners)
  - `.animate-blob` - Background blob movement

### Tailwind Transitions
Extensive use of `transition-all duration-300` for smooth hover effects:
- Button hovers with color shifts
- Card hover lifts (`hover-lift` class)
- Border color transitions on input focus
- Icon color changes on hover

### No Framer Motion or GSAP
- No animation library imports detected
- All animations achieved through:
  1. Tailwind utility classes (`animate-*`, `transition-*`)
  2. Custom CSS `@keyframes` rules
  3. Inline `style` attributes for dynamic delays

## Cursor Interactions
- **Drag-over effects**: `UploadSection.jsx` changes border color and background on file drag-over
- **Hover states**: Cards, buttons, and icons have cursor-based hover effects via Tailwind classes
- **No custom cursor** or pointer particle repulsion implemented

---

# Components Map (detailed for important UI blocks)

## Header Component
**File:** `frontend/src/components/Header.jsx`

**Purpose:** Top navigation bar with branding and tagline.

**Description:** Fixed sticky header with glassmorphism effect (`backdrop-blur-md`, `bg-white/80`). Contains a `FileText` icon with animated gradient blur effect on hover, and a large gradient text title "KMRL Document Automation" using `bg-gradient-to-r` with `bg-clip-text`. Includes subtitle "Powered by AI • Smart Processing • Instant Analysis".

**Props:** None (stateless component)

**Styling:** Tailwind utility classes for layout, colors, shadows, and transitions. Gradient effects applied to icon blur and title text.

**Animations:** Group hover effect on icon, blur glow transition (300ms duration)

---

## UploadSection Component
**File:** `frontend/src/components/UploadSection.jsx`

**Purpose:** File upload interface with drag-and-drop functionality and upload status display.

**Description:** Provides a large dashed-border drop zone that responds to drag events with visual feedback (scale, color change). Handles file selection via hidden `<input type="file">`, uploads to backend via `uploadDocument()` from DocumentContext, and displays upload results with category/priority badges and AI analysis preview. Shows loading spinner during processing. Includes reset button to clear state.

**Props:** None (uses context)

**Styling:** Gradient cards (`bg-gradient-to-r from-blue-50 to-indigo-50`), rounded corners (`rounded-2xl`), shadow effects, responsive padding

**Animations:** 
- Drop zone scales on drag-over (`scale-105`)
- File selection animates with `animate-scale-in`
- Upload button has `button-bounce` class
- Loading spinner with `animate-spin`
- Error/success messages use `animate-slide-up`

**State Management:** Local state for `selectedFile`, `dragOver`, `uploadResult`, `localError`; consumes `useDocuments()` context for upload function

---

## DocumentsList Component
**File:** `frontend/src/components/DocumentsList.jsx`

**Purpose:** Main document display area with filtering and grid layout.

**Description:** Fetches and displays all processed documents in a responsive grid (1/2/3 columns). Includes category dropdown filter to show specific department documents. Handles loading states with animated spinner, empty states with helpful messaging, and error states. Clicking a document card opens `DocumentModal` with full details. Also provides download functionality per document.

**Props:** None (uses context)

**Styling:** Glassmorphism card (`bg-white/70 backdrop-blur-sm`), gradient header sections, Tailwind grid system, custom dropdown with `ChevronDown` icon

**Animations:**
- Loading spinner with dual rotating borders
- Empty state icon with gradient blur glow
- Card hover effects via `hover-lift` class
- Document count badge with `animate-pulse` dot

**State Management:** Local state for `selectedCategory`, `selectedDocument`, `isModalOpen`; consumes `documents`, `loading`, `error` from context

---

## DocumentCard Component
**File:** `frontend/src/components/DocumentCard.js`

**Purpose:** Individual document preview card in the grid.

**Description:** Displays document filename, category badge with color coding, priority indicator with emoji (🔴/🟡/🟢), upload timestamp, file size, and truncated AI analysis preview. Provides "View Details" and "Download" action buttons. Category colors dynamically assigned (Engineering=purple, Finance=green, Safety=red, etc.).

**Props:**
- `document` (object) - Document data with id, filename, category, priority, analysis, uploadedAt, size
- `onView` (function) - Callback to open modal
- `onDownload` (function) - Callback to download file

**Styling:** White card with border, gradient hover effects, responsive text sizing, badge colors via conditional classes

**Animations:** Hover lift effect, button hover color transitions

---

## DocumentModal Component
**File:** `frontend/src/components/DocumentModal.jsx`

**Purpose:** Full-screen overlay modal for detailed document view.

**Description:** Displays complete document information including full extracted text, detailed AI analysis, category, priority, file metadata (name, size, upload date), and action buttons. Modal overlay with backdrop blur, appears/disappears with opacity transitions. Scrollable content area for long documents.

**Props:**
- `document` (object) - Full document data
- `isOpen` (boolean) - Modal visibility state
- `onClose` (function) - Callback to close modal

**Styling:** Fixed overlay with `backdrop-blur`, centered modal card with max-height scroll, gradient accents

**Animations:** Fade-in overlay, scale-in modal card, smooth close transitions

---

## UploadArea Component
**File:** `frontend/src/components/UploadArea.js`

**Purpose:** Reusable drag-and-drop file input zone.

**Description:** Likely a lower-level component extracted from `UploadSection.jsx` for drag/drop handling. Provides visual feedback on drag events and triggers file selection.

**Props:** Likely accepts `onFileSelect`, `dragOver`, `setDragOver` handlers

**Styling:** Dashed border, centered icon/text, responsive hover states

**Animations:** Border color change, background color shift on drag-over

---

## Footer Component
**File:** Not present in codebase (no footer implemented)

---

# State Management & Data Flow

## Global State: React Context API

**File:** `frontend/src/context/DocumentContext.js`

### Provider: `DocumentProvider`
Wraps entire app in `App.js` to provide global state access.

### Context Value:
```javascript
{
  documents: [],           // Array of processed document objects
  loading: false,          // Boolean for async operation status
  error: null,            // Error message string or null
  fetchDocuments: fn,     // Fetches all documents from backend
  uploadDocument: fn,     // Uploads file and refreshes list
  setError: fn            // Manual error setter
}
```

### Data Flow for Document Upload:
1. User drops file in `UploadSection.jsx`
2. Component calls `uploadDocument(file)` from context
3. Context creates FormData, posts to `/api/process-file` via Axios
4. Backend processes file (OCR → AI analysis → categorization)
5. Backend returns document metadata as JSON
6. Context calls `fetchDocuments()` to refresh document list
7. All subscribed components re-render with new data
8. `DocumentsList.jsx` displays newly processed document

### Data Source:
**Static or Dynamic:** Dynamic - documents fetched from backend API via Axios HTTP requests

**No CMS or GitHub API** - all data stored in-memory in backend (`fileController.js`) using a JavaScript array. In production, this would be replaced with a database (MongoDB, PostgreSQL, etc.).

### No Redux/Zustand/Recoil
- Pure React Context API for state management
- Simple provider/consumer pattern with `useContext` hook

---

# Styling & Theming

## Tailwind CSS Configuration

**File:** `frontend/tailwind.config.js`

```javascript
content: ["./src/**/*.{js,jsx,ts,tsx}"]  // Scans all JSX files

theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',    // Light blue
        500: '#3b82f6',   // Base blue
        600: '#2563eb',   // Darker blue
        700: '#1d4ed8'    // Deep blue
      }
    }
  }
}
```

## Color Tokens & Gradients

**Primary Brand Colors:**
- Blue shades (50, 500, 600, 700) for buttons, accents, focus states
- Gradient combinations used throughout:
  - `from-blue-600 via-purple-600 to-indigo-600` (header title)
  - `from-blue-500 to-purple-600` (button backgrounds)
  - `from-slate-50 via-blue-50 to-indigo-50` (page background)

**Category Color Mapping (in `DocumentCard.js`):**
- Engineering → Purple (`bg-purple-100`, `text-purple-700`)
- Finance → Green (`bg-green-100`, `text-green-700`)
- Safety → Red (`bg-red-100`, `text-red-700`)
- HR → Blue (`bg-blue-100`, `text-blue-700`)
- Legal → Indigo (`bg-indigo-100`, `text-indigo-700`)
- Default → Gray

**Priority Color Mapping:**
- High → Red (`text-red-600`, 🔴 emoji)
- Medium → Yellow (`text-yellow-600`, 🟡 emoji)
- Low → Green (`text-green-600`, 🟢 emoji)

## PostCSS Configuration

**File:** `frontend/postcss.config.js`

Processes Tailwind directives and applies autoprefixer for browser compatibility.

## Custom CSS

**File:** `frontend/src/index.css`

- Imports Tailwind base/components/utilities via `@tailwind` directives
- Defines custom component classes:
  - `.upload-area` - Base styles for drag-drop zone
  - `.upload-area:hover` - Hover state with border/background change
  - `.upload-area.dragover` - Active drag-over state
  - `.processing` - Pulse animation for loading states
- Custom `@keyframes pulse` animation (opacity oscillation)

## No CSS Variables or Theme Toggle
- No CSS custom properties (`--variable-name`) used
- No dark mode implementation
- Fixed light theme with blue/purple gradients

---

# Performance / Accessibility notes

## Performance Optimizations

### Implemented:
- **React 18 Concurrent Features** - Uses `ReactDOM.createRoot()` for automatic batching and concurrent rendering
- **Axios for HTTP** - More efficient than fetch with automatic JSON parsing and request cancellation support
- **In-Memory Document Storage** - Fast retrieval for MVP (note: not scalable for production)
- **Conditional Rendering** - Loading/error/empty states prevent unnecessary component renders
- **File Size Display** - Shows file size to users (allows them to avoid large uploads)

### Not Implemented (Future Enhancements):
- **No lazy loading** - All components bundled in main chunk
- **No image optimization** - Uploaded images not compressed or optimized
- **No code splitting** - Single bundle for entire React app
- **No memoization** - No `React.memo()`, `useMemo()`, or `useCallback()` usage detected
- **No pagination** - All documents loaded at once (could impact performance with 100+ documents)

## Accessibility Considerations

### Implemented:
- **Semantic HTML** - Uses `<header>`, `<main>`, `<button>`, `<label>` elements appropriately
- **Alt Attributes** - Likely present on any `<img>` elements (verify in DocumentCard/Modal)
- **Keyboard Navigation** - Native button/input elements support keyboard interaction
- **Focus States** - Tailwind `focus:` variants applied (e.g., `focus:ring-2 focus:ring-blue-500`)
- **Color Contrast** - High contrast text on backgrounds (gray-900 on white, white on blue-600)

### Not Implemented (Accessibility Gaps):
- **No ARIA labels** - No `aria-label`, `aria-describedby`, or `role` attributes detected
- **No skip links** - No "Skip to main content" link for keyboard users
- **No screen reader announcements** - Upload status changes not announced to assistive tech
- **Modal focus trap** - DocumentModal may not trap focus properly (should restrict tab navigation to modal)
- **No reduced motion support** - No `@media (prefers-reduced-motion: reduce)` queries to disable animations
- **Color-only indicators** - Priority uses emoji + color (good) but category uses only color (needs icon)

### Recommendations:
1. Add `aria-label` to icon-only buttons
2. Add `aria-live` regions for upload status updates
3. Implement focus trap in DocumentModal
4. Add `role="dialog"` and `aria-modal="true"` to modal
5. Add `aria-busy="true"` during loading states
6. Test with screen reader (NVDA, JAWS, VoiceOver)

---

# Key Scripts / Build Configurations

## Backend Scripts (Root `package.json`)

```json
{
  "name": "kmrl-backend",
  "type": "module",  // Enables ES6 imports
  "main": "server.js",
  "scripts": {
    "start": "node server.js",  // Production start
    "dev": "node server.js"     // Development start (same as start)
  }
}
```

**Note:** No build step for backend - runs directly via Node.js interpreter.

## Frontend Scripts (`frontend/package.json`)

```json
{
  "name": "kmrl-frontend",
  "private": true,
  "scripts": {
    "start": "react-scripts start",       // Dev server (port 3000)
    "build": "react-scripts build",       // Production build to build/
    "test": "react-scripts test",         // Jest test runner
    "eject": "react-scripts eject"        // Eject from CRA (irreversible)
  },
  "proxy": "http://localhost:5000"        // Proxy API calls to backend
}
```

### Important Build Configuration Details:

**React Scripts Version:** 5.0.1 (Create React App tooling)

**Proxy Setting:**
- All API requests from `http://localhost:3000` are proxied to `http://localhost:5000`
- Enables seamless development without CORS issues
- Example: `axios.get('/api/documents')` → `http://localhost:5000/api/documents`

**Build Output:**
- Production build creates optimized bundle in `frontend/build/`
- Includes minified JS, CSS, and static assets
- `server.js` serves this directory in production mode via `express.static()`

**Browser Targets (Browserslist):**
```json
"production": [">0.2%", "not dead", "not op_mini all"],
"development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
```

**ESLint Config:**
```json
"eslintConfig": {
  "extends": ["react-app", "react-app/jest"]
}
```
Uses default CRA linting rules (no custom overrides detected).

---

## Environment Variables (Backend Only)

**File:** `.env` (not committed to version control)

**Required Variables:**
```env
GEMINI_API_KEY=<your_api_key>  # Google Gemini API for AI analysis
```

**Optional Variables:**
```env
AZURE_STORAGE_CONNECTION_STRING=<connection_string>  # Azure Blob Storage
AZURE_CONTAINER_NAME=documents  # Azure container name (default: "documents")
NODE_ENV=production  # Determines server behavior (dev vs prod)
```

**Configuration Loading:**
- Backend uses `dotenv` package to load `.env` file in `server.js`
- Frontend has no environment variables (all config in code)
- No `.env.example` file provided (should be added for developer onboarding)

---

## Deployment Considerations

### Production Build Process:
```bash
cd frontend
npm run build        # Creates optimized bundle in build/
cd ..
export NODE_ENV=production
npm start           # Serves API + static files on port 5000
```

### Required for Production Deployment:
1. Set `NODE_ENV=production` environment variable
2. Provide valid `GEMINI_API_KEY` for AI functionality
3. (Optional) Configure Azure Storage for persistent file storage
4. Install Node.js 18+ on server
5. Run `npm install` in both root and `frontend/` directories
6. Build frontend: `cd frontend && npm run build`
7. Start server: `npm start`

### Hosting Recommendations:
- **Backend + Frontend:** Heroku, Render, Railway (Node.js hosting)
- **Frontend Only:** Vercel, Netlify (requires separate backend deployment)
- **Cloud Storage:** Azure Blob Storage (already integrated) or AWS S3

---

## No Vite/Webpack/Next.js Config

This project uses **Create React App** with default configurations:
- No `vite.config.js` (uses react-scripts, not Vite)
- No `webpack.config.js` (abstracted by CRA, requires eject to customize)
- No `next.config.js` (not a Next.js project)
- No custom routing (single-page app without React Router)

**To customize build configuration**, you would need to:
1. Run `npm run eject` in frontend directory (irreversible)
2. Manually edit ejected Webpack config
3. OR migrate to Vite/Next.js (requires full rewrite of build setup)

---

## Testing Infrastructure

**File:** `frontend/package.json` includes Jest test script

**Test Command:** `npm test` (runs Jest in watch mode via react-scripts)

**Current Status:** No test files detected in repository (no `*.test.js` or `*.spec.js` files)

**Recommended Test Coverage:**
- Unit tests for `categorizeService.js` keyword matching logic
- Integration tests for API endpoints (`/api/process-file`)
- Component tests for `UploadSection.jsx` drag-drop behavior
- E2E tests for full upload → categorization → display workflow

---

# Additional Technical Notes

## Backend Architecture

**Pattern:** MVC-like structure
- **Models:** None (in-memory array in `fileController.js` instead of database)
- **Views:** React frontend (separate SPA)
- **Controllers:** `controllers/fileController.js` handles HTTP requests
- **Services:** Business logic in `services/` directory
- **Routes:** `routes/fileRoutes.js` defines API endpoints
- **Middleware:** `middlewares/uploadMiddleware.js` for Multer config

**Data Persistence:** 
⚠️ **Critical Limitation:** Documents stored in memory (JavaScript array). Server restart = all data lost. 
**Production Fix:** Replace with MongoDB, PostgreSQL, or Firebase Firestore.

## OCR Pipeline (in `services/ocrService.js`)

**Processing Flow:**
1. Check file extension (`.pdf`, `.jpg`, `.png`, `.docx`, `.txt`)
2. Apply appropriate extractor:
   - **Images:** Tesseract.js OCR with `eng+mal` language support
   - **PDFs:** pdf-parse library (extracts text-based content)
   - **DOCX:** Mammoth library (converts to plain text)
   - **TXT:** Direct `fs.readFileSync()`
3. Fallback handling: If extraction fails, returns descriptive error string
4. Passes extracted text to AI analysis function

## AI Analysis Pipeline (in `services/ocrService.js`)

**Function:** `analyzeDocumentContent(textContent)`

**API:** Google Gemini 2.5 Flash Preview
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`
- **Method:** POST with JSON body
- **Request Structure:**
  ```javascript
  {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          summary: { type: "STRING" },
          priority: { type: "STRING" },
          metadata: { type: "OBJECT" }
        }
      }
    }
  }
  ```
- **Response:** Structured JSON with summary, priority, metadata

## Categorization Hybrid Approach (in `services/categorizeService.js`)

**Two-Stage Process:**

**Stage 1: AI Analysis**
- Calls Gemini API with document text
- Receives category suggestion from AI
- Gets priority and summary

**Stage 2: Rule-Based Validation**
- Counts keyword matches for each category
- Overrides AI suggestion if ≥2 keywords match a different category
- Ensures obvious documents (e.g., invoice with "payment" keyword) aren't mislabeled

**Priority Detection Rules:**
- High: Contains "urgent", "immediate", "emergency", "critical", "deadline"
- Medium: Contains "important", "attention", "review required", "follow up"
- Low: Default fallback

## Security Considerations

**Current Implementation:**
- ✅ Multer limits file types via `accept` attribute in HTML
- ✅ Environment variables for API keys (not hardcoded)
- ❌ No file size limits enforced (could enable DoS attacks)
- ❌ No virus scanning on uploads
- ❌ No authentication/authorization (anyone can upload)
- ❌ No rate limiting (could be abused for API quota exhaustion)
- ❌ No input sanitization (potential XSS in document display)

**Production Security Checklist:**
1. Add file size limits (e.g., 10MB max)
2. Implement user authentication (JWT, OAuth, etc.)
3. Add role-based access control (RBAC)
4. Scan uploads with ClamAV or VirusTotal API
5. Sanitize displayed text to prevent XSS
6. Add rate limiting (e.g., express-rate-limit middleware)
7. Enable HTTPS/SSL certificates
8. Configure CORS headers properly
9. Add API key rotation mechanism
10. Implement audit logging for all uploads

---

# Conclusion

This codebase provides a solid MVP foundation for document automation with clear separation of concerns (backend services, frontend components, state management). The hybrid AI + rule-based categorization approach ensures accuracy, and the modern React UI with Tailwind styling provides an excellent user experience. 

**Key Strengths:**
- Clean architecture with modular services
- Comprehensive OCR support (images, PDFs, DOCX, TXT)
- AI-powered intelligent analysis
- Modern, responsive UI with smooth animations
- Easy local development setup

**Critical Next Steps for Production:**
1. Replace in-memory storage with persistent database
2. Implement user authentication and authorization
3. Add comprehensive test coverage
4. Enhance security (rate limiting, file scanning, input validation)
5. Add pagination for document list
6. Implement proper error handling and logging
7. Set up CI/CD pipeline for automated deployment

The codebase is well-positioned for hackathon demonstration and can be extended into a production-ready system with the enhancements noted above.
