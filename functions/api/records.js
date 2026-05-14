export async function onRequestGet({ env }) {
  const val = await env.UNLOAD_KV.get("records");
  return Response.json(val ? JSON.parse(val) : []);
}

export async function onRequestPost({ request, env }) {
  const rec = await request.json();
  const val = await env.UNLOAD_KV.get("records");
  const list = val ? JSON.parse(val) : [];
  rec.id = Date.now().toString();
  rec.savedAt = new Date().toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai",
  });
  list.unshift(rec);
  await env.UNLOAD_KV.put("records", JSON.stringify(list));
  return Response.json({ ok: true, record: rec });
}
