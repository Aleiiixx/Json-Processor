import { Env } from "../types";

export async function handleListJson(request: Request, env: Env): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const list = await env.SCRIPTS_KV.list();
  const result: Record<string, string[]> = {};

  for (const entry of list.keys) {
    const key = entry.name;
    if (!key) continue;

    const match = key.match(/^json:(.+?):(.+)$/);
    if (!match) continue;

    const folder = match[1];
    const fileName = match[2];

    const exists = await env.SCRIPTS_KV.get(key);
    if (!exists) continue;

    if (!result[folder]) result[folder] = [];
    result[folder].push(fileName);
  }

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}
