import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const missingVars = !supabaseUrl || !supabaseAnonKey;

if (missingVars) {
  console.error(
    '[SpartanBet] ❌ Supabase environment variables are not set.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to:\n' +
    '  • Vercel: Project → Settings → Environment Variables\n' +
    '  • Local: create .env.local at project root'
  );
}

// Use real values or safe placeholders that fail gracefully
// (caught by try/catch in AuthContext — no app crash)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key_not_set'
);

// Export flag so components can show a config error if needed
export const isSupabaseConfigured = !missingVars;
