import { handleScript } from "./handlers/script";
import { handleListScripts } from "./handlers/listScripts";
import { handleJson } from "./handlers/json";
import { handleListJson } from "./handlers/listJson";

import { Env } from "./types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (pathname === "/script") {
      return await handleScript(request, env);
    }

    if (pathname === "/listScripts") {
      return await handleListScripts(request, env);
    }

    if (pathname === "/json") {
      return await handleJson(request, env);
    }

    if (pathname === "/listJson") {
      return await handleListJson(request, env);
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
