const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Invia il pannello di verifica Discord e FACEIT.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {
    const appUrl = process.env.APP_URL;

    if (!appUrl) {
      await interaction.reply({
        content: "Manca APP_URL nel file .env del bot.",
        ephemeral: true,
      });

      return;
    }

    const cleanAppUrl = appUrl.replace(/\/$/, "");

    const embed = new EmbedBuilder()
      .setColor(0xf97316)
      .setAuthor({
        name: "Vertex Verify",
      })
      .setTitle("Verifica il tuo account")
      .setDescription(
        [
          "Collega il tuo account **Discord** e il tuo account **FACEIT**.",
          "",
          "Dopo il collegamento riceverai automaticamente il ruolo relativo al tuo livello FACEIT.",
          "",
          "Premi il pulsante qui sotto per iniziare.",
        ].join("\n")
      )
      .addFields(
        {
          name: "Collegamento account",
          value:
            "Il sito assocerà il tuo account Discord al tuo profilo FACEIT.",
          inline: false,
        },
        {
          name: "Funzioni sbloccate",
          value:
            "Ruoli per livello, classifiche, statistiche e lobby.",
          inline: false,
        }
      )
      .setFooter({
        text: "Vertex Verify • Discord + FACEIT",
      })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setLabel("Collega account")
      .setEmoji("🔗")
      .setStyle(ButtonStyle.Link)
      .setURL(`${cleanAppUrl}/`);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};