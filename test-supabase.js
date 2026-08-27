const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://wjiwnvpupnthmvtpjnrl.supabase.co/";
const serviceRoleKey = "sb_secret_AYC7kE2aPg2jhz6fnpS5Hw_L5GSfoRk";

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "presente" : "MANCANTE");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Mancano le variabili nel .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function test() {
  console.log("\n🔍 Test: Leggo verified_users...");
  
  const { data, error } = await supabase
    .from("verified_users")
    .select("id_discord, username_discord, id_faceit, name_faceit, livello_faceit");

  if (error) {
    console.error("❌ Errore Supabase:", error);
  } else {
    console.log("✅ Dati recuperati:", data.length, "righe");
    if (data.length > 0) {
      console.log("Prima riga:", data[0]);
    } else {
      console.log("⚠️ Tabella vuota");
    }
  }
}

test();