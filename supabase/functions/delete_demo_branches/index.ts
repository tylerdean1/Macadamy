import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface Branch {
  name: string;
  created_at: string;
}

serve(async () => {
  try {
    const projectRef = "koaxmrtrzhilnzjbiybr"; // Hardcoded project ref
    const apiKey = Deno.env.get("PLATFORM_TOKEN");

    if (!projectRef || !apiKey) {
      console.error("Missing PROJECT_REF or PLATFORM_TOKEN");
      return new Response("Missing environment configuration", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const listRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/branches`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!listRes.ok) {
      console.error("Failed to list branches:", await listRes.text());
      return new Response("Error listing branches", {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const branches: Branch[] = await listRes.json();

    const cutoff = Date.now() - 12 * 60 * 60 * 1000;

    const oldDemos = branches.filter((b) =>
      b.name.startsWith("demo_") && new Date(b.created_at).getTime() < cutoff
    );

    await Promise.all(
      oldDemos.map((b) =>
        fetch(`https://api.supabase.com/v1/projects/${projectRef}/branches/${b.name}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        })
      )
    );

    return new Response(JSON.stringify({
      deleted_branches: oldDemos.map((b) => b.name)
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response("Unexpected server error", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
