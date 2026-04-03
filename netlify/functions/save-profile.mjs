import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const { key, role, phone } = await req.json();
    if (!key) return Response.json({ error: "Missing key" }, { status: 400 });
    const store = getStore("profiles");
    await store.set(key, JSON.stringify({ role, phone }));
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: "/api/save-profile" };
