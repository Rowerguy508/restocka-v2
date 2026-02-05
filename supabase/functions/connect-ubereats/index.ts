import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { clientId, clientSecret } = await req.json()

        if (!clientId || !clientSecret) {
            throw new Error('Missing client_id or client_secret')
        }

        const TOKEN_URL = "https://auth.uber.com/oauth/v2/token";

        // Auth request body
        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
            scope: "eats.store" // Common scope for accessing store data
        });

        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Uber Auth Error:", data);
            return new Response(
                JSON.stringify({ error: data.error_description || data.message || "Failed to authenticate with Uber", details: data }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "Authentication successful" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }, }
        )
    }
})
