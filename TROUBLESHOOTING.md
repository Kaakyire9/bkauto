# Troubleshooting Orders Not Showing in Dashboard

## ✅ Code Changes Made

The OrderCarForm is now **fully wired to Supabase** and will:
1. Get the current user session
2. Insert order data into the `orders` table with the user's `user_id`
3. Set the initial status to `pending`
4. Redirect to dashboard on success

The UserDashboard is now **properly fetching orders** and will:
1. Query the `orders` table filtered by `user_id`
2. Calculate stats (ordersPlaced, activeOrders, vehiclesSourced)
3. Display recent orders
4. Handle errors gracefully if tables don't exist

## ❌ Why Orders Aren't Showing (Most Likely Causes)

### 1. **Missing Supabase Tables** (Most Common)
The `orders` table has NOT been created yet in your Supabase project.

**Solution:**
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the SQL from **SUPABASE_SETUP.md** - **SQL Block 1** (Create orders table)
5. Click **"Run"**
6. Repeat for **SQL Block 2** (Create saved_vehicles table)

### 2. **RLS Policies Not Enabled**
Even if the table exists, Row Level Security policies might not be set up.

**Solution:**
1. Go to **SQL Editor** again
2. Copy and paste **SQL Block 3** (Enable RLS on orders)
3. Click **"Run"**
4. Repeat for **SQL Block 4** (Enable RLS on saved_vehicles)

### 3. **Environment Variables Not Set**
Your `.env.local` file might be missing Supabase credentials.

**Solution:**
Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RESET_PASSWORD_URL=https://yourdomain.com/reset-password
```

Get these values from:
1. Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** and **anon key**

### 4. **Browser Cache Issue**
Sometimes the Next.js dev server needs to restart.

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Clear `.next` folder: `rm -r .next`
3. Restart: `npm run dev`

## 🧪 Testing the Full Flow

1. **Sign up** at `/signup` with your email and password
2. Go to `/order` and **place an order**
3. You should see success message and redirect to `/dashboard`
4. Check the dashboard - you should see:
   - ✅ Order count incremented
   - ✅ Recent order displayed
   - ✅ Active orders count updated

## 🔍 Debugging Steps

If orders still aren't showing, follow these steps:

### Step 1: Check Supabase Table Exists
```
In Supabase → Table Editor
- Look for "orders" table in the left sidebar
- It should have columns: id, user_id, vehicle_type, make, model, year, color, condition, budget, priority, timeline, notes, status, created_at, updated_at
```

### Step 2: Check RLS is Enabled
```
In Supabase → Authentication → Policies
- For "orders" table, you should see 4 policies:
  - "Users can view their own orders"
  - "Users can insert their own orders"
  - "Users can update their own orders"
  - "Users can delete their own orders"
```

### Step 3: Check Browser Console
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try placing an order again
4. Look for error messages that indicate what went wrong
```

### Step 4: Check Supabase Logs
```
In Supabase Dashboard → Logs → Edge Function Logs
- Look for any RLS denial errors
- Look for connection errors
```

## 📋 Quick Checklist

- [ ] Environment variables added to `.env.local`
- [ ] `orders` table created in Supabase
- [ ] `saved_vehicles` table created in Supabase
- [ ] RLS enabled on both tables
- [ ] RLS policies created for both tables
- [ ] Dev server restarted after env changes
- [ ] User is signed in before placing order
- [ ] Order form validates all fields before submit

## 🚀 Once Everything is Set Up

Once the tables and RLS policies are created:

1. ✅ Orders will be saved to the `orders` table
2. ✅ Dashboard will fetch and display them
3. ✅ Order count will update automatically
4. ✅ Status badges will show pending/in-progress/completed
5. ✅ Recent orders will appear in the Overview tab

## 📞 Need Help?

If you're stuck:
1. Check the browser console for error messages
2. Verify all SQL blocks were run in Supabase
3. Make sure env vars match exactly from Supabase Dashboard
4. Restart the dev server: `npm run dev`
