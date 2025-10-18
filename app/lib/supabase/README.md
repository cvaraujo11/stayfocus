# Supabase Client Utilities

This directory contains the core Supabase client utilities for the StayFocus application migration.

## Files

### `client.ts`
Client-side Supabase client for use in React Client Components.

**Usage:**
```typescript
import { createSupabaseClient } from '@/app/lib/supabase/client'

const supabase = createSupabaseClient()
const { data, error } = await supabase.from('table').select()
```

### `server.ts`
Server-side Supabase clients for use in Server Components and Route Handlers.

**Usage in Server Components:**
```typescript
import { createSupabaseServerComponent } from '@/app/lib/supabase/server'

const supabase = createSupabaseServerComponent()
const { data } = await supabase.from('table').select()
```

**Usage in Route Handlers:**
```typescript
import { createSupabaseRouteHandler } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createSupabaseRouteHandler()
  const { data } = await supabase.from('table').select()
  return Response.json(data)
}
```

### `storage.ts`
Helper utilities for file upload and management in Supabase Storage.

**Features:**
- Automatic image resizing before upload
- File type and size validation
- User-based folder organization
- Batch upload/delete operations

**Usage:**
```typescript
import { uploadPhoto, deletePhoto } from '@/app/lib/supabase/storage'

// Upload a photo
const url = await uploadPhoto(userId, file)

// Delete a photo
await deletePhoto(url)
```

**Configuration:**
- Max file size: 5MB
- Allowed types: JPG, PNG, WEBP
- Default resize width: 1200px
- JPEG quality: 0.85

### `sync.ts`
Real-time synchronization manager for database changes.

**Features:**
- Subscribe to INSERT, UPDATE, DELETE events
- User-specific data filtering
- Automatic channel management
- Duplicate subscription prevention

**Usage:**
```typescript
import { supabaseSync } from '@/app/lib/supabase/sync'

// Subscribe to all changes
const cleanup = supabaseSync.subscribe(
  'financas_transacoes',
  (newItem) => console.log('Inserted:', newItem),
  (updated) => console.log('Updated:', updated),
  (deleted) => console.log('Deleted:', deleted.id)
)

// Subscribe to user-specific changes
const cleanup = supabaseSync.subscribeToUserData(
  'financas_transacoes',
  userId,
  onInsert,
  onUpdate,
  onDelete
)

// Cleanup when component unmounts
useEffect(() => {
  return cleanup
}, [])
```

## Database Types

The `app/types/database.ts` file contains TypeScript type definitions for all database tables. These types provide:
- Type safety for queries
- Autocomplete in IDEs
- Compile-time error checking

**Note:** In production, these types should be auto-generated using:
```bash
supabase gen types typescript --project-id <project-id> > app/types/database.ts
```

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Server-side only
```

## Security

- **Client-side**: Uses anon key with Row Level Security (RLS) enforced
- **Server-side**: Can use service role key to bypass RLS when needed
- **Storage**: RLS policies ensure users can only access their own files
- **Real-time**: Filters ensure users only receive their own data updates

## Next Steps

1. Set up Supabase project and configure environment variables
2. Create database schema with RLS policies
3. Configure storage buckets
4. Implement authentication system (AuthContext)
5. Migrate Zustand stores to use these utilities
