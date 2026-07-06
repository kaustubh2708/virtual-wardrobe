-- =====================================================
-- Virtual Wardrobe — Supabase Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Wardrobe items
create table wardrobe_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  category text not null check (category in ('Top','Bottom','Footwear','Accessory','Outerwear')),
  subcategory text,
  color_primary text,
  color_secondary text,
  size text,
  fit_type text check (fit_type in ('Oversized','Regular','Slim','Relaxed','Wide-leg')),
  fabric text,
  occasion text[] default '{}',
  season text[] default '{}',
  condition text check (condition in ('New','Like New','Good','Fair')) default 'Good',
  original_price_inr numeric,
  care_instructions text[] default '{}',
  image_url text,
  needs_photo boolean default false,
  times_worn integer default 0,
  last_worn_at date,
  status text check (status in ('Clean','Worn','Laundry','DryClean','ForSale')) default 'Clean',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Outfits
create table outfits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  occasion text,
  notes text,
  try_on_image_url text,
  flatlay_image_url text,
  times_worn integer default 0,
  last_worn_at date,
  created_at timestamptz default now()
);

-- Outfit → Items junction
create table outfit_items (
  id uuid primary key default uuid_generate_v4(),
  outfit_id uuid references outfits(id) on delete cascade,
  wardrobe_item_id uuid references wardrobe_items(id) on delete cascade,
  item_role text check (item_role in ('Top','Bottom','Footwear','Accessory','Outerwear'))
);

-- Shopping list
create table shopping_list (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  store text,
  estimated_price_inr numeric,
  actual_price_inr numeric,
  status text check (status in ('Wishlist','ToBuy','Bought')) default 'ToBuy',
  bought_at timestamptz,
  linked_item_id uuid references wardrobe_items(id),
  notes text,
  image_url text,
  created_at timestamptz default now()
);

-- Wear log
create table wear_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  wardrobe_item_id uuid references wardrobe_items(id) on delete cascade,
  outfit_id uuid references outfits(id),
  worn_date date not null default current_date,
  occasion text,
  notes text
);

-- Outfit calendar
create table outfit_calendar (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  outfit_id uuid references outfits(id) on delete cascade,
  planned_date date not null,
  occasion text,
  notes text
);

-- Mood board
create table mood_board (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  image_url text not null,
  product_url text,
  title text,
  category text,
  colour text,
  occasion text,
  notes text,
  added_to_shopping boolean default false,
  created_at timestamptz default now()
);

-- Travel packs
create table travel_packs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  trip_name text not null,
  trip_type text,
  destination text,
  duration_days integer,
  packed_item_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- User profile (extends auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  reference_photo_url text,
  budget_inr numeric default 15000,
  skin_tone text default 'Wheatish',
  height_cm integer default 185,
  weight_kg integer default 73,
  build text default 'Lean',
  city text default 'Delhi',
  created_at timestamptz default now()
);

-- =====================================================
-- Row Level Security
-- =====================================================
alter table wardrobe_items enable row level security;
alter table outfits enable row level security;
alter table outfit_items enable row level security;
alter table shopping_list enable row level security;
alter table wear_log enable row level security;
alter table outfit_calendar enable row level security;
alter table mood_board enable row level security;
alter table travel_packs enable row level security;
alter table user_profiles enable row level security;

create policy "own data" on wardrobe_items for all using (auth.uid() = user_id);
create policy "own data" on outfits for all using (auth.uid() = user_id);
create policy "own data" on shopping_list for all using (auth.uid() = user_id);
create policy "own data" on wear_log for all using (auth.uid() = user_id);
create policy "own data" on outfit_calendar for all using (auth.uid() = user_id);
create policy "own data" on mood_board for all using (auth.uid() = user_id);
create policy "own data" on travel_packs for all using (auth.uid() = user_id);
create policy "own profile" on user_profiles for all using (auth.uid() = id);
create policy "outfit items via outfit" on outfit_items for all
  using (outfit_id in (select id from outfits where user_id = auth.uid()));

-- =====================================================
-- Storage bucket for wardrobe images
-- Run this after creating the bucket in Supabase Dashboard:
-- Dashboard → Storage → New bucket → name: "wardrobe" → Public: ON
-- =====================================================
