export default async function handler(req, res) {
  if (!process.env.RESEND_API_KEY) {
    return res.json({ error: "RESEND_API_KEY non définie dans les variables Vercel" });
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: "bsandrez@luxmodernis.com",
        subject: "Test Signatures LuxModernis",
        html: "<p>Test OK — la configuration email fonctionne.</p>"
      })
    });
    const data = await r.json();
    res.json({ httpStatus: r.status, resendResponse: data });
  } catch (err) {
    res.json({ error: err.message });
  }
}
