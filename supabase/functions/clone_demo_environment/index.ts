import { serve } from "server";
import { createClient } from "supabase";

serve(async (req: Request) => {
  const { method } = req;

  // Handle preflight request
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://www.macadamy.io",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { session_id, user_id } = await req.json();

    if (!session_id || !user_id) {
      return new Response("Missing session_id or user_id", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "https://www.macadamy.io" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const base_user_id = "00000000-0000-0000-0000-000000000000";

    const { data: baseProfile, error: baseError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", base_user_id)
      .single();

    if (baseError || !baseProfile?.organization_id) {
      console.error(baseError);
      return new Response("Original demo contract not found", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "https://www.macadamy.io" },
      });
    }

    const { data: contractData, error: contractError } = await supabase
      .from("contracts")
      .select("id")
      .eq("created_by", base_user_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (contractError || !contractData?.id) {
      console.error(contractError);
      return new Response("Original demo contract not found", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "https://www.macadamy.io" },
      });
    }

    const { error: rpcError } = await supabase.rpc("create_clone_for_test_user", {
      session_id,
      user_id,
      base_contract_id: contractData.id,
      base_organization_id: baseProfile.organization_id,
    });

    if (rpcError) {
      console.error(rpcError);
      return new Response("Failed to clone demo data", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "https://www.macadamy.io" },
      });
    }

    return new Response("Demo environment cloned successfully", {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "https://www.macadamy.io" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Unexpected error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "https://www.macadamy.io" },
    });
  }
});
