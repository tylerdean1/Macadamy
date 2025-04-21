// supabase/functions/clone_demo_environment/index.ts

import { serve } from "server";
import { createClient } from "supabase";

serve(async (req) => {
  const { session_id, user_id } = await req.json();

  if (!session_id || !user_id) {
    return new Response("Missing session_id or user_id", { status: 400 });
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
    return new Response("Original demo contract not found", { status: 500 });
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
    return new Response("Original demo contract not found", { status: 500 });
  }

  const { error: rpcError } = await supabase.rpc("create_clone_for_test_user", {
    session_id,
    user_id,
    base_contract_id: contractData.id,
    base_organization_id: baseProfile.organization_id,
  });

  if (rpcError) {
    console.error(rpcError);
    return new Response("Failed to clone demo data", { status: 500 });
  }

  return new Response("Demo environment cloned successfully", { status: 200 });
});
