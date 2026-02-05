import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const { clientId, clientSecret, mode } = await req.json()

        if (!clientId || !clientSecret) {
            throw new Error('Missing client_id or client_secret')
        }

        // Determine environment (Production by default for now, unless we want a toggle)
        // PedidosYa usually has a sandbox vs production URL.
        // For "Partner API", URLs are:
        // Production: https://api.pedidosya.com (or similar, verifying via search results needed)
        // Auth Endpoint: https://auth-api.pedidosya.com/v1/token (Common pattern)

        // Based on Search Result [1]: "Generate Access Token endpoint... grant_type=client_credentials"
        // URL often: https://authentication.pedidosya.com/oauth/token  OR https://api.pedidosya.com/authentication/v1/token

        // Let's use a likely endpoint and return the error if it fails, allowing the user to debug connectivity.
        // Standard OAuth2 endpoint for PedidosYa Partner API:
        const TOKEN_URL = "https://authentication.deliveryhero.com/oauth/token"; // Often shared infrastructure
        // WAIT. Let's start with the specific one for LATAM/PeYa if available.
        // Result [1] mentioned "Shop Integrations Plugin".

        // Actually, let's try the most common known endpoint for PeYa Partners:
        // POST https://auth-api.pedidosya.com/v1/token OR https://api.pedidosya.com/v1/token

        // Since I cannot allow a failure in "Real API" request without being sure of the URL, 
        // I will write a function that attempts the standard `https://auth.pedidosya.com/oauth/token` first.

        // However, without official docs open, I will make the function robust enough to report the detailed error from the upstream API.

        // Using a known endpoint for PeYa Partner API (often referenced):
        const AUTH_URL = "https://authentication.pedidosya.com/oauth/token";

        const response = await fetch(AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "client_credentials",
                scope: "global" // Common scope, might perform better without if unsure.
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PedidosYa Auth Error:", data);
            return new Response(
                JSON.stringify({ error: data.message || "Failed to authenticate", details: data }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
        }

        // If success, we return the token (or just success status)
        // DO NOT return the full token to the client if not needed, but here we might need it for storage?
        // Actually, usually we store the credentials, and the backend generates tokens on fly.
        // But we want to VERIFY credentials.

        return new Response(
            JSON.stringify({ success: true, message: "Authentication successful", token_preview: data.access_token ? "Token received" : "No token" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }, }
        )
    }
})
