/** Prefer publishable/anon keys for browser; never expose secret keys. */

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

/** Client-safe key: publishable first, then anon JWT / anon key. */
export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_JWT ||
    ""
  );
}

/** Server-only elevated key. Never prefix with NEXT_PUBLIC_. */
export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseEnv() {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  };
}
