import { Env } from "../types";

export async function handleJson(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder");
  const name = url.searchParams.get("name");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (!folder || !name) {
    return new Response("Missing folder or name", { status: 400, headers: corsHeaders });
  }

  const key = `json:${folder}:${name}`;

  switch (request.method) {
    case "POST": {
      const body = await request.text();

      try {
        JSON.parse(body); // Validamos que sea JSON válido
      } catch (err) {
        return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
      }

      await env.SCRIPTS_KV.put(key, body);
      return new Response("JSON saved", { status: 200, headers: corsHeaders });
    }

    case "GET": {
      const json = await env.SCRIPTS_KV.get(key);
      return json
        ? new Response(json, { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } })
        : new Response("JSON not found", { status: 404, headers: corsHeaders });
    }

    case "DELETE": {
      await env.SCRIPTS_KV.delete(key);
      return new Response("JSON deleted", { status: 200, headers: corsHeaders });
    }

    default:
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
}
