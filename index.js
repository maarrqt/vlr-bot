const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/next-match", async (req, res) => {
  try {
    const url = "https://www.vlr.gg/team/367/9z-team";
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const match = $(".wf-card.m-item")
      .filter((i, el) => $(el).text().toLowerCase().includes("9z"))
      .first();

    if (!match.length) {
      return res.send("No hay próximos partidos 😴");
    }

    // equipos
    let team1 = match.find(".m-item-team-name").first().text().trim();
    let team2 = match.find(".m-item-team-name").last().text().trim();

    if (team2.toLowerCase().includes("9z")) {
      [team1, team2] = [team2, team1];
    }

    if (team1 === team2 || !team2 || team2 === "-") {
      team2 = "TBD";
    }

    // 🔥 COUNTDOWN (esto es lo importante)
    let countdown = match.find(".m-item-time").text().trim();

    // fallback por si cambia el selector
    if (!countdown) {
      const text = match.text();
      const matchCountdown = text.match(/\d+d\s*\d+h/i);
      countdown = matchCountdown ? matchCountdown[0] : "pronto";
    }

    return res.send(
      `🔥 ${team1} vs ${team2} 🕒 en ${countdown}`
    );

  } catch (err) {
    console.log(err);
    res.send("Error obteniendo el match 😵");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo"));