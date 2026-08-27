const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Mancano SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY nel file .env."
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
async function initializeSupabase() {
  const { data, error } = await supabase.from('verified_users').select();
  console.log("Dati recuperati:", data);

  if (error) {
    console.error("Errore durante il recupero dei dati:", error);
  }
}

console.log("Supabase client inizializzato con successo.");



module.exports = { supabase };