export async function onRequestDelete({ params, env }) {
  const id = params.id;
  const val = await env.UNLOAD_KV.get("records");
  const list = val ? JSON.parse(val) : [];
  await env.UNLOAD_KV.put("records", JSON.stringify(list.filter(r => r.id !== id)));
  return Response.json({ ok: true });
}

export async function onRequestPut({ params, request, env }) {
  const id = params.id;
  const payload = await request.json();
  const val = await env.UNLOAD_KV.get("records");
  const list = val ? JSON.parse(val) : [];
  const idx = list.findIndex(r => r.id === id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  list[idx] = { ...list[idx], env: payload.env, data: payload.data, raw: payload.raw };
  await env.UNLOAD_KV.put("records", JSON.stringify(list));
  return Response.json({ ok: true, record: list[idx] });
}
