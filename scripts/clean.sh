#!/bin/bash

# Usercopy Clean Script

echo "🧹 Cleaning Usercopy Project"
echo "============================"

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

# Clean root node_modules
if [ -d "node_modules" ]; then
    print_status "Removing root node_modules..."
    rm -rf node_modules
fi

# Clean backend
if [ -d "backend" ]; then
    print_status "Cleaning backend..."
    cd backend
    [ -d "node_modules" ] && rm -rf node_modules
    [ -d "dist" ] && rm -rf dist
    [ -f "*.log" ] && rm -f *.log
    cd ..
fi

# Clean frontend
if [ -d "frontend" ]; then
    print_status "Cleaning frontend..."
    cd frontend
    [ -d "node_modules" ] && rm -rf node_modules
    [ -d ".next" ] && rm -rf .next
    [ -f "*.log" ] && rm -f *.log
    cd ..
fi

# Clean Docker
print_warning "Cleaning Docker containers and images..."
docker-compose down --remove-orphans 2>/dev/null || true
docker system prune -f --volumes 2>/dev/null || true

print_success "Project cleaned successfully!"
echo ""
print_status "To reinstall dependencies:"
echo "  🔧 ./scripts/setup.sh"
