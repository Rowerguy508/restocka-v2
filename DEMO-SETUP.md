# 🌱 Restocka Demo Data Setup

## Quick Setup (5 minutes)

### Step 1: Create Demo User
1. Go to: https://supabase.com/dashboard/project/zsewmpjceuomivvbyjgl
2. Click: **Authentication** (left sidebar) → **Users**
3. Click: **Add User**
4. Fill in:
   - Email: `demo@restocka.app`
   - Password: `Demo123!@#`
   - Email confirmed: **☑️ Check this**
5. Click: **Create User**
6. **Copy the user ID** from the user list (you'll need it)

### Step 2: Get Organization ID
1. Click: **SQL Editor** (left sidebar)
2. Paste and run:
   ```sql
   SELECT id, name FROM organizations;
   ```
3. **Copy the ID** for "La Casa del Sabor - Demo" (or create it if not exists)

### Step 3: Run Demo Data Script
1. Open: `demo-data-complete.sql`
2. Copy the content
3. Paste in SQL Editor
4. **Replace these placeholders**:
   - `REPLACE_WITH_ORG_ID` → Organization ID from Step 2
   - `REPLACE_WITH_USER_ID` → User ID from Step 1
5. Click: **Run**

### Step 4: Login to Demo
1. Go to: https://restocka.app/login
2. Email: `demo@restocka.app`
3. Password: `Demo123!@#`

---

## 📊 What Gets Created

| Item | Count | Description |
|------|-------|-------------|
| Organization | 1 | "La Casa del Sabor - Demo" |
| Location | 1 | "Casa Matriz - Santo Domingo" |
| Products | 21 | Full restaurant inventory |
| Inventory | 21 | Stock levels (2 critical, 4 low, 15 normal) |
| Suppliers | 4 | Demo suppliers |
| Alerts | 3 | Stock warnings, delayed orders |

## 🎯 Demo Highlights

### Dashboard Will Show:
- **2 CRITICAL** items (Pollo Entero: 0, Bistec: 1.5 kg)
- **4 LOW** items (Muslos, Papas, BBQ, Cerveza)
- **3 Alerts** (stock warnings, delayed order)

### To See All Features:
1. **Critical Items** → Go to `/app/owner` → See red cards
2. **Stock History** → Click a product → View trends
3. **Purchase Orders** → Go to `/app/owner/purchase-orders`
4. **Suppliers** → Go to `/app/owner/suppliers`
5. **Settings** → Go to `/app/owner/settings`

---

## 🔧 Troubleshooting

**"Table not found" error?**
- Make sure you're using the correct project: `zsewmpjceuomivvbyjgl`

**User already exists?**
- Just use the existing user or create a new one

**Can't create user?**
- You need admin permissions - contact the project owner

---

Generated: 2026-02-06
