import { list, put } from "@vercel/blob";

const TEAM = ["Laurent","Karine","Dounia","Hervé","Mathilde","Léa","Rubie","Eva","Nicolas","Bertrand","Lorraine","Amélie","Florence"];
const ADMIN_EMAIL = "bsandrez@luxmodernis.com";
const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { firstName, lastName, templateName, html } = req.body;
    if (!firstName) return res.status(400).json({ error: "Missing firstName" });

    // Lecture du log existant
    let log = [];
    const { blobs } = await list({ prefix: "data/signatures-log.json" });
    if (blobs.length) {
      const r = await fetch(blobs[0].url + "?t=" + Date.now());
      log = await r.json();
    }

    // Mise à jour ou ajout de l'entrée
    const idx = log.findIndex(e => norm(e.firstName) === norm(firstName));
    const entry = { firstName, lastName: lastName || "", templateName: templateName || "", html: html || "", date: new Date().toISOString() };
    if (idx >= 0) log[idx] = entry; else log.push(entry);

    await put("data/signatures-log.json", JSON.stringify(log), {
      access: "public", addRandomSuffix: false, contentType: "application/json",
    });

    // Envoi email de notification (fire & forget)
    if (process.env.RESEND_API_KEY) {
      const done = TEAM.filter(n => log.find(e => norm(e.firstName) === norm(n)));
      const todo = TEAM.filter(n => !log.find(e => norm(e.firstName) === norm(n)));
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#1C1C1C;margin-bottom:4px;">✍️ ${firstName} ${lastName} a généré sa signature</h2>
          <p style="color:#777;font-size:14px;margin-bottom:24px;">${entry.templateName} · ${new Date(entry.date).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})}</p>
          <div style="background:#f0fff6;border:1px solid #a8e6be;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
            <div style="font-size:22px;font-weight:bold;color:#1C1C1C;">${done.length} / ${TEAM.length}</div>
            <div style="font-size:12px;color:#555;">signatures générées</div>
          </div>
          <h3 style="color:#1C1C1C;font-size:13px;margin-bottom:8px;">✅ Fait (${done.length})</h3>
          <ul style="margin:0 0 16px;padding-left:18px;color:#333;font-size:13px;">
            ${done.map(n => {const e=log.find(x=>norm(x.firstName)===norm(n));return`<li>${n}${e?.lastName?" "+e.lastName:""}</li>`;}).join("")}
          </ul>
          ${todo.length ? `<h3 style="color:#1C1C1C;font-size:13px;margin-bottom:8px;">⏳ Reste (${todo.length})</h3>
          <ul style="margin:0;padding-left:18px;color:#999;font-size:13px;">
            ${todo.map(n=>`<li>${n}</li>`).join("")}
          </ul>` : `<p style="color:#4caf50;font-weight:bold;">🎉 Tout le monde a généré sa signature !</p>`}
        </div>`;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: ADMIN_EMAIL,
            subject: `✍️ ${firstName} ${lastName} — ${done.length}/${TEAM.length} signatures générées`,
            html: emailHtml,
          }),
        });
      } catch {}
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
