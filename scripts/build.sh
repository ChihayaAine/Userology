#!/bin/bash

# Usercopy Build Script

set -e

echo "🏗️  Building Usercopy Application"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the project root directory"
    exit 1
fi

# Build backend
print_status "Building backend..."
cd backend
npm run build
print_success "Backend build completed"
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
print_success "Frontend build completed"
cd ..

print_success "All builds completed successfully!"
echo ""
echo "📦 Backend build: ./backend/dist"
echo "📦 Frontend build: ./frontend/.next"
