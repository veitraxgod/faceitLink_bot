const express = require("express");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");

const router = express.Router();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

/*
  Inserisci gli ID reali dei ruoli Discord.
  Per il test attuale, visto che il tuo record ha:
  livello_faceit: 9

  devi almeno sostituire:
  ID_RUOLO_FACEIT_LEVEL_9

  con l'ID reale del tuo ruolo FACEIT Level 9.
*/
const ROLE_MAPPING = {
  1: "ID_RUOLO_FACEIT_LEVEL_1",
  2: "ID_RUOLO_FACEIT_LEVEL_2",
  3: "ID_RUOLO_FACEIT_LEVEL_3",
  4: "ID_RUOLO_FACEIT_LEVEL_4",
  5: "ID_RUOLO_FACEIT_LEVEL_5",
  6: "ID_RUOLO_FACEIT_LEVEL_6",
  7: "ID_RUOLO_FACEIT_LEVEL_7",
  8: "ID_RUOLO_FACEIT_LEVEL_8",
  9: "1542676588792123412",
  10: "1542673537377239090",
};

async function assignFaceitRole(discordUserId, faceitLevel) {
  const level = Number(faceitLevel);

  if (!discordUserId) {
    throw new Error("id_discord mancante nel record Supabase.");
  }

  if (!Number.isInteger(level) || level < 1 || level > 10) {
    throw new Error(
      `livello_faceit non valido: ${faceitLevel}. Deve essere tra 1 e 10.`
    );
  }

  const roleId = ROLE_MAPPING[level];

  if (!roleId || roleId.startsWith("ID_RUOLO_")) {
    throw new Error(
      `ID del ruolo Discord non configurato per FACEIT Level ${level}.`
    );
  }

  if (!DISCORD_TOKEN) {
    throw new Error("Manca DISCORD_TOKEN nel file .env.");
  }

  if (!GUILD_ID) {
    throw new Error("Manca DISCORD_GUILD_ID nel file .env.");
  }

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  // Recupera il membro per ottenere i ruoli attuali
  const guildResponse = await rest.get(
    Routes.guildMember(GUILD_ID, discordUserId)
  );

  const currentRoleIds = guildResponse.roles || [];

  // Lista di tutti i ruoli FACEIT configurati
  const allFaceitRoleIds = Object.values(ROLE_MAPPING);

  // Ruoli FACEIT da rimuovere: tutti quelli che l'utente ha, tranne quello del nuovo livello
  const oldFaceitRoles = allFaceitRoleIds.filter(
    (faceitRoleId) =>
      faceitRoleId !== roleId &&
      currentRoleIds.includes(faceitRoleId)
  );

  // Rimuove i vecchi ruoli FACEIT
  for (const oldRoleId of oldFaceitRoles) {
    await rest.delete(
      Routes.guildMemberRole(GUILD_ID, discordUserId, oldRoleId),
      {
        reason: `Aggiornamento FACEIT: nuovo livello ${level}`,
      }
    );

    console.log(
      `🗑️ Rimosso vecchio ruolo FACEIT: ${oldRoleId} da ${discordUserId}.`
    );
  }

  // Aggiunge il nuovo ruolo FACEIT se non è già presente
  if (!currentRoleIds.includes(roleId)) {
    await rest.put(
      Routes.guildMemberRole(GUILD_ID, discordUserId, roleId),
      {
        reason: `Ruolo automatico FACEIT Level ${level}`,
      }
    );

    console.log(
      `✅ Ruolo FACEIT Level ${level} assegnato a ${discordUserId}.`
    );
  } else {
    console.log(
      `ℹ️ L'utente ${discordUserId} possiede già FACEIT Level ${level}.`
    );
  }
}

router.post("/verify-user", async (req, res) => {
  console.log("🔔 Webhook Supabase ricevuto:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const eventType = req.body?.type;
    const table = req.body?.table;
    const record = req.body?.record;

    if (table !== "verified_users") {
      console.log(`ℹ️ Evento ignorato: tabella ${table}`);

      return res.status(200).json({
        ok: true,
        message: "Tabella ignorata",
      });
    }

    if (eventType !== "INSERT" && eventType !== "UPDATE") {
      console.log(`ℹ️ Evento ignorato: ${eventType}`);

      return res.status(200).json({
        ok: true,
        message: "Evento ignorato",
      });
    }

    if (!record) {
      throw new Error("Il webhook non contiene record.");
    }

    const discordUserId = record.id_discord;
    const faceitLevel = record.livello_faceit;

    console.log(`Discord ID: ${discordUserId}`);
    console.log(`Livello FACEIT: ${faceitLevel}`);

    await assignFaceitRole(discordUserId, faceitLevel);

    return res.status(200).json({
      ok: true,
      message: `Ruolo FACEIT Level ${faceitLevel} assegnato`,
    });
  } catch (error) {
    console.error("❌ Errore nell'assegnazione del ruolo:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

module.exports = router;