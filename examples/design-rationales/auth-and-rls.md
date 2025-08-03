# Design Rationale: Dual Authentication Model & RLS

This document explains the security model for the Playable Character Cards API, which combines a custom shared secret for admin operations with PostgreSQL's Row-Level Security (RLS) for public data access.

## The Challenge
The API needs to serve two very different audiences with different permissions:
1.  **The Public**: Anonymous users who can browse and interact with character cards. They need read-only access to public data.
2.  **Administrators**: A trusted, internal system (or developer) that can create, update, and manage character cards. They need full write access.

A single authentication method, like JWTs for all users, would be overly complex for the public, read-only use case and might not provide a strong enough barrier for sensitive admin functions.

## The Solution: A Two-Tiered Approach

### 1. Public Access: PostgreSQL Row-Level Security (RLS)
For all public-facing, read-only endpoints (`/get-public-cards`, `/get-card-details`), we rely on Supabase's powerful RLS feature.

**How it Works:**
- The public endpoints are called using Supabase's `anon` key, which grants the `anon` role in the database.
- We create RLS policies on the `cards` table that explicitly define what this `anon` role is allowed to do.

**Illustrative RLS Policy for Public Reads:**
```sql
-- This policy allows anyone with the 'anon' role to read all rows from the 'cards' table.
CREATE POLICY "Public cards are viewable by everyone"
ON cards FOR SELECT
TO anon
USING (true);
```

**Benefits:**
-   **Database-Level Security**: Access control is enforced directly by the database, which is more secure than relying on application-level checks.
-   **Simplicity**: The application code for public endpoints can be very simple. It doesn't need to perform any complex authentication or authorization checks.
-   **Performance**: RLS policies are highly optimized and add negligible overhead to queries.

### 2. Admin Access: Shared-Secret Bearer Token
For all admin-only, write-access endpoints (`/create-card`, `/delete-card`, etc.), we use a simple but effective shared-secret model.

**How it Works:**
- A strong, high-entropy secret (e.g., a UUID) is generated and stored as an environment variable (`ADMIN_SECRET_KEY`) available to the Edge Functions.
- The administrator must include this secret in the `Authorization` header of their API request as a Bearer token.
- The Edge Function performs a constant-time comparison to validate the token before proceeding.

**Illustrative Code in an Edge Function:**
```typescript
// This is a simplified example for demonstration.
// A real implementation should use a timing-safe comparison function.

const authHeader = req.headers.get('Authorization');
const adminSecret = Deno.env.get('ADMIN_SECRET_KEY');

if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// If the check passes, proceed with the admin operation...
```

**Benefits:**
-   **Strong Separation**: Admin operations are handled by completely different endpoints with a distinct, mandatory authentication check. There is no risk of an anonymous user accidentally gaining write access.
-   **Simplicity for Internal Systems**: Ideal for machine-to-machine communication or a simple admin interface where managing a full JWT lifecycle is unnecessary overhead.
-   **Stateless**: Like the rest of the API, this model is stateless and works perfectly in a serverless environment.

## Why Not Just Use the `service_role` Key?
While Supabase provides a `service_role` key that bypasses RLS, relying on it directly in admin functions is a security risk. If that key were ever leaked, the attacker would have full, unrestricted access to the entire database.

Our dual model ensures that even for admin functions, access is gated behind our own explicit authentication check, providing an additional layer of security and control. The `service_role` key is then used *after* our check succeeds, allowing the function to perform its privileged database operations.
