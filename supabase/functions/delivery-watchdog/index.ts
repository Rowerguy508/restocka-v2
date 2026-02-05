
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Fetch all SENT orders that haven't been confirmed
        // Include supplier lead time
        const { data: openOrders, error: fetchError } = await supabase
            .from('purchase_orders')
            .select(`
        *,
        supplier:supplier_id (name, lead_time_hours)
      `)
            .eq('status', 'SENT');

        if (fetchError) throw fetchError;

        const stats = {
            checked: openOrders?.length || 0,
            sla_breaches: 0,
            alerts_created: 0
        };

        if (!openOrders || openOrders.length === 0) {
            return new Response(JSON.stringify(stats), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const now = new Date();

        // 2. Filter for breaches
        for (const po of openOrders) {
            // If already delivered, skip (though status SENT filter should handle it)
            if (po.delivered_at) continue;

            const sentAt = new Date(po.sent_at || po.created_at);
            const leadTimeHours = po.supplier?.lead_time_hours || 24;
            const expectedDelivery = new Date(sentAt.getTime() + leadTimeHours * 60 * 60 * 1000);

            if (now > expectedDelivery) {
                stats.sla_breaches++;

                // 3. Create Critical Alert if one doesn't exist for this PO breach
                const message = `ENTREGA ATRASADA: Pedido #${po.id.slice(0, 8)} de ${po.supplier?.name}`;

                const { data: existingAlert } = await supabase
                    .from('alerts')
                    .select('id')
                    .eq('organization_id', po.organization_id)
                    .eq('type', 'DELIVERY_LATE')
                    .eq('message', message)
                    .single();

                if (!existingAlert) {
                    await supabase.from('alerts').insert({
                        organization_id: po.organization_id,
                        location_id: po.location_id,
                        severity: 'CRIT',
                        type: 'DELIVERY_LATE',
                        message: message,
                    });

                    // 4. Log SLA breach
                    await supabase.from('audit_logs').insert({
                        organization_id: po.organization_id,
                        action: 'SLA_BREACH',
                        entity_type: 'purchase_orders',
                        entity_id: po.id,
                        details: { delay_hours: (now.getTime() - expectedDelivery.getTime()) / (1000 * 60 * 60) }
                    });

                    stats.alerts_created++;
                }
            }
        }

        return new Response(JSON.stringify(stats), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error('Error in delivery watchdog:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
