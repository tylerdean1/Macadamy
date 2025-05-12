// supabase/functions/clone_demo_environment/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { method } = req;

  // Handle CORS preflight
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
    // 1) Generate a random branch name
    const randomId = crypto.randomUUID().slice(0, 8);
    const branchName = `demo_${randomId}`;

    // 2) Read project ref and API key from Edge Function env vars
    const projectRef = Deno.env.get("SUPABASE_PROJECT_REF")!;
    const apiKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 3) Call Supabase Management API to create the preview branch
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/branches`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          name: branchName,
          from: "demo-template"
        })
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Branch creation failed:", errorText);
      return new Response("Failed to create preview branch", {
        status: 500
      });
    }

    // 4) Return the new branch name
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
