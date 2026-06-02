import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("profiles");
    const { blobs } = await store.list();
    const profiles = {};
    for (const b of blobs) {
      const data = await store.get(b.key);
      if (data) profiles[b.key] = JSON.parse(data);
    }
    return Response.json(profiles);
  } catch {
    return Response.json({});
  }
};

export const config = { path: "/api/list-profiles" };
