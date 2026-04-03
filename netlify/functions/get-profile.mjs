import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const key = context.params.key;
    if (!key) return Response.json(null);
    const store = getStore("profiles");
    const data = await store.get(key);
    if (!data) return Response.json(null);
    return new Response(data, { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } });
  } catch {
    return Response.json(null);
  }
};

export const config = { path: "/api/profile/:key" };
