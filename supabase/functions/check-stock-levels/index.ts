import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { organization_id } = await req.json()

        if (!organization_id) throw new Error('Missing organization_id')

        // 1. Get all low stock items
        const { data: lowStockItems, error: fetchError } = await supabaseClient
            .from('stock_levels')
            .select(`
        id, 
        quantity, 
        min_quantity,
        product_id,
        location_id,
        products ( name, default_supplier_id )
      `)
            .lt('quantity', 'min_quantity') // This comparison might need raw filter if types differ, but standard postgrest supports col comparisons? No, actually .lt('col', val). 
        // PostgREST doesn't easily support column-to-column comparison in simple filters.
        // We will fetch all items for the org (or active location likely?) and filter in code for now to be safe and fast for MVP.
        // Better: Use a view or RPC, but let's fetch all checking 'min_quantity' is not null.

        // Let's refine: Fetch all stock levels for this org's locations.
        // First get locations? Or just join.
        // Simple approach: Fetch all stock_levels joined with products for this org.

        // Optimized approach: Check "Low Stock" logic in memory for now to ensure correctness.
        const { data: allStock } = await supabaseClient
            .from('stock_levels')
            .select(`
        id, 
        quantity, 
        min_quantity, 
        product_id, 
        location_id,
        products!inner ( organization_id, name, default_supplier_id )
      `)
            .eq('products.organization_id', organization_id);

        if (!allStock) return new Response(JSON.stringify({ checked: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        let alertsCreated = 0;
        const lowItems = allStock.filter((item: any) => item.min_quantity !== null && item.quantity <= item.min_quantity);

        // 2. Create Alerts
        for (const item of lowItems) {
            // Check if alert already exists to avoid spam
            const { data: existing } = await supabaseClient
                .from('alerts')
                .select('id')
                .eq('product_id', item.product_id)
                .eq('resolved', false)
                .single();

            if (!existing) {
                await supabaseClient.from('alerts').insert({
                    organization_id,
                    type: 'LOW_STOCK',
                    priority: item.quantity === 0 ? 'CRITICAL' : 'HIGH',
                    message: `Stock bajo: ${item.products.name} (${item.quantity} restantes)`,
                    product_id: item.product_id,
                    location_id: item.location_id
                });
                alertsCreated++;
            }
        }

        // 3. (Optional) Auto-create draft POs logic could go here
        // For now, just alerts is a huge "Real" step.

        return new Response(
            JSON.stringify({ success: true, checked: allStock.length, low_stock_found: lowItems.length, alerts_created: alertsCreated }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }, }
        )
    }
})
