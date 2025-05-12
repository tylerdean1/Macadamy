import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req: Request) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    // 1) read project settings
    const projectRef = Deno.env.get("SUPABASE_PROJECT_REF")!;
    const apiKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 2) list all branches
    const listRes = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/branches`,
      { headers: { "Authorization": `Bearer ${apiKey}` } }
    );
    if (!listRes.ok) {
      console.error("Failed to list branches:", await listRes.text());
      return new Response("Error listing branches", { status: 500 });
    }
    const branches: Array<{ name: string; created_at: string }> = await listRes.json();

    // 3) pick those older than 12h whose name starts with "demo_"
    const cutoff = Date.now() - 12 * 60 * 60 * 1000;
    const oldDemos = branches.filter(b =>
      b.name.startsWith("demo_") &&
      new Date(b.created_at).getTime() < cutoff
    );

    // 4) delete each old demo branch
    await Promise.all(oldDemos.map(b =>
      fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/branches/${b.name}`,
        {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${apiKey}` }
        }
      )
    ));

    // 5) respond with what was deleted
    return new Response(
      JSON.stringify({ deleted_branches: oldDemos.map(b => b.name) }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response("Unexpected server error", { status: 500 });
  }
});