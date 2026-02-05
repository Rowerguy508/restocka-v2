
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { evaluateReorder, ReorderContext } from "./decision.ts";

// DB Types (Simplified for query)
interface RuleRow {
    organization_id: string;
    location_id: string;
    product_id: string;
    supplier_id: string | null;
    safety_days: number;
    reorder_qty: number;
    automation_mode: string;
    emergency_override: boolean;
    stock_on_hand: number; // joined
    daily_usage: number;   // joined
}

serve(async (req) => {
    // 1. Setup Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Parse Input
    let payload: { organization_id?: string; run_mode?: 'DRY_RUN' | 'EXECUTE' } = {};
    try {
        payload = await req.json();
    } catch {
        // use default
    }
    const { organization_id, run_mode = 'EXECUTE' } = payload;
    const isDryRun = run_mode === 'DRY_RUN';


    // 3. Fetch Data
    let query = supabase
        .from('reorder_rules')
        .select(`
            organization_id, location_id, product_id, supplier_id,
            safety_days, reorder_qty, automation_mode, emergency_override,
            stock_levels!inner(quantity),
            usage_rates!inner(daily_usage)
        `)
        .eq('active', true);

    if (organization_id) {
        query = query.eq('organization_id', organization_id);
    }

    const { data: rules, error } = await query;

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // 3b. Fetch Historical Context for confidence scoring (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Late delivery alerts
    const { data: lateAlerts } = await supabase
        .from('alerts')
        .select('product_id, location_id')
        .eq('type', 'DELIVERY_LATE')
        .gt('created_at', thirtyDaysAgo);

    // Emergency orders
    const { data: emergencyPOs } = await supabase
        .from('purchase_orders')
        .select('id, location_id, items:purchase_order_items(product_id)')
        .eq('is_emergency', true)
        .gt('created_at', thirtyDaysAgo);

    const stats = {
        processed: 0,
        alerts: 0,
        drafts: 0,
        sent: 0,
        skipped_idempotency: 0,
        errors: 0
    };

    // 4. Process
    for (const rule of rules as any[]) {
        stats.processed++;

        const stock = Array.isArray(rule.stock_levels) ? rule.stock_levels[0] : rule.stock_levels;
        const usage = Array.isArray(rule.usage_rates) ? rule.usage_rates[0] : rule.usage_rates;

        // Filter historical stats for this specific item
        const itemLateCount = lateAlerts?.filter(a => a.product_id === rule.product_id && a.location_id === rule.location_id).length ?? 0;
        const itemEmergencyCount = emergencyPOs?.filter(po =>
            po.location_id === rule.location_id &&
            (Array.isArray(po.items) ? po.items.some((i: any) => i.product_id === rule.product_id) : po.items?.product_id === rule.product_id)
        ).length ?? 0;

        const ctx: ReorderContext = {
            onHand: stock?.quantity ?? 0,
            dailyUsage: usage?.daily_usage ?? 0,
            safetyDays: rule.safety_days,
            reorderQty: rule.reorder_qty,
            emergencyOverride: rule.emergency_override,
            automationMode: rule.automation_mode as any,
            lateDeliveriesCount: itemLateCount,
            emergencyOrdersCount: itemEmergencyCount
        };

        const decision = evaluateReorder(ctx);

        if (decision.shouldReorder && decision.action !== 'NONE') {
            // Check Idempotency (unchanged logic)
            const { data: existingPOs } = await supabase
                .from('purchase_order_items')
                .select('purchase_order_id, purchase_orders!inner(status, created_at, organization_id)')
                .eq('product_id', rule.product_id)
                .eq('purchase_orders.organization_id', rule.organization_id)
                .in('purchase_orders.status', ['DRAFT', 'SENT'])
                .gt('purchase_orders.created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            if (existingPOs && existingPOs.length > 0) {
                stats.skipped_idempotency++;
                continue;
            }

            if (isDryRun) {
                if (decision.action === 'ALERT') stats.alerts++;
                if (decision.action === 'DRAFT') stats.drafts++;
                if (decision.action === 'SENT') stats.sent++;
                continue;
            }

            // EXECUTE
            try {
                if (decision.action === 'ALERT') {
                    await supabase.from('alerts').insert({
                        organization_id: rule.organization_id,
                        location_id: rule.location_id,
                        severity: decision.isEmergency ? 'CRIT' : 'WARN',
                        type: 'REORDER_NEEDED',
                        message: `Low stock for product ${rule.product_id}. Days remaining: ${decision.daysRemaining.toFixed(1)}. Confidence: ${decision.confidenceScore.toFixed(2)}`
                    });
                    stats.alerts++;
                } else if (decision.action === 'DRAFT' || decision.action === 'SENT') {
                    // Create PO
                    const { data: po, error: poError } = await supabase
                        .from('purchase_orders')
                        .insert({
                            organization_id: rule.organization_id,
                            location_id: rule.location_id,
                            supplier_id: rule.supplier_id,
                            status: decision.action,
                            is_emergency: decision.isEmergency
                        })
                        .select()
                        .single();

                    if (poError || !po) throw poError;

                    // Create Item
                    await supabase.from('purchase_order_items').insert({
                        purchase_order_id: po.id,
                        product_id: rule.product_id,
                        qty: decision.quantity,
                        unit_price: null
                    });

                    // Log (include confidence data)
                    await supabase.from('audit_logs').insert({
                        organization_id: rule.organization_id,
                        action: `CREATE_PO_${decision.action}`,
                        entity_type: 'purchase_orders',
                        entity_id: po.id,
                        metadata: {
                            decision,
                            stats: { late: itemLateCount, emergency: itemEmergencyCount }
                        }
                    });


                    // Message Provider Stub
                    if (decision.action === 'SENT') {
                        // Trigger WhatsApp Sending (Asynchronous invocation)
                        // In a real environment, you might wait or use a queue.
                        // Here we call the function directly via the edge runtime.
                        console.log(`PO ${po.id} is AUTO/EMERGENCY. Triggering WhatsApp send...`);

                        try {
                            const { error: sendError } = await supabase.functions.invoke('send-whatsapp-po', {
                                body: { purchase_order_id: po.id }
                            });

                            if (sendError) {
                                console.error(`Failed to trigger WhatsApp for PO ${po.id}:`, sendError);
                                await supabase.from('purchase_orders').update({
                                    send_error: sendError.message || 'Error triggering WhatsApp'
                                }).eq('id', po.id);
                            }
                        } catch (err) {
                            console.error(`Exception triggering WhatsApp for PO ${po.id}:`, err);
                        }

                        stats.sent++;
                    } else {
                        stats.drafts++;
                        // If assisted, also alert
                        await supabase.from('alerts').insert({
                            organization_id: rule.organization_id,
                            location_id: rule.location_id,
                            severity: 'INFO',
                            type: 'PO_DRAFT_CREATED',
                            message: `Draft PO created for product ${rule.product_id}. Please review.`
                        });
                    }
                }
            } catch (err) {
                console.error("Error executing reorder:", err);
                stats.errors++;
            }
        }
    }

    return new Response(JSON.stringify(stats), {
        headers: { "Content-Type": "application/json" },
    });
});
