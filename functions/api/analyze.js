export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const res = await fetch("https://unload-compare.13140015504.workers.dev/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data);
}
