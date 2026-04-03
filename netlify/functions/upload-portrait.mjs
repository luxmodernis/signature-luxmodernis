import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { imageData, filename } = await req.json();

    if (!imageData || imageData.indexOf("data:image") !== 0) {
      return new Response(JSON.stringify({ error: "Invalid image data" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    const safeName = (filename || "portrait")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const key = (safeName || "portrait") + ".jpg";

    const store = getStore({ name: "portraits", consistency: "strong" });
    await store.set(key, buffer, {
      metadata: { contentType: "image/jpeg" },
    });

    return Response.json({ url: `/api/portrait/${key}` });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
};

export const config = { path: "/api/upload-portrait" };
