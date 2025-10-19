#!/bin/bash

# Usercopy Project Setup Script

set -e

echo "🔧 Usercopy Project Setup"
echo "========================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check package manager preference
PACKAGE_MANAGER="yarn"
if ! command -v yarn &> /dev/null; then
    print_warning "Yarn not found, falling back to npm"
    PACKAGE_MANAGER="npm"
else
    print_status "Using Yarn package manager"
fi

# Install root dependencies
print_status "Installing root dependencies..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
else
    npm install
fi

# Setup backend
print_status "Setting up backend..."
cd backend

# Copy environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f "env.example" ]; then
    print_warning "Creating backend/.env from env.example"
    cp env.example .env
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
else
    npm install
fi

cd ..

# Setup frontend
print_status "Setting up frontend..."
cd frontend

# Copy environment file if it doesn't exist
if [ ! -f ".env" ] && [ -f "env.example" ]; then
    print_warning "Creating frontend/.env from env.example"
    cp env.example .env
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
else
    npm install
fi

cd ..

print_success "Project setup completed!"
echo ""
print_warning "Please configure your environment variables:"
echo "  📝 Edit backend/.env with your API keys and database config"
echo "  📝 Edit frontend/.env with your frontend configuration"
echo ""
print_status "To start development:"
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    echo "  🚀 yarn dev"
else
    echo "  🚀 npm run dev"
fi
echo "  🚀 ./scripts/dev.sh"
