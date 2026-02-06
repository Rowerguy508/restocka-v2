const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://zsewmpjceuomivvbyjgl.supabase.co'
// Note: Need to get service role key - check Vercel env or ask user
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_KEY) {
  console.log('Need SUPABASE_SERVICE_KEY env var')
  console.log('Get it from: https://vercel.com/claudio/restocka-v2/settings/environment-variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seedDemo() {
  console.log('🌱 Seeding Pollo Vitorina demo...')

  // Create organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', 'pollos-vitorina')
    .single()

  let orgId = org?.id

  if (!orgId) {
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({
        name: 'Pollos Vitorina',
        slug: 'pollos-vitorina',
        plan: 'pro',
        settings: { currency: 'DOP', timezone: 'America/Santo_Domingo' }
      })
      .select('id')
      .single()
    orgId = newOrg?.id
  }
  console.log('✅ Organization:', orgId)

  // Create location
  const { data: loc } = await supabase
    .from('locations')
    .select('id')
    .eq('organization_id', orgId)
    .eq('name', 'Main')
    .single()

  let locId = loc?.id

  if (!locId) {
    const { data: newLoc } = await supabase
      .from('locations')
      .insert({
        organization_id: orgId,
        name: 'Main',
        address: 'Av.Principal 123, Santo Domingo',
        is_active: true
      })
      .select('id')
      .single()
    locId = newLoc?.id
  }
  console.log('✅ Location:', locId)

  // Products
  const products = [
    { name: 'Pollo Entero', sku: 'POL-001', category: 'Proteínas', unit: 'lb', cost: 3.50, price: 5.99 },
    { name: 'Pechuga de Pollo', sku: 'POL-002', category: 'Proteínas', unit: 'lb', cost: 4.50, price: 7.99 },
    { name: 'Muslos de Pollo', sku: 'POL-003', category: 'Proteínas', unit: 'lb', cost: 3.00, price: 5.49 },
    { name: 'Papas Fritas', sku: 'SID-001', category: 'Acompañamientos', unit: 'lb', cost: 1.20, price: 3.49 },
    { name: 'Arroz Blanco', sku: 'SID-002', category: 'Acompañamientos', unit: 'lb', cost: 0.80, price: 2.49 },
    { name: 'Habichuelas', sku: 'SID-003', category: 'Acompañamientos', unit: 'lb', cost: 1.00, price: 2.99 },
    { name: 'Ensalada Verde', sku: 'SID-004', category: 'Acompañamientos', unit: 'portion', cost: 0.60, price: 2.49 },
    { name: 'Salsa BBQ', sku: 'SAC-001', category: 'Salsas', unit: 'gal', cost: 8.00, price: 15.99 },
    { name: 'Salsa Picante', sku: 'SAC-002', category: 'Salsas', unit: 'gal', cost: 6.00, price: 12.99 },
    { name: 'Ketchup', sku: 'SAC-003', category: 'Salsas', unit: 'gal', cost: 4.00, price: 8.99 },
    { name: 'Refresco Cola', sku: 'BEV-001', category: 'Bebidas', unit: 'can', cost: 0.50, price: 1.49 },
    { name: 'Agua Natural', sku: 'BEV-002', category: 'Bebidas', unit: 'bottle', cost: 0.30, price: 1.00 },
    { name: 'Limonada Natural', sku: 'BEV-003', category: 'Bebidas', unit: 'glass', cost: 0.40, price: 2.49 },
    { name: 'Flan de Queso', sku: 'DES-001', category: 'Postres', unit: 'portion', cost: 0.80, price: 3.49 },
    { name: 'Pastel de Naranja', sku: 'DES-002', category: 'Postres', unit: 'slice', cost: 0.90, price: 3.99 }
  ]

  const productInserts = products.map(p => ({
    organization_id: orgId,
    name: p.name,
    sku: p.sku,
    category: p.category,
    unit: p.unit,
    cost_price: p.cost,
    selling_price: p.price
  }))

  const { data: insertedProducts } = await supabase
    .from('products')
    .upsert(productInserts, { onConflict: 'organization_id,sku' })
    .select('id, sku')

  console.log('✅ Products:', insertedProducts?.length)

  // Stock levels
  const stockData = insertedProducts!.map(p => {
    const product = products.find(pr => pr.sku === p.sku)!
    let qty = 50, status = 'NORMAL'
    
    if (['SID-004', 'SAC-001', 'SAC-003'].includes(product.sku)) {
      qty = 8
      status = 'CRITICAL'
    } else if (['POL-001', 'SID-001', 'SAC-002', 'DES-001'].includes(product.sku)) {
      qty = 20
      status = 'LOW'
    }

    return {
      location_id: locId,
      product_id: p.id,
      quantity: qty,
      min_stock: 15,
      max_stock: 100,
      status,
      usage_rate_per_day: Math.random() * 10 + 1
    }
  })

  await supabase
    .from('stock_levels')
    .upsert(stockData, { onConflict: 'location_id,product_id' })

  console.log('✅ Stock levels created')
  console.log('🎉 Demo data seeded!')
}

seedDemo().catch(console.error)
