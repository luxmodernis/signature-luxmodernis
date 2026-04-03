import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const templates = await req.json();
    if (!Array.isArray(templates)) {
      return new Response(JSON.stringify({ error: "Invalid data" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const store = getStore({ name: "app-data", consistency: "strong" });
    await store.set("templates", JSON.stringify(templates));

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Save templates error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/save-templates" };
