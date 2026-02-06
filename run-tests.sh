#!/bin/bash
# Restocka V2 Playwright Test Monitor
# Runs every 15 minutes and logs results

PROJECT_DIR="/Users/claudio/.openclaw/workspace/projects/restocka-v2"
LOG_FILE="/Users/claudio/.openclaw/workspace/state/restocka-monitor.log"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

echo "========================================" >> "$LOG_FILE"
echo "Test Run Started: $TIMESTAMP" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

cd "$PROJECT_DIR"

# Run tests and capture output
OUTPUT=$(npx playwright test --reporter=line 2>&1)
EXIT_CODE=$?

echo "$OUTPUT" >> "$LOG_FILE"

# Summary
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Status: ALL TESTS PASSED" >> "$LOG_FILE"
else
    echo "❌ Status: SOME TESTS FAILED (exit code: $EXIT_CODE)" >> "$LOG_FILE"
fi

echo "Test Run Completed: $(date "+%Y-%m-%d %H:%M:%S")" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit $EXIT_CODE
