
export type AutomationMode = 'MANUAL' | 'ASSISTED' | 'AUTO';


export interface ReorderContext {
    onHand: number;
    dailyUsage: number;
    safetyDays: number;
    reorderQty: number;
    emergencyOverride: boolean;
    automationMode: AutomationMode;
    // V2 Phase 2: Historical context
    lateDeliveriesCount: number;
    emergencyOrdersCount: number;
}

export interface ReorderDecision {
    shouldReorder: boolean;
    isEmergency: boolean;
    action: 'NONE' | 'ALERT' | 'DRAFT' | 'SENT';
    daysRemaining: number;
    quantity: number;
    confidenceScore: number;
    adjustedSafetyDays: number;
}

export const epsilon = 0.0001;

/**
 * Calculates a confidence score from 0.0 to 1.0 based on historical performance.
 * 1.0 = Perfect trust.
 * < 1.0 = System is nervous, needs more buffer.
 */
export function calculateConfidenceScore(lateCount: number, emergencyCount: number): number {
    let score = 1.0;

    // Penalties
    score -= (lateCount * 0.15);      // Late deliveries are heavy signals of unreliability
    score -= (emergencyCount * 0.05); // Emergency overrides suggest buffer was too thin

    return Math.max(0.5, score); // Cap at 0.5 (don't explode buffers too much)
}

export function evaluateReorder(ctx: ReorderContext): ReorderDecision {
    const usage = Math.max(ctx.dailyUsage, epsilon);
    const daysRemaining = ctx.onHand / usage;

    // V2: Adjust safety buffer based on confidence
    const confidenceScore = calculateConfidenceScore(ctx.lateDeliveriesCount, ctx.emergencyOrdersCount);
    const confidenceMultiplier = 1 / confidenceScore; // Lower confidence = Higher multiplier
    const adjustedSafetyDays = ctx.safetyDays * confidenceMultiplier;

    const shouldReorder = daysRemaining < adjustedSafetyDays;
    const isEmergency = ctx.emergencyOverride && daysRemaining <= 1.0;

    if (isEmergency) {
        return {
            shouldReorder: true,
            isEmergency: true,
            action: 'SENT',
            daysRemaining,
            quantity: ctx.reorderQty,
            confidenceScore,
            adjustedSafetyDays
        };
    }

    if (!shouldReorder) {
        return {
            shouldReorder: false,
            isEmergency: false,
            action: 'NONE',
            daysRemaining,
            quantity: 0,
            confidenceScore,
            adjustedSafetyDays
        };
    }

    // Normal reorder trigger
    let action: ReorderDecision['action'] = 'ALERT'; // Default for MANUAL
    if (ctx.automationMode === 'ASSISTED') {
        action = 'DRAFT';
    } else if (ctx.automationMode === 'AUTO') {
        action = 'SENT';
    }

    return {
        shouldReorder: true,
        isEmergency: false,
        action,
        daysRemaining,
        quantity: ctx.reorderQty,
        confidenceScore,
        adjustedSafetyDays
    };
}

