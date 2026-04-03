import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const templates = await req.json();
    if (!Array.isArray(templates)) return Response.json({ error: "Invalid data" }, { status: 400 });
    const store = getStore("app-data");
    await store.set("templates", JSON.stringify(templates));
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Save templates error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/save-templates" };
