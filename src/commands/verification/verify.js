const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Invia il pannello di verifica Discord e FACEIT.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const appUrl = process.env.APP_URL;

    if (!appUrl) {
      await interaction.reply({
        content: "Manca APP_URL nel file .env del bot.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const cleanAppUrl = appUrl.replace(/\/$/, "");

    const embed = new EmbedBuilder()
      .setColor(0x3d85c6)
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
        ].join("\n"),
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
          value: "Ruoli per livello, classifiche, statistiche e lobby.",
          inline: false,
        },
      )
      .setFooter({
        iconURL: interaction.client.user.displayAvatarURL({ size: 1024 }),
        text: "Vertex Verify • Discord + FACEIT",
      })
      .setTimestamp();

    // Pulsante per collegare l'account (Link)
    const linkButton = new ButtonBuilder()
      .setLabel("Collega account")
      .setEmoji("🔗")
      .setStyle(ButtonStyle.Link)
      .setURL(`${cleanAppUrl}/`);

    // Pulsante per disconnettere l'account (Interattivo)
    const disconnectButton = new ButtonBuilder()
      .setLabel("Disconnetti")
      .setEmoji("🔌")
      .setStyle(ButtonStyle.Danger)
      .setCustomId("disconnect_faceit");

    // Inseriamo entrambi i pulsanti nella stessa riga
    const row = new ActionRowBuilder().addComponents(
      linkButton,
      disconnectButton,
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "✅ Pannello di verifica inviato!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
