
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { evaluateReorder, ReorderContext } from "./decision.ts";

Deno.test("No reorder needed when stock is high", () => {
    const ctx: ReorderContext = {
        onHand: 100, dailyUsage: 1, safetyDays: 3, reorderQty: 10,
        emergencyOverride: false, automationMode: 'MANUAL'
    };
    const res = evaluateReorder(ctx);
    assertEquals(res.action, 'NONE');
    assertEquals(res.shouldReorder, false);
});

Deno.test("Manual reorder triggers ALERT only", () => {
    const ctx: ReorderContext = {
        onHand: 2, dailyUsage: 1, safetyDays: 3, reorderQty: 10,
        emergencyOverride: false, automationMode: 'MANUAL'
    };
    const res = evaluateReorder(ctx);
    assertEquals(res.action, 'ALERT');
});

Deno.test("Assisted reorder triggers DRAFT", () => {
    const ctx: ReorderContext = {
        onHand: 2, dailyUsage: 1, safetyDays: 3, reorderQty: 10,
        emergencyOverride: false, automationMode: 'ASSISTED'
    };
    const res = evaluateReorder(ctx);
    assertEquals(res.action, 'DRAFT');
});

Deno.test("Auto reorder triggers SENT", () => {
    const ctx: ReorderContext = {
        onHand: 2, dailyUsage: 1, safetyDays: 3, reorderQty: 10,
        emergencyOverride: false, automationMode: 'AUTO'
    };
    const res = evaluateReorder(ctx);
    assertEquals(res.action, 'SENT');
});

Deno.test("Emergency override forces SENT even if MANUAL", () => {
    const ctx: ReorderContext = {
        onHand: 0.5, dailyUsage: 1, safetyDays: 3, reorderQty: 10,
        emergencyOverride: true, automationMode: 'MANUAL'
    };
    const res = evaluateReorder(ctx);
    assertEquals(res.action, 'SENT');
    assertEquals(res.isEmergency, true);
});
