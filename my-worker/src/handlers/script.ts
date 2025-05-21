import { Env } from "../types";

export async function handleScript(request: Request, env: Env): Promise<Response> {
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

  const key = `scripts:${folder}:${name}`;

  switch (request.method) {
    case "POST": {
      const code = await request.text();
      await env.SCRIPTS_KV.put(key, code);
      return new Response("Script saved", { status: 200, headers: corsHeaders });
    }
    case "GET": {
      const code = await env.SCRIPTS_KV.get(key);
      return code
        ? new Response(code, { status: 200, headers: corsHeaders })
        : new Response("Script not found", { status: 404, headers: corsHeaders });
    }
    case "DELETE": {
      await env.SCRIPTS_KV.delete(key);
      return new Response("Script deleted", { status: 200, headers: corsHeaders });
    }
    default:
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
}
