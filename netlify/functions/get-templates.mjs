import { getStore } from "@netlify/blobs";

export default async (req) => {
  try {
    const store = getStore({ name: "app-data", consistency: "strong" });
    const data = await store.get("templates");

    if (!data) {
      return Response.json([]);
    }

    return new Response(data, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Get templates error:", err);
    return Response.json([]);
  }
};

export const config = { path: "/api/get-templates" };
