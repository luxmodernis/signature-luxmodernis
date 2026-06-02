import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("portraits");
    const { blobs } = await store.list();
    return Response.json(blobs.map(b => b.key));
  } catch {
    return Response.json([]);
  }
};

export const config = { path: "/api/list-portraits" };
