# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: Your project name (e.g., "Flatly")
   - Database Password: Choose a strong password
   - Region: Select closest to your users
5. Click "Create new project"

## 2. Get Your Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this SECRET!

## 3. Add Environment Variables to Your App

Add these to your `app.json` in the `extra` section:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "YOUR_SUPABASE_URL",
      "supabaseAnonKey": "YOUR_SUPABASE_ANON_KEY"
    }
  }
}
```

For the backend, add a `.env` file (if not using Rork's environment):

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## 4. Database Schema Example

Create tables in **SQL Editor** on Supabase:

```sql
-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  university text,
  city text,
  housing_type text,
  interests jsonb,
  preferences jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  compatibility_score integer,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.matches enable row level security;

create policy "Users can view their own matches"
  on public.matches for select
  using ( auth.uid() = user1_id or auth.uid() = user2_id );

-- Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can view messages in their matches"
  on public.messages for select
  using (
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

create policy "Users can insert messages in their matches"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
    and sender_id = auth.uid()
  );
```

## 5. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

## 6. Using Supabase in Your App

### Client-side (React Native)

```typescript
import { supabase } from '@/lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Query data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user?.id)
  .single();

// Insert data
const { data, error } = await supabase
  .from('profiles')
  .insert({ id: user?.id, full_name: 'John Doe' });

// Update data
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Jane Doe' })
  .eq('id', user?.id);
```

### Server-side (tRPC)

The tRPC context now includes:
- `ctx.supabase` - Supabase admin client
- `ctx.user` - Current authenticated user (null if not authenticated)

```typescript
import { protectedProcedure } from '../create-context';
import { z } from 'zod';

export const updateProfileProcedure = protectedProcedure
  .input(z.object({
    fullName: z.string(),
    bio: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user is automatically available and typed
    const { data, error } = await ctx.supabase
      .from('profiles')
      .update({
        full_name: input.fullName,
        bio: input.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ctx.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
```

## 7. Storage (Optional)

For profile pictures and other files:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket (e.g., "avatars")
3. Set up policies for the bucket

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.jpg`, file);

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.jpg`);
```

## 8. Realtime (Optional)

For real-time chat messages:

```typescript
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `match_id=eq.${matchId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Update your UI
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## Next Steps

1. Add your Supabase credentials to `app.json`
2. Create your database schema using the SQL above
3. Update your authentication flows to use Supabase
4. Replace mock data with real Supabase queries
5. Test authentication and data operations
