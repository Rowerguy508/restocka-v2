
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

        const { purchase_order_id } = await req.json();

        if (!purchase_order_id) throw new Error('Missing purchase_order_id');

        // 1. Fetch PO and Supplier Details
        const { data: po, error: poError } = await supabase
            .from('purchase_orders')
            .select(`
        *,
        supplier:supplier_id (*),
        items:purchase_order_items (
          quantity,
          product:product_id (name, unit)
        )
      `)
            .eq('id', purchase_order_id)
            .single();

        if (poError || !po) throw poError || new Error('PO not found');
        if (!po.supplier?.whatsapp_phone) throw new Error('Supplier missing WhatsApp phone');

        // 2. Fetch WhatsApp Integration Settings
        const { data: integration, error: intError } = await supabase
            .from('integrations')
            .select('*')
            .eq('organization_id', po.organization_id)
            .eq('provider', 'WHATSAPP')
            .eq('status', 'CONNECTED')
            .single();

        // If no real integration, we stop or log "STUB" if in dev?
        // According to V2 plan: "Orders sent automatically when automation_mode = AUTO".
        // We expect the user to have provided credentials.

        if (intError || !integration) {
            console.warn('WhatsApp integration not configured or connected. Order will not be sent.');
            return new Response(JSON.stringify({ success: false, error: 'Integration not configured' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { access_token, phone_number_id } = integration.settings as any;
        if (!access_token || !phone_number_id) throw new Error('Incomplete WhatsApp settings');

        // 3. Construct Message Detail
        const itemsList = po.items.map((i: any) => `- ${i.product.name}: ${i.quantity} ${i.product.unit}`).join('\n');
        const messageBody = `*Nuevo Pedido de ReStocka*\n\nHola ${po.supplier.name},\n\nNecesitamos reponer los siguientes productos:\n${itemsList}\n\nFavor confirmar recepción.`;

        // 4. Send via Meta API
        // Implementation of Meta Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
        const metaUrl = `https://graph.facebook.com/v17.0/${phone_number_id}/messages`;

        const response = await fetch(metaUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: po.supplier.whatsapp_phone.replace(/\D/g, ''), // Strip non-digits
                type: 'text',
                text: { body: messageBody },
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || 'Failed to send WhatsApp message');
        }

        const messageId = result.messages?.[0]?.id;

        // 5. Update PO
        await supabase.from('purchase_orders').update({
            status: 'SENT',
            sent_at: new Date().toISOString(),
            external_id: messageId,
            send_error: null
        }).eq('id', purchase_order_id);

        // 6. Log success
        await supabase.from('audit_logs').insert({
            organization_id: po.organization_id,
            action: 'WHATSAPP_SENT',
            entity_type: 'purchase_orders',
            entity_id: po.id,
            details: { message_id: messageId, recipient: po.supplier.whatsapp_phone }
        });

        return new Response(JSON.stringify({ success: true, message_id: messageId }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error('Error sending WhatsApp:', error);

        // Attempt to log failure to the PO
        if (error.message && req.json) {
            // We'd need to re-parse or use po context
        }

        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
