/**
 * Demo Data Seeder for Restocka
 * Creates a fully populated demo restaurant with inventory, orders, and alerts
 * 
 * Usage: node seed-demo-data.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Get these from Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://zsewmpjceuomivvbyjgl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Need SUPABASE_SERVICE_KEY environment variable');
  console.log('Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Demo user credentials
const DEMO_USER = {
  email: 'demo@restocka.app',
  password: 'Demo123!@#',
  name: 'Demo Restaurant Manager'
};

// Demo restaurant data
const DEMO_ORG = {
  name: 'La Casa del Sabor - Demo',
  type: 'restaurant'
};

const DEMO_LOCATION = {
  name: 'Casa Matriz - Santo Domingo',
  address: 'Av. Winston Churchill #123, Santo Domingo'
};

// Demo products with realistic Dominican restaurant inventory
const PRODUCTS = [
  // Proteins - Critical items
  { name: 'Pollo Entero', category: 'Proteínas', unit: 'UNIT', cost: 85, price: 0 },
  { name: 'Pechuga de Pollo', category: 'Proteínas', unit: 'KG', cost: 180, price: 0 },
  { name: 'Muslos de Pollo', category: 'Proteínas', unit: 'KG', cost: 120, price: 0 },
  { name: 'Chuleta Ahumada', category: 'Proteínas', unit: 'KG', cost: 350, price: 0 },
  { name: 'Bistec de Res', category: 'Proteínas', unit: 'KG', cost: 450, price: 0 },
  
  // Accompaniments
  { name: 'Papas Fritas', category: 'Acompañamientos', unit: 'KG', cost: 45, price: 0 },
  { name: 'Arroz Blanco', category: 'Acompañamientos', unit: 'KG', cost: 35, price: 0 },
  { name: 'Habichuelas Guisadas', category: 'Acompañamientos', unit: 'GALON', cost: 120, price: 0 },
  { name: 'Ensalada Verde', category: 'Acompañamientos', unit: 'KG', cost: 80, price: 0 },
  { name: 'Mangu', category: 'Acompañamientos', unit: 'KG', cost: 60, price: 0 },
  
  // Sauces
  { name: 'Salsa BBQ', category: 'Salsas', unit: 'LITRO', cost: 150, price: 0 },
  { name: 'Salsa Picante', category: 'Salsas', unit: 'LITRO', cost: 80, price: 0 },
  { name: 'Ketchup', category: 'Salsas', unit: 'LITRO', cost: 60, price: 0 },
  { name: 'Mayonesa', category: 'Salsas', unit: 'LITRO', cost: 95, price: 0 },
  
  // Drinks
  { name: 'Refresco Cola', category: 'Bebidas', unit: 'LATA', cost: 25, price: 0 },
  { name: 'Agua Natural 500ml', category: 'Bebidas', unit: 'UNIT', cost: 15, price: 0 },
  { name: 'Limonada Natural', category: 'Bebidas', unit: 'LITRO', cost: 40, price: 0 },
  { name: 'Cerveza Nacional', category: 'Bebidas', unit: 'UNIT', cost: 55, price: 0 },
  
  // Desserts
  { name: 'Flan de Queso', category: 'Postres', unit: 'UNIT', cost: 35, price: 0 },
  { name: 'Pastel de Naranja', category: 'Postres', unit: 'UNIT', cost: 45, price: 0 },
  { name: 'Brownie con Helado', category: 'Postres', unit: 'UNIT', cost: 65, price: 0 },
];

// Inventory with various stock levels
const INVENTORY = [
  // CRITICAL - Need immediate reorder
  { product_idx: 0, qty: 0, status: 'CRITICAL' },      // Pollo Entero - EMPTY
  { product_idx: 4, qty: 1.5, status: 'CRITICAL' },    // Bistec - Almost empty
  
  // LOW - Should reorder soon
  { product_idx: 2, qty: 4, status: 'LOW' },           // Muslos - Low
  { product_idx: 5, qty: 3, status: 'LOW' },           // Papas - Low
  { product_idx: 10, qty: 2, status: 'LOW' },          // BBQ - Low
  { product_idx: 16, qty: 8, status: 'LOW' },          // Cerveza - Low
  
  // NORMAL - Good stock
  { product_idx: 1, qty: 25, status: 'NORMAL' },       // Pechuga - Good
  { product_idx: 3, qty: 15, status: 'NORMAL' },       // Chuleta - Good
  { product_idx: 6, qty: 50, status: 'NORMAL' },       // Arroz - Good
  { product_idx: 7, qty: 8, status: 'NORMAL' },        // Habichuelas - Good
  { product_idx: 8, qty: 12, status: 'NORMAL' },       // Ensalada - Good
  { product_idx: 9, qty: 20, status: 'NORMAL' },       // Mangu - Good
  { product_idx: 11, qty: 6, status: 'NORMAL' },       // Picante - Good
  { product_idx: 12, qty: 10, status: 'NORMAL' },      // Ketchup - Good
  { product_idx: 13, qty: 8, status: 'NORMAL' },       // Mayonesa - Good
  { product_idx: 14, qty: 48, status: 'NORMAL' },      // Refresco - Good
  { product_idx: 15, qty: 36, status: 'NORMAL' },      // Agua - Good
  { product_idx: 17, qty: 24, status: 'NORMAL' },      // Limonada - Good
  { product_idx: 18, qty: 15, status: 'NORMAL' },      // Flan - Good
  { product_idx: 19, qty: 12, status: 'NORMAL' },      // Pastel - Good
  { product_idx: 20, qty: 20, status: 'NORMAL' },      // Brownie - Good
];

// Demo suppliers
const SUPPLIERS = [
  { name: 'Distribuidora del Caribe', phone: '809-555-0101', email: 'ventas@caribe.do', category: 'General' },
  { name: 'Carnes Premium', phone: '809-555-0202', email: 'pedidos@carnespremium.com', category: 'Proteínas' },
  { name: 'Bebidas del Norte', phone: '809-555-0303', email: 'ordenes@bebidasnorte.com', category: 'Bebidas' },
  { name: 'Verduras Frescas', phone: '809-555-0404', email: 'entregas@verdurasfrescas.com', category: 'Vegetales' },
];

// Demo purchase orders
const PURCHASE_ORDERS = [
  {
    supplier_idx: 0,
    status: 'DRAFT',
    items: [
      { product_idx: 0, qty: 50, unit_price: 82 },  // Pollo Entero
      { product_idx: 5, qty: 20, unit_price: 42 },  // Papas
    ]
  },
  {
    supplier_idx: 1,
    status: 'PENDING',
    items: [
      { product_idx: 4, qty: 15, unit_price: 440 }, // Bistec
      { product_idx: 3, qty: 20, unit_price: 340 }, // Chuleta
    ]
  },
  {
    supplier_idx: 2,
    status: 'APPROVED',
    items: [
      { product_idx: 16, qty: 24, unit_price: 52 }, // Cerveza
      { product_idx: 14, qty: 72, unit_price: 22 }, // Refresco
    ]
  }
];

// Demo alerts
const ALERTS = [
  { type: 'STOCK_CRITICAL', product_idx: 0, message: 'Pollo Entero agotado - 无法 servir platos principales' },
  { type: 'STOCK_LOW', product_idx: 2, message: 'Muslos de Pollo bajo - Solo quedan 4 kg' },
  { type: 'ORDER_DELAYED', message: 'Orden #PO-2026-001 con Carnes Premium retrasada' },
  { type: 'PRICE_CHANGE', product_idx: 4, message: 'Bistec de Res aumentó de RD$420 a RD$450' },
];

async function seedDemoData() {
  console.log('🌱 Starting Demo Data Seeding...\n');
  
  try {
    // Step 1: Create demo user
    console.log('1. Creating demo user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      email_confirmed: true,  // Skip email confirmation for demo
      user_metadata: {
        full_name: DEMO_USER.name
      }
    });
    
    if (authError) {
      // User might already exist
      console.log('   User might exist, trying to get existing user...');
      const { data: existing } = await supabase.auth.signInWithPassword({
        email: DEMO_USER.email,
        password: DEMO_USER.password
      });
      
      if (existing.user) {
        console.log('   ✅ Demo user already exists');
        var userId = existing.user.id;
      } else {
        throw authError;
      }
    } else {
      console.log('   ✅ Demo user created:', authUser.user.email);
      var userId = authUser.user.id;
    }
    
    // Step 2: Create organization
    console.log('\n2. Creating demo organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: DEMO_ORG.name })
      .select()
      .single();
    
    if (orgError) throw orgError;
    console.log('   ✅ Organization created:', org.name);
    
    // Step 3: Create location
    console.log('\n3. Creating demo location...');
    const { data: location, error: locError } = await supabase
      .from('locations')
      .insert({ 
        organization_id: org.id, 
        name: DEMO_LOCATION.name,
        address: DEMO_LOCATION.address
      })
      .select()
      .single();
    
    if (locError) throw locError;
    console.log('   ✅ Location created:', location.name);
    
    // Step 4: Create membership for demo user
    console.log('\n4. Creating membership...');
    const { error: memError } = await supabase
      .from('memberships')
      .insert({
        user_id: userId,
        organization_id: org.id,
        role: 'OWNER',
        status: 'ACTIVE'
      });
    
    if (memError) throw memError;
    console.log('   ✅ Membership created');
    
    // Step 5: Create suppliers
    console.log('\n5. Creating suppliers...');
    const { data: suppliers, error: supError } = await supabase
      .from('suppliers')
      .insert(SABLE_SUPPLIERS.map(s => ({ ...s, organization_id: org.id })))
      .select();
    
    if (supError) throw supError;
    console.log('   ✅ Suppliers created:', suppliers.length);
    
    // Step 6: Create products
    console.log('\n6. Creating products...');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .insert(PRODUCTS.map(p => ({ ...p, organization_id: org.id })))
      .select();
    
    if (prodError) throw prodError;
    console.log('   ✅ Products created:', products.length);
    
    // Step 7: Create inventory
    console.log('\n7. Creating inventory...');
    const inventoryData = INVENTORY.map(inv => ({
      organization_id: org.id,
      location_id: location.id,
      product_id: products[inv.product_idx].id,
      quantity: inv.qty,
      status: inv.status,
      last_checked: new Date().toISOString()
    }));
    
    const { error: invError } = await supabase
      .from('inventory')
      .insert(inventoryData);
    
    if (invError) throw invError;
    console.log('   ✅ Inventory created:', inventoryData.length, 'items');
    
    // Step 8: Create purchase orders
    console.log('\n8. Creating purchase orders...');
    const poData = PURCHASE_ORDERS.map((po, idx) => ({
      organization_id: org.id,
      supplier_id: suppliers[po.supplier_idx].id,
      status: po.status,
      created_at: new Date(Date.now() - idx * 86400000).toISOString(),
      expected_delivery: po.status === 'APPROVED' 
        ? new Date(Date.now() + 86400000).toISOString()
        : null
    }));
    
    const { data: pos, error: poError } = await supabase
      .from('purchase_orders')
      .insert(poData)
      .select();
    
    if (poError) throw poError;
    console.log('   ✅ Purchase orders created:', pos.length);
    
    // Step 9: Create PO items
    console.log('\n9. Creating PO items...');
    const poItems = [];
    for (let i = 0; i < PURCHASE_ORDERS.length; i++) {
      const po = PURCHASE_ORDERS[i];
      for (const item of po.items) {
        poItems.push({
          purchase_order_id: pos[i].id,
          product_id: products[item.product_idx].id,
          quantity: item.qty,
          unit_price: item.unit_price,
          total: item.qty * item.unit_price
        });
      }
    }
    
    const { error: poiError } = await supabase
      .from('purchase_order_items')
      .insert(poItems);
    
    if (poiError) throw poiError;
    console.log('   ✅ PO items created:', poItems.length);
    
    // Step 10: Create alerts
    console.log('\n10. Creating alerts...');
    const alertsData = ALERTS.map(alert => ({
      organization_id: org.id,
      type: alert.type,
      product_id: alert.product_idx !== undefined ? products[alert.product_idx].id : null,
      message: alert.message,
      resolved: false,
      created_at: new Date().toISOString()
    }));
    
    const { error: alertError } = await supabase
      .from('alerts')
      .insert(alertsData);
    
    if (alertError) throw alertError;
    console.log('   ✅ Alerts created:', alertsData.length);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📧 Demo Login Credentials:');
    console.log('   Email:', DEMO_USER.email);
    console.log('   Password:', DEMO_USER.password);
    console.log('\n📊 Demo Data Summary:');
    console.log('   - Organization:', DEMO_ORG.name);
    console.log('   - Location:', DEMO_LOCATION.name);
    console.log('   - Products:', products.length);
    console.log('   - Inventory Items:', inventoryData.length);
    console.log('   - Suppliers:', suppliers.length);
    console.log('   - Purchase Orders:', pos.length);
    console.log('   - Alerts:', alertsData.length);
    console.log('\n⚠️  CRITICAL Items:', inventoryData.filter(i => i.status === 'CRITICAL').length);
    console.log('⚠️  LOW Items:', inventoryData.filter(i => i.status === 'LOW').length);
    console.log('✅ NORMAL Items:', inventoryData.filter(i => i.status === 'NORMAL').length);
    console.log('\n🔗 Login URL: https://restocka.app/login');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ ERROR seeding demo data:', error.message);
    if (error.details) console.error('Details:', error.details);
    process.exit(1);
  }
}

// Fix typo in suppliers array
const SABLE_SUPPLIERS = SUPPLIERS;

seedDemoData();
