# Vercel Environment Variables - RESTOCKA

## Add These in Vercel Dashboard

### Settings → Environment Variables

**Required (for Auth to work):**
| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://zsewmpjceuomivvbyjgl.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZXdtcGpjZXVvbWl2dmJ5amdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzM3MTcsImV4cCI6MjA4MzA0OTcxN30.vPwuXwWTr5VkNz-IR-HxN9qp0A50ncETU0vL4SnrckE` |

**Required (for Payments):**
| Variable | Value |
|----------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Get from Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Get from Stripe Dashboard → Developers → API keys |

**Optional (AI Features):**
| Variable | Value |
|----------|-------|
| `VITE_GROK_API_KEY` | Get from xAI dashboard |

## Steps
1. Go to https://vercel.com
2. Select `restocka-v2` project
3. Go to Settings → Environment Variables
4. Add each variable (scope: Production)
5. Trigger redeploy

## After Adding
- Supabase auth will work
- Stripe payments will work
- Signup → Onboarding → Dashboard flow complete

## Stripe Dashboard Setup
1. Create products in Stripe Dashboard:
   - Pro: $29/month → Price ID: `price_pro_monthly`
   - Enterprise: $99/month → Price ID: `price_enterprise_monthly`
2. Update `supabase/functions/create-checkout-session/index.ts` with actual Price IDs
