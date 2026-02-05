import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { action, rnc } = await req.json();

        if (action === 'rnc-lookup' && rnc) {
            // Use a known community RNC lookup endpoint
            // This is a common "unofficial" but public endpoint for DR devs
            const rncResponse = await fetch(`https://rnc.megaplus.com.do/api/rnc/${rnc}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!rncResponse.ok) {
                throw new Error('Could not fetch RNC data');
            }

            const data = await rncResponse.json();
            return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (action === 'exchange-rate') {
            // Fetch USD to DOP exchange rate
            // Using a fast public API for the demo, but could be swapped for BCRD scraper
            const rateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const rateData = await rateResponse.json();

            return new Response(JSON.stringify({
                usd_to_dop: rateData.rates.DOP,
                updated_at: rateData.date
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
