const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = interaction.client.commands.get(
      interaction.commandName
    );

    if (!command) {
      await interaction.reply({
        content: "Comando non trovato.",
        ephemeral: true,
      });

      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Errore nel comando /${interaction.commandName}:`,
        error
      );

      const errorReply = {
        content: "Si è verificato un errore durante il comando.",
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  },
};