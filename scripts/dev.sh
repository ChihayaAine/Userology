#!/bin/bash

# Usercopy Development Environment Setup Script

set -e

echo "🚀 Usercopy Development Environment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check environment files
print_status "Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        print_warning "Backend .env not found. Creating from env.example..."
        cp backend/env.example backend/.env
        print_warning "Please edit backend/.env with your configuration"
    else
        print_error "Backend environment file not found. Please create backend/.env"
        exit 1
    fi
fi

if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/env.example" ]; then
        print_warning "Frontend .env not found. Creating from env.example..."
        cp frontend/env.example frontend/.env
        print_warning "Please edit frontend/.env with your configuration"
    else
        print_error "Frontend environment file not found. Please create frontend/.env"
        exit 1
    fi
fi

print_success "Environment files found"

# Check package manager preference
PACKAGE_MANAGER="yarn"
if ! command -v yarn &> /dev/null; then
    print_warning "Yarn not found, falling back to npm"
    PACKAGE_MANAGER="npm"
else
    print_success "Using Yarn package manager"
fi

# Install dependencies
print_status "Installing dependencies..."

# Install root dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
fi

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
    cd ..
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
    cd ..
fi

print_success "All dependencies installed"

# Start services
print_status "Starting development servers..."

# Function to cleanup background processes
cleanup() {
    print_status "Stopping development servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    print_success "Development servers stopped"
    exit 0
}

# Set trap to call cleanup function
trap cleanup SIGINT SIGTERM

# Start backend
print_status "Starting backend server..."
cd backend
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn dev &
else
    npm run dev &
fi
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend server started successfully"
else
    print_warning "Backend server may not be ready yet"
fi

# Start frontend
print_status "Starting frontend server..."
cd frontend
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn dev &
else
    npm run dev &
fi
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

print_success "Development environment is ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend API: http://localhost:3001"
echo "🏥 Backend Health: http://localhost:3001/health"
echo ""
print_status "Press Ctrl+C to stop all servers"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
