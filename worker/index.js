const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/records" && request.method === "GET") {
      try {
        const val = await env.UNLOAD_KV.get("records");
        return json(val ? JSON.parse(val) : []);
      } catch (e) { return json({ error: e.message }, 500); }
    }

    if (path === "/records" && request.method === "POST") {
      try {
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
        return json({ ok: true, record: rec });
      } catch (e) { return json({ error: e.message }, 500); }
    }

    if (path.startsWith("/records/") && request.method === "DELETE") {
      try {
        const id = path.split("/").pop();
        const val = await env.UNLOAD_KV.get("records");
        const list = val ? JSON.parse(val) : [];
        await env.UNLOAD_KV.put("records", JSON.stringify(list.filter(r => r.id !== id)));
        return json({ ok: true });
      } catch (e) { return json({ error: e.message }, 500); }
    }

    if (path.startsWith("/records/") && request.method === "PUT") {
      try {
        const id = path.split("/").pop();
        const payload = await request.json();
        const val = await env.UNLOAD_KV.get("records");
        const list = val ? JSON.parse(val) : [];
        const idx = list.findIndex(r => r.id === id);
        if (idx === -1) return json({ error: "Not found" }, 404);
        list[idx] = { ...list[idx], env: payload.env, data: payload.data, raw: payload.raw };
        await env.UNLOAD_KV.put("records", JSON.stringify(list));
        return json({ ok: true, record: list[idx] });
      } catch (e) { return json({ error: e.message }, 500); }
    }

    if (path === "/analyze" && request.method === "POST") {
      try {
        const body = await request.json();
        const res = await fetch("https://gateway.ai.cloudflare.com/v1/280bc6df57dfc9ad0f2856e3ce8512f9/unload-ai/anthropic/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: body.messages,
          }),
        });
        const data = await res.json();
        return json(data);
      } catch (e) { return json({ error: e.message }, 500); }
    }

    return json({ error: "Not found" }, 404);
  },
};
