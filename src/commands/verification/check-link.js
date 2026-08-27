const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { supabase } = require("../../services/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checklink")
    .setDescription(
      "Controlla il collegamento Discord e FACEIT nel database."
    ),

  async execute(interaction) {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    try {
      const { data: user, error } = await supabase
        .from("verified_users")
        .select(
          [
            "id_discord",
            "username_discord",
            "id_faceit",
            "email_discord",
            "updated_at",
            "email_faceit",
            "livello_faceit",
            "name_faceit",
          ].join(", ")
        )
        .eq("id_discord", interaction.user.id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!user) {
        await interaction.editReply(
          "❌ Non trovo il tuo account nella tabella `verified_users`.\n" +
            "Completa prima il collegamento Discord e FACEIT sul sito."
        );

        return;
      }

      console.log("Dati utente trovati:", user);

      const faceitName = user.name_faceit || "❌ Non collegato";

      const faceitId = user.id_faceit
        ? `\`${user.id_faceit}\``
        : "ID non disponibile";

      const faceitValue = user.name_faceit
        ? `${faceitName}\n${faceitId}`
        : "❌ Non collegato";

      const discordName = user.username_discord || interaction.user.username;

      const updatedAt = user.updated_at
        ? `<t:${Math.floor(
            new Date(user.updated_at).getTime() / 1000
          )}:R>`
        : "Non disponibile";

      const faceitLevel =
        user.livello_faceit !== null &&
        user.livello_faceit !== undefined
          ? `Level ${user.livello_faceit}`
          : "Non disponibile";

      const embed = new EmbedBuilder()
        .setColor(0xf97316)
        .setTitle("Stato verifica — Vertex Verify")
        .setDescription(
          "Qui puoi controllare lo stato del collegamento tra Discord e FACEIT."
        )
        .addFields(
          {
            name: "Discord",
            value: `${discordName}\n\`${user.id_discord}\``,
            inline: true,
          },
          {
            name: "FACEIT",
            value: faceitValue,
            inline: true,
          },
          {
            name: "Livello FACEIT",
            value: faceitLevel,
            inline: true,
          },
          {
            name: "Ultimo aggiornamento",
            value: updatedAt,
            inline: false,
          }
        )
        .setFooter({
          text: "Vertex Verify",
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });

      console.log("✅ Embed /checklink inviato con successo.");
    } catch (error) {
      console.error("❌ Errore /checklink:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Errore sconosciuto";

      await interaction.editReply(
        `❌ Errore durante il controllo del collegamento:\n\`${errorMessage}\``
      );
    }
  },
};