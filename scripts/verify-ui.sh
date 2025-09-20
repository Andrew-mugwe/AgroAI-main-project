#!/bin/bash
set -e

# Flow 13.1 UI Verification Script
# This script verifies the Pest Detection UI components and runs all checks

echo "[AGROAI UI VERIFY] Starting Flow 13.1 UI verification..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[AGROAI UI VERIFY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[AGROAI UI VERIFY]${NC} ✅ $1"
}

print_error() {
    echo -e "${RED}[AGROAI UI VERIFY]${NC} ❌ $1"
}

print_warning() {
    echo -e "${YELLOW}[AGROAI UI VERIFY]${NC} ⚠️  $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if we're in the client directory
if [ ! -d "src/components/pests" ]; then
    print_error "Pest components directory not found. Please run from client directory."
    exit 1
fi

print_status "Running linting checks..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

print_status "Running TypeScript type checking..."
if npm run typecheck; then
    print_success "TypeScript type checking passed"
else
    print_error "TypeScript type checking failed"
    exit 1
fi

print_status "Running Jest tests for pest components..."
if npm test -- --testPathPattern="pests" --watchAll=false; then
    print_success "Jest tests passed"
else
    print_error "Jest tests failed"
    exit 1
fi

print_status "Running dry-run build..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# Check if all required files exist
print_status "Verifying required files exist..."

required_files=(
    "src/components/pests/UploadForm.tsx"
    "src/components/pests/ReportCard.tsx"
    "src/components/pests/HistoryList.tsx"
    "src/pages/pests/index.tsx"
    "src/__tests__/pests/UploadForm.test.tsx"
    "src/__tests__/pests/ReportCard.test.tsx"
    "src/__tests__/pests/HistoryList.test.tsx"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found $file"
    else
        print_error "Missing $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    print_error "Some required files are missing"
    exit 1
fi

# Check if sample images exist
print_status "Checking sample images..."
sample_images=(
    "assets/seeds/fall_armyworm.png"
    "assets/seeds/leaf_rust.png"
    "assets/seeds/aphids.png"
    "assets/seeds/stemborer.png"
)

for image in "${sample_images[@]}"; do
    if [ -f "$image" ]; then
        print_success "Found $image"
    else
        print_warning "Missing $image (placeholder file)"
    fi
done

# Check component exports
print_status "Checking component exports..."

# Check UploadForm export
if grep -q "export default UploadForm" src/components/pests/UploadForm.tsx; then
    print_success "UploadForm export found"
else
    print_error "UploadForm export not found"
    exit 1
fi

# Check ReportCard export
if grep -q "export default ReportCard" src/components/pests/ReportCard.tsx; then
    print_success "ReportCard export found"
else
    print_error "ReportCard export not found"
    exit 1
fi

# Check HistoryList export
if grep -q "export default HistoryList" src/components/pests/HistoryList.tsx; then
    print_success "HistoryList export found"
else
    print_error "HistoryList export not found"
    exit 1
fi

# Check PestsPage export
if grep -q "export default PestsPage" src/pages/pests/index.tsx; then
    print_success "PestsPage export found"
else
    print_error "PestsPage export not found"
    exit 1
fi

# Check for required dependencies
print_status "Checking required dependencies..."

required_deps=(
    "framer-motion"
    "lucide-react"
    "react"
    "react-dom"
)

for dep in "${required_deps[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        print_success "Dependency $dep found"
    else
        print_error "Dependency $dep not found"
        exit 1
    fi
done

# Check for test dependencies
print_status "Checking test dependencies..."

test_deps=(
    "@testing-library/react"
    "@testing-library/jest-dom"
    "jest"
)

for dep in "${test_deps[@]}"; do
    if npm list "$dep" > /dev/null 2>&1; then
        print_success "Test dependency $dep found"
    else
        print_warning "Test dependency $dep not found (may be in devDependencies)"
    fi
done

# Final success message
echo ""
print_success "All UI checks passed for Flow 13.1 (Pest Detection)"
echo ""
print_status "Summary:"
print_status "- ✅ Linting passed"
print_status "- ✅ TypeScript type checking passed"
print_status "- ✅ Jest tests passed"
print_status "- ✅ Build successful"
print_status "- ✅ All required files present"
print_status "- ✅ Component exports verified"
print_status "- ✅ Dependencies checked"
echo ""
print_success "Flow 13.1 UI verification completed successfully!"
echo ""
print_status "Components ready for use:"
print_status "- UploadForm: Drag-and-drop image upload with validation"
print_status "- ReportCard: Medical/AI scan styled report display"
print_status "- HistoryList: Grid/list view with search and filtering"
print_status "- PestsPage: Complete page with hero section and stats"
echo ""
print_status "Test coverage:"
print_status "- UploadForm.test.tsx: File validation, form submission, loading states"
print_status "- ReportCard.test.tsx: Display, interactions, confidence scoring"
print_status "- HistoryList.test.tsx: Search, filtering, modal, CRUD operations"
echo ""
print_success "Ready for production! 🚀"
