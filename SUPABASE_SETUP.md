# Supabase Setup Guide for BK Auto Trading Dashboard

## Required Tables

To fully integrate the dashboard with Supabase, create the following tables in your Supabase project:

### 1. `orders` Table

This table stores all vehicle orders placed by users.

**SQL to create the table:**

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_type VARCHAR(50),
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  color VARCHAR(50),
  condition VARCHAR(50),
  budget VARCHAR(50),
  priority VARCHAR(50),
  timeline VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'in-progress', 'completed'))
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 2. `saved_vehicles` Table

This table stores vehicles saved by users.

**SQL to create the table:**

```sql
CREATE TABLE saved_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vehicle_name VARCHAR(255),
  vehicle_price VARCHAR(50),
  vehicle_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_saved_vehicle UNIQUE(user_id, vehicle_name)
);

CREATE INDEX idx_saved_vehicles_user_id ON saved_vehicles(user_id);
```

### 3. `user_profiles` Table (Required for profile pictures)

**SQL to create the table:**

```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  avatar_url TEXT,
  phone_number VARCHAR(20),
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

## Environment Variables

Add these to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RESET_PASSWORD_URL=https://yourdomain.com/reset-password
```

## Row Level Security (RLS)

Enable Row Level Security for each table:

**For `orders` table:**

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
  ON orders FOR DELETE
  USING (auth.uid() = user_id);
```

**For `saved_vehicles` table:**

```sql
ALTER TABLE saved_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved vehicles"
  ON saved_vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved vehicles"
  ON saved_vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved vehicles"
  ON saved_vehicles FOR DELETE
  USING (auth.uid() = user_id);
```

## Dashboard Features Now Connected

✅ **Fetch User Profile**
- Retrieves name from `user_metadata.full_name`
- Displays member since date based on account creation
- Shows email address

✅ **Fetch Orders**
- Retrieves all user orders
- Calculates active and completed order counts
- Displays last 3 orders in overview
- Shows order status and vehicle details

✅ **Fetch Saved Vehicles**
- Counts total saved vehicles
- Will display in saved vehicles tab (when table is populated)

✅ **Profile Picture Upload**
- Stores as data URL in component state
- Can be extended to save to Supabase Storage

## Storage Setup for Profile Pictures

You also need to set up Supabase Storage for profile picture uploads.

**Steps to create the avatars bucket:**

1. Go to your Supabase project → **Storage**
2. Click **"Create a new bucket"**
3. Name it: `avatars`
4. Check **"Public bucket"** (so avatars are publicly viewable)
5. Click **"Create bucket"**

**Enable RLS on Storage:**

Go to **Storage** → **avatars** → **Policies** and add this policy:

```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to avatars for reading
CREATE POLICY "Public access to avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## Next Steps

1. Create all three tables in your Supabase project using the SQL above
2. Enable Row Level Security as specified
3. Create the avatars storage bucket
4. Enable RLS policies on storage
5. Add environment variables to `.env.local`
6. Test the dashboard by creating orders through the order form
7. Test profile picture upload with cropping
8. Verify data appears in the dashboard

## Troubleshooting

- **No data showing?** Check that RLS policies are properly set
- **Auth errors?** Verify Supabase URL and keys in environment variables
- **Permission denied?** Ensure RLS policies match the user_id field
- **Avatar not uploading?** Check that:
  1. The `avatars` bucket exists in Supabase Storage
  2. The bucket is set to **Public**
  3. Storage RLS policies are created (see above)
  4. Check browser console for specific error messages
- **Profile picture not loading?** Verify:
  1. The `user_profiles` table exists
  2. RLS policies are enabled on `user_profiles`
  3. The avatar_url is saved correctly in the database
  4. The browser console shows the public URL

### Quick Checklist for Avatar Upload

✅ **Storage Setup:**
- [ ] Created `avatars` bucket (Storage → Create new bucket)
- [ ] Set bucket to **Public**
- [ ] Added 3 storage RLS policies (INSERT, UPDATE, SELECT)

✅ **Database Setup:**
- [ ] Created `user_profiles` table
- [ ] Enabled RLS on `user_profiles`
- [ ] Added 3 table RLS policies (SELECT, INSERT, UPDATE)

✅ **Common Errors:**
- `Bucket not found` → Create the avatars bucket
- `new row violates row-level security` → Check RLS policies match auth.uid()
- `relation "user_profiles" does not exist` → Run the CREATE TABLE SQL
- `Permission denied for table user_profiles` → Enable RLS policies

**Check browser console (F12) for detailed error messages!**
