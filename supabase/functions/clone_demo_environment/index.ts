import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { method } = req;

  // 1) CORS preflight
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
    // 2) Extract the session_id from the request
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response("Missing session_id", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    // 3) Env-vars from Dashboard → Project Settings & Functions → Settings
    const projectRef = Deno.env.get("SUPABASE_PROJECT_REF")!;
    const apiKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const branchName = `demo_${session_id.slice(0, 8)}`;

    // 4) Call Supabase Management API to create the preview branch
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
      return new Response("Failed to create preview branch", { status: 500 });
    }

    // 5) Return the new branch name
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
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
});