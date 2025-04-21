// supabase/functions/create_clone_for_test_user/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { session_id, user_id } = await req.json();

  if (!session_id || !user_id) {
    return new Response("Missing session_id or user_id", { status: 400 });
  }

  const deploymentId = Deno.env.get("DENO_DEPLOYMENT_ID");

  const url = deploymentId
    ? "https://koaxmrtrzhilnzjbiybr.functions.supabase.co/clone_demo_environment"
    : "http://localhost:54321/functions/v1/clone_demo_environment";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, user_id }),
  });

  if (!response.ok) {
    const text = await response.text();
    return new Response(`Clone failed: ${text}`, { status: 500 });
  }

  return new Response("Demo clone triggered successfully", { status: 200 });
});
