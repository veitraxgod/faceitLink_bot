require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");

const {
  REST,
  Routes,
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  throw new Error(
    "Mancano DISCORD_TOKEN, DISCORD_CLIENT_ID o DISCORD_GUILD_ID nel file .env."
  );
}

function getJavaScriptFiles(folderPath) {
  const entries = fs.readdirSync(folderPath, {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const entryPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      return getJavaScriptFiles(entryPath);
    }

    return entry.name.endsWith(".js") ? [entryPath] : [];
  });
}

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  throw new Error(`Cartella commands non trovata: ${commandsPath}`);
}

const commands = [];

for (const filePath of getJavaScriptFiles(commandsPath)) {
  const command = require(filePath);

  if (!command.data || !command.execute) {
    console.warn(`File ignorato: ${filePath}`);
    continue;
  }

  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`Registro ${commands.length} comando/i slash...`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log("Slash command registrati correttamente.");
  } catch (error) {
    console.error("Errore durante il deploy:", error);
  }
})();