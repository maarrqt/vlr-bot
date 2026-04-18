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

    // fecha
    let rawDate = match.find(".m-item-date").text().trim();
    const dateMatch = rawDate.match(/\d{4}\/\d{2}\/\d{2}/);

    let formattedDate = "";

    if (dateMatch) {
      const [year, month, day] = dateMatch[0].split("/");
      formattedDate = `${day}/${month}`;
    }

    // 🔥 hora (FIX DEFINITIVO)
    const rawText = match.text();

    let hourMatch = rawText.match(/\b\d{1,2}:\d{2}\s?(am|pm)\b/i);

    let rawHour = hourMatch ? hourMatch[0] : "";

    if (rawHour) {
      let [time, modifier] = rawHour.split(" ");
      let [hours, minutes] = time.split(":");

      hours = parseInt(hours);

      // convertir a 24h
      if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

      // 🇦🇷 base, 🇨🇱 -1
      const argentinaHour = hours;
      const chileHour = (hours - 1 + 24) % 24;

      const format = (h) =>
        h.toString().padStart(2, "0") + ":" + minutes;

      return res.send(
        `🔥 ${team1} vs ${team2} 🕒 ${formattedDate} at ${format(
          chileHour
        )} 🇨🇱 - ${format(argentinaHour)} 🇦🇷 🇧🇷`
      );
    }

    // fallback
    const rawTime = match.find(".m-item-time").text().trim();

    return res.send(
      `🔥 ${team1} vs ${team2} 🕒 ${formattedDate} (${rawTime}) 🇦🇷 🇧🇷`
    );

  } catch (err) {
    console.log(err);
    res.send("Error obteniendo el match 😵");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor corriendo"));