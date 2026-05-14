export async function onRequestGet({ env }) {
  return Response.json({
    hasKey: !!env.ANTHROPIC_API_KEY,
    keyPrefix: env.ANTHROPIC_API_KEY ? env.ANTHROPIC_API_KEY.substring(0, 8) : "empty"
  });
}
