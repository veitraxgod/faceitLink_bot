const { Events } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FACEIT_ROLE_IDS = [
  "ID_RUOLO_FACEIT_LEVEL_1",
  "ID_RUOLO_FACEIT_LEVEL_2",
  "ID_RUOLO_FACEIT_LEVEL_3",
  "ID_RUOLO_FACEIT_LEVEL_4",
  "ID_RUOLO_FACEIT_LEVEL_5",
  "ID_RUOLO_FACEIT_LEVEL_6",
  "ID_RUOLO_FACEIT_LEVEL_7",
  "ID_RUOLO_FACEIT_LEVEL_8",
  "1542676588792123412",
  "1542673537377239090",
].filter((id) => id && !id.startsWith("ID_RUOLO_"));

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== "disconnect_faceit") return;

    const discordUserId = interaction.user.id;
    const guild = interaction.guild;

    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Mancano SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY nel .env.");
      }

      if (!guild) {
        throw new Error("Il pulsante deve essere usato dentro un server Discord.");
      }

      // Legge il record prima di eliminarlo
      const { data: record, error: selectError } = await supabase
        .from("verified_users")
        .select("id_discord")
        .eq("id_discord", discordUserId)
        .maybeSingle();

      if (selectError) throw selectError;

      if (!record) {
        await interaction.reply({
          content: "ℹ️ Non risulta alcun account FACEIT collegato a questo Discord.",
          ephemeral: true,
        });
        return;
      }

      // Rimuove direttamente i ruoli FACEIT dal membro
      const member = await guild.members.fetch(discordUserId);
      const rolesToRemove = FACEIT_ROLE_IDS.filter((roleId) =>
        member.roles.cache.has(roleId)
      );

      if (rolesToRemove.length > 0) {
        await member.roles.remove(
          rolesToRemove,
          "Disconnect FACEIT richiesto dal pulsante Discord"
        );
      }

      // Elimina la riga solo dopo la rimozione dei ruoli
      const { error: deleteError } = await supabase
        .from("verified_users")
        .delete()
        .eq("id_discord", discordUserId);

      if (deleteError) throw deleteError;

      console.log(
        `✅ Disconnect completato per ${discordUserId}: rimossi ${rolesToRemove.length} ruoli ed eliminata la riga.`
      );

      await interaction.reply({
        content: "✅ **Account disconnesso correttamente.**\n\nLa riga è stata eliminata e i ruoli FACEIT sono stati rimossi.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(`❌ Errore disconnect per ${discordUserId}:`, error);

      await interaction.reply({
        content: "❌ **Non è stato possibile completare il disconnect.**\n\nLa riga non è stata eliminata. Controlla i log del bot.",
        ephemeral: true,
      });
    }
  },
};