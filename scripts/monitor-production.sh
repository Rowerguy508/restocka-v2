#!/bin/bash

# Restocka V2 Production Monitoring Script
# Runs tests every 15 minutes and sends alerts on failure

set -e

# Configuration
PROJECT_DIR="/Users/claudio/.openclaw/workspace/projects/restocka-v2"
TEST_SCRIPT="${PROJECT_DIR}/scripts/test-production.sh"
LOG_FILE="/Users/claudio/.openclaw/workspace/state/restocka-tests.log"
ALERT_LOG="/Users/claudio/.openclaw/workspace/state/restocka-alerts.log"
RESULTS_FILE="/Users/claudio/.openclaw/workspace/memory/restocka-test-results.md"
ALERT_THRESHOLD=3  # Send alert after 3 consecutive failures

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log alert
    echo "[ALERT $timestamp] $message" >> "$ALERT_LOG"
    
    # You can extend this to send real alerts (email, Slack, etc.)
    echo "${RED}🚨 ALERT: $message${NC}"
    
    # For now, just log it
    # To add email/Slack alerts, uncomment below:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"Restocka V2 Alert: $message\"}" \
    #   "$SLACK_WEBHOOK_URL" 2>/dev/null || true
}

# Monitoring loop
run_monitoring() {
    local consecutive_failures=0
    local last_status="unknown"
    
    log "========================================"
    log "Starting Restocka V2 Monitoring"
    log "Interval: 15 minutes"
    log "========================================"
    
    while true; do
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        log "--- Monitor Check: $timestamp ---"
        
        # Run tests
        if bash "$TEST_SCRIPT" >> "$LOG_FILE" 2>&1; then
            log "✅ Tests PASSED"
            
            if [ "$last_status" = "failed" ]; then
                send_alert "Restocka V2 is back online - tests passing again"
            fi
            
            consecutive_failures=0
            last_status="passed"
            
            # Update results file with success
            {
                echo "# Restocka V2 Test Results"
                echo ""
                echo "**Last Check:** $timestamp"
                echo "**Status:** ✅ HEALTHY"
                echo ""
                echo "All tests passing. System operational."
            } > "$RESULTS_FILE"
            
        else
            log "❌ Tests FAILED"
            consecutive_failures=$((consecutive_failures + 1))
            last_status="failed"
            
            # Update results file with failure
            {
                echo "# Restocka V2 Test Results"
                echo ""
                echo "**Last Check:** $timestamp"
                echo "**Status:** ❌ FAILED"
                echo ""
                echo "**Consecutive Failures:** $consecutive_failures"
                echo ""
                echo "See full log: $LOG_FILE"
            } > "$RESULTS_FILE"
            
            # Send alert if threshold reached
            if [ $consecutive_failures -ge $ALERT_THRESHOLD ]; then
                send_alert "Restocka V2 has failed $consecutive_failures consecutive checks!"
            fi
        fi
        
        # Update status file
        echo "{\"status\":\"$last_status\",\"last_check\":\"$timestamp\",\"failures\":$consecutive_failures}" > \
            "/Users/claudio/.openclaw/workspace/state/restocka-status.json"
        
        # Wait 15 minutes (900 seconds) before next check
        log "Next check in 15 minutes..."
        sleep 900
    done
}

# Run monitoring (or just one check if DEBUG mode)
if [ "$1" = "--once" ]; then
    log "Running single test check..."
    bash "$TEST_SCRIPT"
else
    run_monitoring
fi
