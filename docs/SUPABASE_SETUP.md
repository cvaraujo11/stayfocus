# Supabase Environment Setup

## ✅ Completed Steps

1. Created `.env.local` file with Supabase credentials
2. Created `.env.example` file as a template
3. Verified `.env.local` is in `.gitignore` (already present)

## 🔑 Environment Variables Configured

### Supabase Variables (Already Set)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`: https://llwcibvofptjyxxrcbvu.supabase.co
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Configured with anonymous key
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY`: **NEEDS TO BE ADDED MANUALLY**

### Other Variables (Existing)
- `SESSION_SECRET`: For iron-session (already in use)
- `GOOGLE_CLIENT_ID`: For Google OAuth (already in use)
- `GOOGLE_CLIENT_SECRET`: For Google OAuth (already in use)
- `PPLX_API_KEY`: For Perplexity AI (already in use)

## 🚨 Action Required: Add Service Role Key

The Service Role Key is sensitive and cannot be retrieved programmatically. You need to add it manually:

### Steps to Get Service Role Key:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **StayFocus** (llwcibvofptjyxxrcbvu)
3. Navigate to: **Project Settings** → **API**
4. Find the **service_role** key in the "Project API keys" section
5. Copy the key
6. Open `.env.local` file
7. Replace `your_service_role_key_here` with the actual key

### Example:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MjM4NzE2MDAsImV4cCI6MTkzOTQ0NzYwMH0.your_actual_key_here
```

## ⚠️ Security Notes

- **NEVER** commit `.env.local` to version control
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- The service role key bypasses Row Level Security (RLS) - use with caution
- Only use service role key for server-side operations (API routes, server actions)

## 📝 File Structure

```
project-root/
├── .env.local          # Your actual credentials (git-ignored)
├── .env.example        # Template for other developers
└── .gitignore          # Already includes .env.local
```

## ✅ Verification

After adding the service role key, verify your setup:

```bash
# Check that environment variables are loaded
npm run dev

# In your browser console or server logs, you should NOT see:
# - "SUPABASE_URL is undefined"
# - "SUPABASE_ANON_KEY is undefined"
```

## 🔄 Next Steps

Once the service role key is added:
1. Restart your development server
2. Proceed to Task 4: Create authentication and profile tables
3. Test the Supabase connection

## 📚 Resources

- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
