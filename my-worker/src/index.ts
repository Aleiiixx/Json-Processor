export interface Env {
  SCRIPTS_KV: KVNamespace;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder");
    const name = url.searchParams.get("name");

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Endpoint para listar scripts
    if (url.pathname === "/list" && request.method === "GET") {
      const list = await env.SCRIPTS_KV.list();
      const result: Record<string, string[]> = {};

      for (const entry of list.keys) {
        const key = entry.name;
        if (!key) continue;

        const match = key.match(/^scripts:(.+?):(.+)$/);
        if (!match) continue;

        const folder = match[1];
        const scriptName = match[2];

        // Confirma que el valor todavía existe
        const exists = await env.SCRIPTS_KV.get(key);
        if (!exists) continue;

        if (!result[folder]) result[folder] = [];
        result[folder].push(scriptName);
      }

      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }


    // Validación para rutas que requieren folder y name
    if (!folder || !name) {
      return new Response("Missing folder or name", { status: 400, headers: corsHeaders });
    }

    const key = `scripts:${folder}:${name}`;

    if (request.method === "POST") {
      const code = await request.text();
      await env.SCRIPTS_KV.put(key, code);
      return new Response("Script saved", { status: 200, headers: corsHeaders });
    }

    if (request.method === "GET") {
      const code = await env.SCRIPTS_KV.get(key);
      return code
        ? new Response(code, { status: 200, headers: corsHeaders })
        : new Response("Script not found", { status: 404, headers: corsHeaders });
    }

    if (request.method === "DELETE") {
      await env.SCRIPTS_KV.delete(key);
      return new Response("Script deleted", { status: 200, headers: corsHeaders });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  },
};
