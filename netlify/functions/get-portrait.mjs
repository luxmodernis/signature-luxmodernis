import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  try {
    const key = context.params.key;
    if (!key) return new Response("Not found", { status: 404 });

    const store = getStore({ name: "portraits", consistency: "strong" });
    const blob = await store.get(key, { type: "arrayBuffer" });

    if (!blob) return new Response("Not found", { status: 404 });

    return new Response(blob, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Get portrait error:", err);
    return new Response("Error", { status: 500 });
  }
};

export const config = { path: "/api/portrait/:key" };
