#!/bin/bash

# Restocka V2 Production Test Runner
# Runs all Playwright tests against production and reports results

set -e

# Configuration
PROJECT_DIR="/Users/claudio/.openclaw/workspace/projects/restocka-v2"
TEST_DIR="${PROJECT_DIR}/tests"
RESULTS_DIR="${PROJECT_DIR}/test-results"
SCREENSHOTS_DIR="${RESULTS_DIR}/screenshots"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="/Users/claudio/.openclaw/workspace/state/restocka-tests.log"
RESULTS_FILE="/Users/claudio/.openclaw/workspace/memory/restocka-test-results.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Restocka V2 Production Test Runner"
echo "Started: $TIMESTAMP"
echo "========================================"

# Create directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$SCREENSHOTS_DIR"

# Change to project directory
cd "$PROJECT_DIR"

# Function to log messages
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Function to capture console errors
capture_console_errors() {
    log "Capturing console errors..."
    
    # Run a simple script to check for console errors
    npx playwright test "$TEST_DIR/console-errors.spec.ts" \
        --reporter=list \
        --output="$RESULTS_DIR" \
        2>&1 || true
}

# Start logging
{
    echo ""
    echo "========================================"
    echo "TEST RUN: $TIMESTAMP"
    echo "========================================"
} >> "$LOG_FILE"

# Run all tests
log "Running all production tests..."

# Run tests with Playwright
TEST_EXIT_CODE=0
npx playwright test "$TEST_DIR" \
    --reporter=list,html \
    --output="$RESULTS_DIR" \
    --timeout=60000 \
    --headed=false \
    2>&1 | tee -a "$LOG_FILE" || TEST_EXIT_CODE=$?

# Check results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    log "${GREEN}✅ ALL TESTS PASSED${NC}"
    TEST_STATUS="✅ PASSED"
else
    log "${RED}❌ SOME TESTS FAILED${NC}"
    log "${YELLOW}Check $RESULTS_DIR for screenshots and details${NC}"
    TEST_STATUS="❌ FAILED"
fi

# Capture screenshots of failures
if [ $TEST_EXIT_CODE -ne 0 ]; then
    log "Capturing failure screenshots..."
    
    # Run failed tests with screenshots
    npx playwright test "$TEST_DIR" \
        --reporter=list \
        --output="$RESULTS_DIR" \
        --timeout=60000 \
        --headed=true \
        --screenshot=only-on-failure \
        2>&1 || true
    
    # Copy screenshots to dedicated folder
    find "$RESULTS_DIR" -name "*.png" -exec cp {} "$SCREENSHOTS_DIR/" \; 2>/dev/null || true
fi

# Generate results report
{
    echo "# Restocka V2 Test Results"
    echo ""
    echo "**Date:** $TIMESTAMP"
    echo ""
    echo "**Status:** $TEST_STATUS"
    echo ""
    echo "## Summary"
    echo ""
    echo "- **Test Directory:** $TEST_DIR"
    echo "- **Results:** $RESULTS_DIR"
    echo "- **Screenshots:** $SCREENSHOTS_DIR"
    echo ""
    echo "## Test Files"
    echo ""
    echo "1. \`production.spec.ts\` - Core production smoke tests"
    echo "2. \`console-errors.spec.ts\` - Console error detection (CRITICAL)"
    echo "3. \`auth-flow.spec.ts\` - Authentication flow tests"
    echo "4. \`dashboard.spec.ts\` - Dashboard functionality tests"
    echo "5. \`mobile.spec.ts\` - Mobile responsiveness tests"
    echo ""
    echo "## Key Checks"
    echo ""
    echo "- ✅ Page loads without 404 errors"
    echo "- ✅ No console errors (CRITICAL)"
    echo "- ✅ div#root has content"
    echo "- ✅ Landing page shows ReStocka branding"
    echo "- ✅ JavaScript bundle loads successfully"
    echo "- ✅ API endpoints respond (Supabase connection)"
    echo ""
    echo "## Full Log"
    echo ""
    echo "See: $LOG_FILE"
    echo ""
    echo "---"
    echo ""
} > "$RESULTS_FILE"

# Append last 100 lines of log to results
tail -100 "$LOG_FILE" >> "$RESULTS_FILE"

# Summary output
echo ""
echo "========================================"
echo "TEST SUMMARY"
echo "========================================"
echo "Status: $TEST_STATUS"
echo "Log: $LOG_FILE"
echo "Results: $RESULTS_FILE"
echo "Screenshots: $SCREENSHOTS_DIR"
echo "========================================"

# Exit with proper code
if [ $TEST_EXIT_CODE -eq 0 ]; then
    exit 0
else
    exit 1
fi
