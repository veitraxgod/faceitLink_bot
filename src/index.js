require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const express = require("express");

const {
  Client,
  Collection,
  GatewayIntentBits,
} = require("discord.js");

const verifyUserWebhook = require("../src/webhooks/verify-user");

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.DISCORD_TOKEN) {
  throw new Error("Manca DISCORD_TOKEN nel file .env.");
}

if (!process.env.DISCORD_GUILD_ID) {
  throw new Error("Manca DISCORD_GUILD_ID nel file .env.");
}

/* -------------------- Server webhook -------------------- */

const app = express();

/*
  Importante: deve stare PRIMA di app.use("/api/webhooks", ...)
  altrimenti req.body del webhook sarebbe vuoto.
*/
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).send("Vertex Discord bot: webhook online.");
});

/*
  Il router contiene:
  router.post("/verify-user", ...)

  Quindi l'URL finale diventa:
  POST /api/webhooks/verify-user
*/
app.use("/api/webhooks", verifyUserWebhook);

app.listen(PORT, () => {
  console.log(`🌐 Server webhook attivo: http://localhost:${PORT}`);
});

/* -------------------- Client Discord -------------------- */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.commands = new Collection();

function getJavaScriptFiles(folderPath) {
  const entries = fs.readdirSync(folderPath, {
    withFileTypes: true,
  });

  return entries.flatMap((entry) => {
    const entryPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      return getJavaScriptFiles(entryPath);
    }

    if (entry.name.endsWith(".js")) {
      return [entryPath];
    }

    return [];
  });
}

/* -------------------- Caricamento comandi -------------------- */

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  throw new Error(`Cartella commands non trovata: ${commandsPath}`);
}

for (const filePath of getJavaScriptFiles(commandsPath)) {
  const command = require(filePath);

  if (!command.data || !command.execute) {
    console.warn(`Comando ignorato: ${filePath}`);
    continue;
  }

  client.commands.set(command.data.name, command);
  console.log(`Comando caricato: /${command.data.name}`);
}

/* -------------------- Caricamento eventi -------------------- */

const eventsPath = path.join(__dirname, "events");

if (!fs.existsSync(eventsPath)) {
  throw new Error(`Cartella events non trovata: ${eventsPath}`);
}

for (const filePath of getJavaScriptFiles(eventsPath)) {
  const event = require(filePath);

  if (!event.name || !event.execute) {
    console.warn(`Evento ignorato: ${filePath}`);
    continue;
  }

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }

  console.log(`Evento caricato: ${event.name}`);
}

/* -------------------- Avvio bot -------------------- */

client.login(process.env.DISCORD_TOKEN);