#!/bin/bash

# KMRL Project Setup Script
# This script checks for errors and prepares the project for deployment

echo "🚀 KMRL Smart Document Automation - Pre-Deployment Checker"
echo "=========================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found!"
    echo "   Please install Node.js 18+ from: https://nodejs.org"
    exit 1
fi

# Check if npm is installed
echo "📦 Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found!"
    exit 1
fi

echo ""
echo "📋 Checking project structure..."

# Check for required files
REQUIRED_FILES=(
    "server.js"
    "package.json"
    ".env.example"
    "frontend/package.json"
    "frontend/src/App.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
    fi
done

echo ""
echo "🔐 Checking environment configuration..."

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check if GEMINI_API_KEY is set
    if grep -q "GEMINI_API_KEY=" .env && ! grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env; then
        echo -e "${GREEN}✓${NC} GEMINI_API_KEY is configured"
    else
        echo -e "${YELLOW}⚠${NC} GEMINI_API_KEY not properly configured"
        echo "   Please add your Gemini API key to .env file"
        echo "   Get one from: https://ai.google.dev/"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo "   Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created .env file"
        echo -e "${YELLOW}⚠${NC} Please edit .env and add your GEMINI_API_KEY"
    else
        echo -e "${RED}✗${NC} .env.example not found!"
    fi
fi

echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed"
    echo "   Run: npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo "   Run: cd frontend && npm install"
fi

echo ""
echo "🔍 Checking for common issues..."

# Check for hardcoded API keys in code
if grep -r "AIzaSy" --include="*.js" --exclude-dir=node_modules --exclude-dir=frontend/node_modules . 2>/dev/null | grep -v ".env" | grep -v "#"; then
    echo -e "${RED}✗${NC} Found hardcoded API keys in code!"
    echo "   This is a security risk. Please remove them."
else
    echo -e "${GREEN}✓${NC} No hardcoded API keys found"
fi

# Check if uploads directory exists
if [ -d "uploads" ]; then
    echo -e "${GREEN}✓${NC} uploads/ directory exists"
else
    echo -e "${YELLOW}⚠${NC} uploads/ directory will be created on first run"
fi

echo ""
echo "=========================================================="
echo "📊 Summary"
echo "=========================================================="

# Count issues
ERRORS=0
WARNINGS=0

# Basic check
if ! command -v node &> /dev/null; then
    ((ERRORS++))
fi

if [ ! -f ".env" ] || grep -q "your_gemini_api_key_here" .env; then
    ((WARNINGS++))
fi

if [ ! -d "node_modules" ]; then
    ((WARNINGS++))
fi

if [ ! -d "frontend/node_modules" ]; then
    ((WARNINGS++))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ No critical errors found!${NC}"
else
    echo -e "${RED}✗ Found $ERRORS critical error(s)${NC}"
fi

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ No warnings${NC}"
else
    echo -e "${YELLOW}⚠ Found $WARNINGS warning(s)${NC}"
fi

echo ""
echo "📖 Next Steps:"
echo ""
if [ $ERRORS -gt 0 ]; then
    echo "1. Fix the errors listed above"
    echo "2. Run this script again to verify"
elif [ $WARNINGS -gt 0 ]; then
    echo "1. Configure your .env file with GEMINI_API_KEY"
    echo "2. Install dependencies: npm run install-all"
    echo "3. Run locally: npm start (in root) and npm start (in frontend/)"
    echo "4. Read DEPLOYMENT_GUIDE.md for deployment instructions"
else
    echo -e "${GREEN}Your project is ready!${NC}"
    echo ""
    echo "To run locally:"
    echo "  Terminal 1: npm start"
    echo "  Terminal 2: cd frontend && npm start"
    echo ""
    echo "To deploy:"
    echo "  See DEPLOYMENT_GUIDE.md for complete instructions"
fi

echo ""
echo "=========================================================="
