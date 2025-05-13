import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

serve(async (req) => {
  const { method } = req;

  // 1) Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    // 2) Extract or fallback-generate session_id
    let session_id: string;
    try {
      const body = await req.json();
      session_id = body?.session_id || crypto.randomUUID();
    } catch {
      session_id = crypto.randomUUID(); // fallback if parsing fails
    }

    // 3) Supabase project + auth token
    const projectRef = "koaxmrtrzhilnzjbiybr"; // Your actual project ref
    const apiKey = Deno.env.get("PLATFORM_TOKEN"); // Your PAT from Supabase

    if (!projectRef || !apiKey) {
      console.error("Missing PROJECT_REF or PLATFORM_TOKEN");
      return new Response("Missing environment configuration", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const branchName = `demo_${session_id.slice(0, 8)}`;

    // 4) Supabase Management API call
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        branch_name: branchName,
        from: "main"
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Branch creation failed:", errorText);
      return new Response("Failed to create preview branch", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 5) Return created branch
    return new Response(JSON.stringify({ branch: branchName }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Unexpected server error", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
